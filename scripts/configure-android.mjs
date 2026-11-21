import fs from 'fs';
import path from 'path';

const androidDir = path.resolve('android');
const appDir = path.join(androidDir, 'app');
const resDir = path.join(appDir, 'src', 'main', 'res');
const manifestPath = path.join(appDir, 'src', 'main', 'AndroidManifest.xml');
const buildGradlePath = path.join(appDir, 'build.gradle');
const stylesPath = path.join(resDir, 'values', 'styles.xml');

if (!fs.existsSync(androidDir)) {
  console.error('android/ directory not found. Run `npx cap add android` first.');
  process.exit(1);
}

// 1. Configure AndroidManifest.xml: lock portrait orientation for one-thumb gameplay
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');
  if (!manifest.includes('android:screenOrientation=')) {
    manifest = manifest.replace(
      /android:name="\.MainActivity"/,
      'android:name=".MainActivity"\n            android:screenOrientation="portrait"'
    );
    fs.writeFileSync(manifestPath, manifest, 'utf8');
    console.log('Configured portrait orientation in AndroidManifest.xml');
  }
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

// 3. Apply deep obsidian cosmic theme (#060A16) to eliminate white launch flash
if (fs.existsSync(stylesPath)) {
  const stylesXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#060A16</item>
        <item name="colorPrimaryDark">#060A16</item>
        <item name="colorAccent">#FBBF24</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">#060A16</item>
        <item name="android:statusBarColor">#060A16</item>
        <item name="android:navigationBarColor">#060A16</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">#060A16</item>
        <item name="windowSplashScreenBackground">#060A16</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`;
  fs.writeFileSync(stylesPath, stylesXml, 'utf8');
  console.log('Configured dark cosmic theme in styles.xml');
}

// 4. Write custom Pocket Orbit adaptive vector launcher icon
const drawableDir = path.join(resDir, 'drawable');
const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(drawableDir, { recursive: true });
fs.mkdirSync(valuesDir, { recursive: true });

const iconBgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#060A16</color>
</resources>
`;
fs.writeFileSync(path.join(valuesDir, 'ic_launcher_background.xml'), iconBgXml, 'utf8');

const iconFgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">

    <!-- Outer cool cerulean orbital track -->
    <path
        android:pathData="M54,22 A32,32 0 1,1 53.99,22 Z"
        android:strokeWidth="2.2"
        android:strokeColor="#38BDF8"
        android:strokeAlpha="0.55"
        android:fillColor="#00000000" />

    <!-- Inner warm amber orbital track -->
    <path
        android:pathData="M54,34 A20,20 0 1,1 53.99,34 Z"
        android:strokeWidth="2.4"
        android:strokeColor="#FBBF24"
        android:strokeAlpha="0.85"
        android:fillColor="#00000000" />

    <!-- Central cerulean planet -->
    <path
        android:pathData="M54,43 A11,11 0 1,1 53.99,43 Z"
        android:fillColor="#38BDF8" />

    <!-- Inner fast satellite (amber) -->
    <path
        android:pathData="M74,50 A4,4 0 1,1 73.99,50 Z"
        android:fillColor="#FDE68A" />

    <!-- Outer collectible star dot (ice blue) -->
    <path
        android:pathData="M31,29 A3.2,3.2 0 1,1 30.99,29 Z"
        android:fillColor="#BAE6FD" />
</vector>
`;
fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), iconFgXml, 'utf8');

const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
fs.mkdirSync(anyDpiDir, { recursive: true });
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`;
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveIconXml, 'utf8');
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveIconXml, 'utf8');
console.log('Generated custom Pocket Orbit adaptive vector icon');
