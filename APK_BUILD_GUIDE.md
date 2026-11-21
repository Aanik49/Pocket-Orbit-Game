# Building Pocket Orbit APK via GitHub (No Android Studio Required)

This repository includes an automated **GitHub Actions** pipeline (`.github/workflows/build-apk.yml`) that compiles the game into a ready-to-install Android `.apk` in the cloud.

## Steps to Get Your APK

1. **Push this project to a GitHub repository**
   - Use the **Export to GitHub** / download option to upload these files to a new GitHub repo (branch `main` or `master`).
2. **Wait for the automatic cloud build (~2–3 minutes)**
   - Open your GitHub repository and click the **Actions** tab.
   - You will see **Build Android APK** running automatically (you can also trigger it manually anytime by clicking **Build Android APK → Run workflow**).
3. **Download the `.apk`**
   - Click the completed workflow run.
   - Scroll down to **Artifacts** and download **`PocketOrbit-APK`**.
   - Unzip the downloaded archive to get `PocketOrbit-v1.0.<number>.apk`.
4. **Install on your Android phone**
   - Transfer the `.apk` to your phone (or download it directly in your phone's browser from GitHub).
   - Tap the `.apk` file to install. If Android prompts you, enable **Install unknown apps** for your browser/file manager.

## Optional: Create a GitHub Release with Direct APK Download
Push a git tag starting with `v` (for example `v1.0.0`):
```bash
git tag v1.0.0
git push origin v1.0.0
```
GitHub will automatically create a Release with the `.apk` attached as a direct download link.
