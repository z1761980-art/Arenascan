# ProScan AI

A rebuilt Flutter Android document-scanner project based on the Google Drive spec preview.

## What it does

- capture a page from the camera
- import a page from the gallery
- crop the page with native crop UI
- apply scan-style filters: Original, Magic Color, B&W, Grayscale
- tune brightness, contrast, and saturation
- extract text with on-device ML Kit OCR
- reorder/delete pages in a batch
- save named scan sessions locally
- export a multi-page PDF and share it

## Build notes

This repository intentionally commits a partial Android scaffold. GitHub Actions completes the platform boilerplate with:

```bash
flutter create . --platforms=android --org com.proscan --project-name proscan_ai
flutter pub get
flutter build apk --release
```

Every push to `arena/01a047c5-arenascan` runs `.github/workflows/build-apk.yml`, uploads the APK as an artifact, and updates the GitHub release tagged `latest-apk`.


## Rescue APK in this repo

Because GitHub workflow updates are blocked for the current Arena bot token in this session, a self-contained native Android rescue build is included too.

- Source: `native_apk/`
- Build script: `scripts/build_rescue_apk.sh`
- Downloadable APK committed to the repo: `apk/ProScanAI-rescue.apk`

This APK supports:
- capture from camera
- import from gallery
- 4-point crop handles
- Magic / B&W / Gray filters
- brightness / contrast / saturation adjustments
- multi-page session management
- save sessions locally
- export/share PDF
