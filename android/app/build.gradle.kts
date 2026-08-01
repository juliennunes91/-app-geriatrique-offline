plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Version : passée par la CI (-PappVersionName / -PappVersionCode), sinon valeurs
// de repli pour un build local. Le versionName DOIT correspondre au tag de la
// Release, c'est lui que compare la vérification de mise à jour.
val appVersionName: String = (project.findProperty("appVersionName") as String?) ?: "0.0.0-dev"
val appVersionCode: Int = ((project.findProperty("appVersionCode") as String?) ?: "1").toInt()

// ── Assets web ───────────────────────────────────────────────────────────────
// Source unique de vérité : les fichiers du dépôt. On les copie dans les assets
// au moment du build plutôt que d'en committer une seconde copie (16 Mo).
val webRoot: File = rootProject.projectDir.parentFile
val webAssetsDir = layout.buildDirectory.dir("generated/webassets")

val copyWebApp by tasks.registering(Copy::class) {
    description = "Copie l'application web dans les assets de l'APK"
    into(webAssetsDir)

    from(webRoot) {
        include("index.html", "offline.html", "manifest.json")
        include("*.js")
        include("*.css")
        // Harnais de test : jamais embarqués.
        exclude("tests.js", "tests_*.js", "oracle_harness.js", "*.cjs")
        // UI moderne : dépend de Tailwind CDN + Google Fonts, donc inutilisable
        // hors ligne. L'APK embarque uniquement l'UI classique.
        exclude("geria-shell.js", "geria-styles.css")
        // Service worker : son cache.addAll() est atomique et référence le moteur
        // Tesseract non-SIMD qu'on retire ci-dessous → il échouerait en bloc.
        // Inutile de toute façon : les assets sont déjà locaux dans l'APK.
        exclude("sw.js")
    }
    from(webRoot.resolve("lib")) {
        into("lib")
        include("bootstrap.min.css", "bootstrap.bundle.min.js")
        include("html2pdf.bundle.min.js")
        include("tesseract.min.js", "tesseract-worker.min.js")
        // Un seul moteur : le SIMD est celui référencé par ocr_module.js.
        include("tesseract-core-simd.wasm.js")
        include("tessdata/**")
    }

    doLast {
        val n = fileTree(webAssetsDir).files.size
        logger.lifecycle("Assets web embarqués : $n fichiers")
    }
}

android {
    namespace = "io.github.juliennunes91.geriaassist"
    compileSdk = 35

    defaultConfig {
        applicationId = "io.github.juliennunes91.geriaassist"
        minSdk = 26
        targetSdk = 35
        versionCode = appVersionCode
        versionName = appVersionName
        resourceConfigurations += listOf("fr", "en")
    }

    sourceSets {
        getByName("main") {
            assets.srcDir(webAssetsDir)
        }
    }

    // Signature release : uniquement si les secrets sont fournis par la CI.
    // Sinon le build release retombe sur la clé debug (APK installable, mais non
    // upgradable vers une future version signée en release).
    val storeFilePath = System.getenv("KEYSTORE_PATH")
    val hasReleaseKey = !storeFilePath.isNullOrBlank() && File(storeFilePath).exists()

    signingConfigs {
        if (hasReleaseKey) {
            create("release") {
                storeFile = File(storeFilePath!!)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (hasReleaseKey) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }

    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

// Les assets doivent être copiés avant que l'APK ne soit assemblé.
tasks.named("preBuild").configure { dependsOn(copyWebApp) }

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.core:core-ktx:1.13.1")
}
