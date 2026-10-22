plugins {
    id("com.android.application")
}

android {
    namespace = "com.dontgetmad.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.dontgetmad.game" // D1: permanent after the first upload
        minSdk = 24 // Android 7.0, as KAJ
        targetSdk = 36 // Google Play requires 36 since 31 Aug 2026 (D3, checked 16 Oct 2026)
        versionCode = 3 // 2 (1.0.1) was uploaded to Google Play from the owner's PC on 22 Oct 2026
        versionName = "1.1.0"
    }

    // R8 shrinks the Java part, as KAJ; the game itself is the web page in assets, which R8 does not touch.
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("androidx.activity:activity:1.10.1")
    implementation("androidx.webkit:webkit:1.17.1")
}
