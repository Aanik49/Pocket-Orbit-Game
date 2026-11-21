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
    <color name="ic_launcher_background">#070B1E</color>
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

// 6. Apply deep obsidian cosmic theme (#070B1E) + Android 12+ splash icon
const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#070B1E</item>
        <item name="colorPrimaryDark">#070B1E</item>
        <item name="colorAccent">#FBBF24</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">#070B1E</item>
        <item name="android:statusBarColor">#070B1E</item>
        <item name="android:navigationBarColor">#070B1E</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">#070B1E</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash_logo</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`;
fs.writeFileSync(stylesPath, stylesXml, 'utf8');
console.log('Configured Pocket Orbit adaptive icons, splash icon, and cosmic theme.');
