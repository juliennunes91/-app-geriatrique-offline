package io.github.juliennunes91.geriaassist

import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import androidx.webkit.WebViewAssetLoader
import java.io.File
import java.io.FileOutputStream

/**
 * Coquille native de GeriaAssist.
 *
 * L'application web est embarquée dans les assets et servie via
 * [WebViewAssetLoader] sur l'origine https://appassets.androidplatform.net.
 * On ne charge PAS en file:// : cette origine opaque interdit les workers et le
 * WASM, dont dépend l'OCR Tesseract.
 *
 * Trois adaptations sont nécessaires par rapport à un navigateur :
 *  1. les exports (PDF, JSON) reposent sur un blob: + clic d'ancre, que la
 *     WebView ignore silencieusement → interception JS + écriture native ;
 *  2. l'OCR passe par <input type="file"> → onShowFileChooser + appareil photo ;
 *  3. localStorage exige domStorageEnabled.
 */
class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView

    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var pendingCameraUri: Uri? = null

    private lateinit var fileChooserLauncher: ActivityResultLauncher<Intent>

    companion object {
        private const val ORIGIN = "https://appassets.androidplatform.net"
        private const val START_URL = "$ORIGIN/assets/index.html"

        /**
         * Intercepte les téléchargements déclenchés par une ancre `download` +
         * URL blob: (html2pdf/jsPDF, exports JSON). Sans cela, le bouton PDF ne
         * produit rien du tout dans une WebView.
         *
         * jsPDF déclenche selon les versions `a.click()` ou
         * `a.dispatchEvent(new MouseEvent('click'))` : les deux sont couverts.
         */
        private const val DOWNLOAD_SHIM = """
        (function () {
          if (!window.GeriaBridge || window.__geriaDownloadShim) return;
          window.__geriaDownloadShim = true;
          var A = HTMLAnchorElement.prototype;
          var origClick = A.click, origDispatch = A.dispatchEvent;
          function intercept(a) {
            try {
              var href = a.getAttribute('href') || '';
              if (!a.hasAttribute('download') || href.indexOf('blob:') !== 0) return false;
              var name = a.getAttribute('download') || 'geriaassist';
              fetch(href).then(function (r) { return r.blob(); }).then(function (b) {
                var fr = new FileReader();
                fr.onload = function () {
                  var s = String(fr.result);
                  GeriaBridge.saveBase64(name, s.slice(s.indexOf(',') + 1), b.type || 'application/octet-stream');
                };
                fr.readAsDataURL(b);
              }).catch(function (e) { GeriaBridge.reportError(String(e)); });
              return true;
            } catch (e) { return false; }
          }
          A.click = function () { if (intercept(this)) return; return origClick.apply(this, arguments); };
          A.dispatchEvent = function (ev) {
            if (ev && ev.type === 'click' && intercept(this)) return true;
            return origDispatch.apply(this, arguments);
          };
        })();
        """
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        fileChooserLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            val cb = fileChooserCallback
            fileChooserCallback = null
            if (cb == null) return@registerForActivityResult
            val uris: Array<Uri>? = when {
                result.resultCode != Activity.RESULT_OK -> null
                result.data?.data != null -> arrayOf(result.data!!.data!!)
                // Retour de l'appareil photo : l'Intent est vide, l'image a été
                // écrite dans l'URI fourni en amont.
                pendingCameraUri != null -> arrayOf(pendingCameraUri!!)
                else -> null
            }
            pendingCameraUri = null
            cb.onReceiveValue(uris)
        }

        val loader = WebViewAssetLoader.Builder()
            .setDomain("appassets.androidplatform.net")
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView = WebView(this).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true          // localStorage : préférences
                loadWithOverviewMode = true
                useWideViewPort = true
                builtInZoomControls = true
                displayZoomControls = false
                allowFileAccess = false           // tout passe par l'asset loader
                allowContentAccess = false
                mediaPlaybackRequiresUserGesture = false
                // Permet à l'app web de savoir qu'elle tourne dans la coquille
                // (masquage du bouton « UI Moderne », pas d'enregistrement du SW).
                userAgentString = "$userAgentString GeriaAssistApp/${BuildConfig.VERSION_NAME}"
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView, request: WebResourceRequest
                ): WebResourceResponse? = loader.shouldInterceptRequest(request.url)

                override fun shouldOverrideUrlLoading(
                    view: WebView, request: WebResourceRequest
                ): Boolean {
                    val url = request.url
                    // Navigation interne : dans la WebView. Lien externe : navigateur.
                    if (url.toString().startsWith(ORIGIN)) return false
                    return try {
                        startActivity(Intent(Intent.ACTION_VIEW, url))
                        true
                    } catch (e: ActivityNotFoundException) {
                        true
                    }
                }

                override fun onPageFinished(view: WebView, url: String) {
                    view.evaluateJavascript(DOWNLOAD_SHIM, null)
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    view: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    params: FileChooserParams?
                ): Boolean = openFileChooser(filePathCallback, params)
            }

            // Téléchargements « classiques » (non blob) — filet de sécurité.
            setDownloadListener { url, _, contentDisposition, mimeType, _ ->
                if (url.startsWith("data:")) {
                    val comma = url.indexOf(',')
                    if (comma > 0) {
                        val meta = url.substring(0, comma)
                        val data = url.substring(comma + 1)
                        val name = guessName(contentDisposition, mimeType)
                        if (meta.contains(";base64")) {
                            saveBytes(name, Base64.decode(data, Base64.DEFAULT), mimeType)
                        }
                    }
                }
            }

            addJavascriptInterface(DownloadBridge(), "GeriaBridge")
        }

        setContentView(webView)
        webView.loadUrl(START_URL)

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) webView.goBack() else finish()
            }
        })

        // Vérification de mise à jour : silencieuse hors ligne, au plus 1 fois/24 h.
        UpdateChecker(this).checkInBackground()
    }

    // ── Sélecteur de fichier (OCR : galerie ou appareil photo) ───────────────
    private fun openFileChooser(
        callback: ValueCallback<Array<Uri>>?,
        params: WebChromeClient.FileChooserParams?
    ): Boolean {
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = callback

        val contentIntent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        val cameraIntent = buildCameraIntent()
        val chooser = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, contentIntent)
            if (cameraIntent != null) {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, arrayOf(cameraIntent))
            }
        }

        return try {
            fileChooserLauncher.launch(chooser)
            true
        } catch (e: ActivityNotFoundException) {
            fileChooserCallback = null
            pendingCameraUri = null
            false
        }
    }

    private fun buildCameraIntent(): Intent? {
        return try {
            val dir = File(cacheDir, "captures").apply { mkdirs() }
            val photo = File(dir, "ordonnance_${System.currentTimeMillis()}.jpg")
            val uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", photo)
            pendingCameraUri = uri
            Intent(MediaStore.ACTION_IMAGE_CAPTURE).apply {
                putExtra(MediaStore.EXTRA_OUTPUT, uri)
                addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            }.takeIf { it.resolveActivity(packageManager) != null }
        } catch (e: Exception) {
            pendingCameraUri = null
            null
        }
    }

    // ── Pont de téléchargement ───────────────────────────────────────────────
    inner class DownloadBridge {
        @android.webkit.JavascriptInterface
        fun saveBase64(fileName: String, base64: String, mimeType: String) {
            try {
                val bytes = Base64.decode(base64, Base64.DEFAULT)
                saveBytes(sanitize(fileName), bytes, mimeType)
            } catch (e: Exception) {
                runOnUiThread { toast(getString(R.string.export_failed)) }
            }
        }

        @android.webkit.JavascriptInterface
        fun reportError(message: String) {
            runOnUiThread { toast(getString(R.string.export_failed)) }
        }
    }

    private fun sanitize(name: String): String =
        name.replace(Regex("[\\\\/:*?\"<>|]"), "_").ifBlank { "geriaassist" }

    private fun guessName(contentDisposition: String?, mime: String?): String {
        val fromHeader = contentDisposition
            ?.substringAfter("filename=", "")
            ?.trim('"', ' ')
            ?.takeIf { it.isNotBlank() }
        val ext = when {
            mime?.contains("pdf") == true -> ".pdf"
            mime?.contains("json") == true -> ".json"
            else -> ""
        }
        return sanitize(fromHeader ?: "geriaassist_${System.currentTimeMillis()}$ext")
    }

    /**
     * Écrit le fichier exporté. Android 10+ : MediaStore (Téléchargements,
     * visible dans l'app Fichiers, sans permission). Android 8-9 : répertoire
     * externe de l'application, également sans permission.
     */
    private fun saveBytes(fileName: String, bytes: ByteArray, mimeType: String?): Uri? {
        val mime = mimeType?.takeIf { it.isNotBlank() } ?: "application/octet-stream"
        return try {
            val uri: Uri
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, fileName)
                    put(MediaStore.Downloads.MIME_TYPE, mime)
                    put(MediaStore.Downloads.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/GeriaAssist")
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }
                val resolver = contentResolver
                uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                    ?: throw IllegalStateException("insert MediaStore refusé")
                resolver.openOutputStream(uri)?.use { it.write(bytes) }
                    ?: throw IllegalStateException("flux indisponible")
                values.clear()
                values.put(MediaStore.Downloads.IS_PENDING, 0)
                resolver.update(uri, values, null, null)
            } else {
                val dir = File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "").apply { mkdirs() }
                val out = File(dir, fileName)
                FileOutputStream(out).use { it.write(bytes) }
                uri = FileProvider.getUriForFile(this, "$packageName.fileprovider", out)
            }
            runOnUiThread { toast(getString(R.string.export_saved, fileName)) }
            uri
        } catch (e: Exception) {
            runOnUiThread { toast(getString(R.string.export_failed)) }
            null
        }
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_LONG).show()

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
