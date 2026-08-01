package io.github.juliennunes91.geriaassist

import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.widget.Toast
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

/**
 * Vérification de mise à jour au démarrage.
 *
 * Interroge l'API publique des Releases GitHub (le dépôt est public : aucun
 * jeton nécessaire). Conçue pour un outil hors ligne :
 *  - toute erreur réseau est ignorée en silence, jamais d'alerte à l'utilisateur ;
 *  - au plus une vérification par 24 h ;
 *  - avant d'installer, on compare les signatures : une mise à jour par-dessus
 *    une version signée différemment échoue toujours côté Android, autant le
 *    dire clairement plutôt que de laisser un échec incompréhensible.
 */
class UpdateChecker(private val activity: Activity) {

    companion object {
        private const val API =
            "https://api.github.com/repos/juliennunes91/-app-geriatrique-offline/releases/latest"
        private const val PREFS = "geria_update"
        private const val KEY_LAST_CHECK = "last_check"
        private const val INTERVAL_MS = 24L * 60 * 60 * 1000
        private const val TIMEOUT_MS = 10_000
    }

    fun checkInBackground() {
        val prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val last = prefs.getLong(KEY_LAST_CHECK, 0L)
        if (System.currentTimeMillis() - last < INTERVAL_MS) return

        Thread {
            try {
                val release = fetchLatestRelease() ?: return@Thread
                prefs.edit().putLong(KEY_LAST_CHECK, System.currentTimeMillis()).apply()

                val latest = release.optString("tag_name").removePrefix("v")
                val apkUrl = findApkUrl(release) ?: return@Thread
                if (latest.isBlank() || !isNewer(latest, currentVersion())) return@Thread

                activity.runOnUiThread { promptUpdate(latest, apkUrl) }
            } catch (e: Exception) {
                // Hors ligne ou API indisponible : comportement normal pour un
                // outil offline, on ne dérange pas l'utilisateur.
            }
        }.apply { isDaemon = true }.start()
    }

    private fun currentVersion(): String =
        BuildConfig.VERSION_NAME.substringBefore('-')

    private fun fetchLatestRelease(): JSONObject? {
        val conn = (URL(API).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = TIMEOUT_MS
            readTimeout = TIMEOUT_MS
            setRequestProperty("Accept", "application/vnd.github+json")
            setRequestProperty("User-Agent", "GeriaAssist-Android")
        }
        return try {
            if (conn.responseCode != 200) return null
            JSONObject(conn.inputStream.bufferedReader().use { it.readText() })
        } finally {
            conn.disconnect()
        }
    }

    private fun findApkUrl(release: JSONObject): String? {
        val assets = release.optJSONArray("assets") ?: return null
        for (i in 0 until assets.length()) {
            val a = assets.optJSONObject(i) ?: continue
            val name = a.optString("name")
            if (name.endsWith(".apk", ignoreCase = true)) {
                return a.optString("browser_download_url").takeIf { it.isNotBlank() }
            }
        }
        return null
    }

    /** Comparaison numérique segment à segment : « 1.10 » > « 1.9 ». */
    private fun isNewer(candidate: String, current: String): Boolean {
        val a = candidate.split('.').mapNotNull { it.filter(Char::isDigit).toIntOrNull() }
        val b = current.split('.').mapNotNull { it.filter(Char::isDigit).toIntOrNull() }
        for (i in 0 until maxOf(a.size, b.size)) {
            val x = a.getOrElse(i) { 0 }
            val y = b.getOrElse(i) { 0 }
            if (x != y) return x > y
        }
        return false
    }

    private fun promptUpdate(version: String, apkUrl: String) {
        if (activity.isFinishing) return
        AlertDialog.Builder(activity)
            .setTitle(activity.getString(R.string.update_available, version))
            .setMessage(activity.getString(R.string.update_action))
            .setPositiveButton(R.string.update_action) { _, _ -> download(apkUrl) }
            .setNegativeButton(R.string.update_later, null)
            .show()
    }

    private fun download(apkUrl: String) {
        Toast.makeText(activity, R.string.update_downloading, Toast.LENGTH_SHORT).show()
        Thread {
            try {
                val dir = File(activity.cacheDir, "updates").apply { mkdirs() }
                dir.listFiles()?.forEach { it.delete() }
                val out = File(dir, "geriaassist-update.apk")

                var url = URL(apkUrl)
                var conn = (url.openConnection() as HttpURLConnection)
                conn.instanceFollowRedirects = true
                conn.connectTimeout = TIMEOUT_MS
                conn.readTimeout = 60_000
                conn.setRequestProperty("User-Agent", "GeriaAssist-Android")
                // GitHub redirige vers un domaine de stockage : suivre manuellement
                // si la redirection change de protocole (non suivie automatiquement).
                if (conn.responseCode in 301..308) {
                    val loc = conn.getHeaderField("Location")
                    conn.disconnect()
                    url = URL(loc)
                    conn = (url.openConnection() as HttpURLConnection)
                    conn.connectTimeout = TIMEOUT_MS
                    conn.readTimeout = 60_000
                    conn.setRequestProperty("User-Agent", "GeriaAssist-Android")
                }
                if (conn.responseCode != 200) throw IllegalStateException("HTTP ${conn.responseCode}")
                conn.inputStream.use { input -> FileOutputStream(out).use { input.copyTo(it) } }
                conn.disconnect()

                activity.runOnUiThread { install(out) }
            } catch (e: Exception) {
                activity.runOnUiThread {
                    Toast.makeText(activity, R.string.update_download_failed, Toast.LENGTH_LONG).show()
                }
            }
        }.apply { isDaemon = true }.start()
    }

    private fun install(apk: File) {
        // Une mise à jour dont la signature diffère est refusée par Android
        // (INSTALL_FAILED_UPDATE_INCOMPATIBLE). Cas concret ici : passage d'un
        // APK signé debug à un APK signé release.
        if (!signaturesMatch(apk)) {
            AlertDialog.Builder(activity)
                .setMessage(R.string.update_signature_mismatch)
                .setPositiveButton(android.R.string.ok, null)
                .show()
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !activity.packageManager.canRequestPackageInstalls()
        ) {
            // L'utilisateur doit d'abord autoriser l'installation depuis cette app.
            activity.startActivity(
                Intent(
                    Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:${activity.packageName}")
                )
            )
            return
        }

        val uri = FileProvider.getUriForFile(
            activity, "${activity.packageName}.fileprovider", apk
        )
        activity.startActivity(
            Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
            }
        )
    }

    /** Compare le certificat de signature de l'APK téléchargé au nôtre. */
    private fun signaturesMatch(apk: File): Boolean = try {
        val pm = activity.packageManager
        val flag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            PackageManager.GET_SIGNING_CERTIFICATES
        } else {
            @Suppress("DEPRECATION") PackageManager.GET_SIGNATURES
        }
        val incoming = pm.getPackageArchiveInfo(apk.absolutePath, flag)
        val mine = pm.getPackageInfo(activity.packageName, flag)
        val a = digestOf(incoming?.let { signaturesOf(it) })
        val b = digestOf(signaturesOf(mine))
        a != null && a == b
    } catch (e: Exception) {
        // Dans le doute, on laisse Android trancher au moment de l'installation.
        true
    }

    private fun signaturesOf(info: android.content.pm.PackageInfo): Array<android.content.pm.Signature>? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            info.signingInfo?.apkContentsSigners
        } else {
            @Suppress("DEPRECATION") info.signatures
        }

    private fun digestOf(sigs: Array<android.content.pm.Signature>?): String? {
        val first = sigs?.firstOrNull() ?: return null
        val md = MessageDigest.getInstance("SHA-256")
        return md.digest(first.toByteArray()).joinToString("") { "%02x".format(it) }
    }
}
