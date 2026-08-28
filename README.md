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
