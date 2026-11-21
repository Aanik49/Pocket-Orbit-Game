import { execFileSync } from 'child_process';
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

// 3. Apply deep obsidian cosmic theme (#070B1E) to eliminate white launch flash
if (fs.existsSync(stylesPath)) {
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
        <item name="android:background">#070B1E</item>
        <item name="windowSplashScreenBackground">#070B1E</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>
`;
  fs.writeFileSync(stylesPath, stylesXml, 'utf8');
  console.log('Configured dark cosmic theme in styles.xml');
}

// 4. Install custom Pocket Orbit game icon across all Android launcher densities
const sourceSquare = path.resolve('public', 'icon-512.png');
const sourceAdaptive = path.resolve('public', 'icon-adaptive.png');
const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });

fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#070B1E</color>
</resources>
`,
  'utf8'
);

function hasImageMagick() {
  try {
    execFileSync('convert', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function writeResizedPng(srcPath, destPath, sizePx, makeCircle = false) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (hasImageMagick()) {
    if (makeCircle) {
      const half = Math.floor(sizePx / 2);
      execFileSync('convert', [
        srcPath,
        '-resize',
        `${sizePx}x${sizePx}!`,
        '(',
        '-size',
        `${sizePx}x${sizePx}`,
        'xc:none',
        '-fill',
        'white',
        '-draw',
        `circle ${half},${half} ${half},0`,
        ')',
        '-alpha',
        'set',
        '-compose',
        'DstIn',
        '-composite',
        destPath,
      ]);
    } else {
      execFileSync('convert', [srcPath, '-resize', `${sizePx}x${sizePx}!`, destPath]);
    }
  } else {
    fs.copyFileSync(srcPath, destPath);
  }
}

if (fs.existsSync(sourceSquare)) {
  const densities = [
    { dir: 'mipmap-mdpi', legacy: 48, fg: 108 },
    { dir: 'mipmap-hdpi', legacy: 72, fg: 162 },
    { dir: 'mipmap-xhdpi', legacy: 96, fg: 216 },
    { dir: 'mipmap-xxhdpi', legacy: 144, fg: 324 },
    { dir: 'mipmap-xxxhdpi', legacy: 192, fg: 432 },
  ];

  const adaptiveSrc = fs.existsSync(sourceAdaptive) ? sourceAdaptive : sourceSquare;

  for (const d of densities) {
    const targetDir = path.join(resDir, d.dir);
    writeResizedPng(sourceSquare, path.join(targetDir, 'ic_launcher.png'), d.legacy, false);
    writeResizedPng(sourceSquare, path.join(targetDir, 'ic_launcher_round.png'), d.legacy, true);
    writeResizedPng(adaptiveSrc, path.join(targetDir, 'ic_launcher_foreground.png'), d.fg, false);
  }

  // Ensure Android 8+ adaptive launcher XML uses the Pocket Orbit icon foreground & background
  const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  fs.mkdirSync(anyDpiDir, { recursive: true });
  const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveIconXml, 'utf8');
  fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveIconXml, 'utf8');
  console.log('Installed custom Pocket Orbit PNG game icon across all Android mipmap densities');
} else {
  console.warn('public/icon-512.png not found; keeping default launcher icon.');
}
