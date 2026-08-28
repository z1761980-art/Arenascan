#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TOOLS_DIR="${ROOT}/.build_tools"
JAVA_DIR="${TOOLS_DIR}/java"
AAPT_DIR="${TOOLS_DIR}/aapt2"
MINAPK_DIR="${TOOLS_DIR}/minapk"
OUT_DIR="${ROOT}/native_apk/build"
APK_OUT="${ROOT}/apk/ProScanAI-rescue.apk"

mkdir -p "$TOOLS_DIR" "$OUT_DIR" "${ROOT}/apk"

ensure_pkg() {
  local pkg="$1" name="$2" subdir="$3"
  if [ ! -d "$subdir" ]; then
    mkdir -p "$TOOLS_DIR/.npm"
    pushd "$TOOLS_DIR/.npm" >/dev/null
    npm pack "$pkg" >/dev/null
    local tgz
    tgz=$(ls -t *.tgz | head -n1)
    mkdir -p "$subdir"
    tar -xzf "$tgz" -C "$subdir"
    popd >/dev/null
  fi
}

ensure_pkg javajre-linux-64 java "$JAVA_DIR"
ensure_pkg aaptjs3 aapt2 "$AAPT_DIR"
ensure_pkg @drxiaozhi/minapk minapk "$MINAPK_DIR"

JAVA_HOME="${JAVA_DIR}/package/jre"
AAPT2="${AAPT_DIR}/package/bin/x64/linux/aapt2"
ANDROID_JAR="${MINAPK_DIR}/package/tools/android.jar"
D8_JAR="${MINAPK_DIR}/package/tools/d8.jar"
APKSIGNER_JAR="${MINAPK_DIR}/package/tools/apksigner.jar"
KEYSTORE="${MINAPK_DIR}/package/tools/debug.keystore"

chmod +x "$AAPT2"
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR/classes" "$OUT_DIR/dex"

if [ -d "${ROOT}/native_apk/res" ]; then
  "$AAPT2" compile --dir "${ROOT}/native_apk/res" -o "$OUT_DIR/res.zip"
  RES_ARGS=("$OUT_DIR/res.zip")
else
  RES_ARGS=()
fi

"$AAPT2" link \
  -o "$OUT_DIR/base.apk" \
  --manifest "${ROOT}/native_apk/AndroidManifest.xml" \
  --java "$OUT_DIR/gen" \
  --min-sdk-version 23 \
  --target-sdk-version 33 \
  -I "$ANDROID_JAR" \
  "${RES_ARGS[@]}"

find "${ROOT}/native_apk/src" "$OUT_DIR/gen" -name '*.java' > "$OUT_DIR/sources.txt"
"$JAVA_HOME/bin/javac" -encoding UTF-8 -source 8 -target 8 -bootclasspath "$ANDROID_JAR" -d "$OUT_DIR/classes" @"$OUT_DIR/sources.txt"
(
  cd "$OUT_DIR/classes"
  "$JAVA_HOME/bin/jar" cf ../classes.jar .
)
"$JAVA_HOME/bin/java" -cp "$D8_JAR" com.android.tools.r8.D8 \
  --lib "$ANDROID_JAR" \
  --output "$OUT_DIR/dex" \
  "$OUT_DIR/classes.jar"
(
  cd "$OUT_DIR/dex"
  "$JAVA_HOME/bin/jar" uf ../base.apk classes.dex
)
"$JAVA_HOME/bin/java" -jar "$APKSIGNER_JAR" sign \
  --ks "$KEYSTORE" \
  --ks-key-alias androiddebugkey \
  --ks-pass pass:android \
  --key-pass pass:android \
  --out "$APK_OUT" \
  "$OUT_DIR/base.apk"

echo "Built $APK_OUT"
