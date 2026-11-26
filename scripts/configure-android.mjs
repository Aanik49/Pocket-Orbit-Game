import fs from 'fs';
import path from 'path';

const androidDir = path.resolve('android');
const appDir = path.join(androidDir, 'app');
const resDir = path.join(appDir, 'src', 'main', 'res');
const manifestPath = path.join(appDir, 'src', 'main', 'AndroidManifest.xml');
const buildGradlePath = path.join(appDir, 'build.gradle');
const stylesPath = path.join(resDir, 'values', 'styles.xml');
const iconPackDir = path.resolve('resources', 'android-icons');

if (!fs.existsSync(androidDir)) {
  console.error('android/ directory not found. Run `npx cap add android` first.');
  process.exit(1);
}

// 1. Configure AndroidManifest.xml: portrait lock + explicit icon & label attributes
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android:screenOrientation=')) {
    manifest = manifest.replace(
      /android:name="\.MainActivity"/,
      'android:name=".MainActivity"\n            android:screenOrientation="portrait"'
    );
  }
  if (!manifest.includes('android:icon=')) {
    manifest = manifest.replace(
      /<application/,
      '<application\n        android:icon="@mipmap/ic_launcher"\n        android:roundIcon="@mipmap/ic_launcher_round"'
    );
  }
  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('Configured portrait orientation and launcher icons in AndroidManifest.xml');
}

// 2. Configure versionCode & versionName from GitHub Actions run number
if (fs.existsSync(buildGradlePath)) {
  const runNumber = Number(process.env.GITHUB_RUN_NUMBER || '1');
  const versionCode = Number.isFinite(runNumber) && runNumber > 0 ? runNumber : 1;
  const versionName = process.env.APP_VERSION || `1.0.${versionCode}`;

  let gradle = fs.readFileSync(buildGradlePath, 'utf8');
  gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  gradle = gradle.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  fs.writeFileSync(buildGradlePath, gradle, 'utf8');
  console.log(`Set Android versionCode=${versionCode}, versionName=${versionName}`);
}

// 3. Remove ALL default Capacitor launcher/splash resources first to prevent duplicates or default icon fallback
function purgeDefaultIcons(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      purgeDefaultIcons(fullPath);
    } else if (
      entry.name.startsWith('ic_launcher') ||
      entry.name === 'splash.png' ||
      entry.name === 'splash.webp'
    ) {
      fs.unlinkSync(fullPath);
    }
  }
}

purgeDefaultIcons(resDir);
console.log('Cleared default Capacitor launcher and splash resources');

// 4. Copy pre-generated Pocket Orbit game icons & splash across every Android density
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(iconPackDir)) {
  copyRecursive(iconPackDir, resDir);
  console.log('Copied pre-generated Pocket Orbit launcher & splash PNGs into android/app/src/main/res/');
} else {
  // Fallback if resources/android-icons is absent
  const fallbackIcon = path.resolve('public', 'icon-512.png');
  const fallbackAdaptive = path.resolve('public', 'icon-adaptive.png');
  if (fs.existsSync(fallbackIcon)) {
    for (const d of ['mipmap-mdpi', 'mipmap-hdpi', 'mipmap-xhdpi', 'mipmap-xxhdpi', 'mipmap-xxxhdpi']) {
      const target = path.join(resDir, d);
      fs.mkdirSync(target, { recursive: true });
      fs.copyFileSync(fallbackIcon, path.join(target, 'ic_launcher.png'));
      fs.copyFileSync(fallbackIcon, path.join(target, 'ic_launcher_round.png'));
      fs.copyFileSync(
        fs.existsSync(fallbackAdaptive) ? fallbackAdaptive : fallbackIcon,
        path.join(target, 'ic_launcher_foreground.png')
      );
    }
  }
}

// 5. Write Android 8+ Adaptive Icon XMLs & obsidian background color
const valuesDir = path.join(resDir, 'values');
const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
fs.mkdirSync(valuesDir, { recursive: true });
fs.mkdirSync(anyDpiDir, { recursive: true });

fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#080C38</color>
</resources>
`,
  'utf8'
);

const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveIconXml, 'utf8');
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveIconXml, 'utf8');

// 6. Apply cosmic navy theme (#080C38) with true edge-to-edge transparent system bars + cutout support
const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#080C38</item>
        <item name="colorPrimaryDark">#080C38</item>
        <item name="colorAccent">#F3C24F</item>
    </style>

    <style name="Base.AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:windowBackground">#080C38</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowDrawsSystemBarBackgrounds">true</item>
        <item name="android:statusBarColor">@android:color/transparent</item>
        <item name="android:navigationBarColor">@android:color/transparent</item>
        <item name="android:windowTranslucentStatus">false</item>
        <item name="android:windowTranslucentNavigation">false</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Base.AppTheme.NoActionBar" />

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">#080C38</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash_logo</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`;
fs.writeFileSync(stylesPath, stylesXml, 'utf8');

const valuesV28Dir = path.join(resDir, 'values-v28');
fs.mkdirSync(valuesV28Dir, { recursive: true });
fs.writeFileSync(
  path.join(valuesV28Dir, 'styles.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBar" parent="Base.AppTheme.NoActionBar">
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
    </style>
</resources>
`,
  'utf8'
);

const valuesV29Dir = path.join(resDir, 'values-v29');
fs.mkdirSync(valuesV29Dir, { recursive: true });
fs.writeFileSync(
  path.join(valuesV29Dir, 'styles.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme.NoActionBar" parent="Base.AppTheme.NoActionBar">
        <item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
        <item name="android:enforceNavigationBarContrast">false</item>
        <item name="android:enforceStatusBarContrast">false</item>
    </style>
</resources>
`,
  'utf8'
);

// 7. Patch MainActivity.java for true edge-to-edge immersive fullscreen & WebView safe-area inset injection
let appId = 'com.pocketorbit.game';
try {
  const capConfig = JSON.parse(fs.readFileSync(path.resolve('capacitor.config.json'), 'utf8'));
  if (capConfig && typeof capConfig.appId === 'string' && capConfig.appId.trim()) {
    appId = capConfig.appId.trim();
  }
} catch {
  // Use default appId
}

const mainActivityDir = path.join(appDir, 'src', 'main', 'java', ...appId.split('.'));
const mainActivityPath = path.join(mainActivityDir, 'MainActivity.java');
fs.mkdirSync(mainActivityDir, { recursive: true });

const mainActivityJava = `package ${appId};

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private float safeTopCss = 0f;
    private float safeBottomCss = 0f;
    private float safeLeftCss = 0f;
    private float safeRightCss = 0f;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        configureEdgeToEdgeFullscreen();
        setupSafeAreaInsetBridge();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemBars();
            pushSafeAreaToWebView();
        }
    }

    private void configureEdgeToEdgeFullscreen() {
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(Color.TRANSPARENT);
        window.setNavigationBarColor(Color.TRANSPARENT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams lp = window.getAttributes();
            lp.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(lp);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.setNavigationBarContrastEnforced(false);
            window.setStatusBarContrastEnforced(false);
        }

        hideSystemBars();
    }

    private void hideSystemBars() {
        Window window = getWindow();
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
        if (controller != null) {
            controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
            controller.hide(WindowInsetsCompat.Type.systemBars());
        }
    }

    private void setupSafeAreaInsetBridge() {
        View contentView = findViewById(android.R.id.content);
        View target = contentView != null ? contentView : getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(target, (view, windowInsets) -> {
            Insets safe = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            float density = getResources().getDisplayMetrics().density;
            if (density <= 0f) density = 1f;

            safeTopCss = safe.top / density;
            safeBottomCss = safe.bottom / density;
            safeLeftCss = safe.left / density;
            safeRightCss = safe.right / density;

            view.setPadding(0, 0, 0, 0);
            pushSafeAreaToWebView();
            return WindowInsetsCompat.CONSUMED;
        });

        ViewCompat.requestApplyInsets(target);
        mainHandler.postDelayed(this::pushSafeAreaToWebView, 250);
        mainHandler.postDelayed(this::pushSafeAreaToWebView, 900);
        mainHandler.postDelayed(this::pushSafeAreaToWebView, 2000);
    }

    private void pushSafeAreaToWebView() {
        if (this.bridge == null) return;
        WebView webView = this.bridge.getWebView();
        if (webView == null) return;

        final String js = String.format(
            java.util.Locale.US,
            "(function(){var r=document.documentElement.style;" +
            "r.setProperty('--android-safe-top','%.1fpx');" +
            "r.setProperty('--android-safe-bottom','%.1fpx');" +
            "r.setProperty('--android-safe-left','%.1fpx');" +
            "r.setProperty('--android-safe-right','%.1fpx');" +
            "})();",
            safeTopCss,
            safeBottomCss,
            safeLeftCss,
            safeRightCss
        );
        webView.post(() -> webView.evaluateJavascript(js, null));
    }
}
`;

fs.writeFileSync(mainActivityPath, mainActivityJava, 'utf8');
console.log('Configured Pocket Orbit icons, splash, edge-to-edge fullscreen styles, and MainActivity.java.');

