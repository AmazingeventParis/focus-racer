#!/bin/bash
# Build Focus Racer APK
# Usage: ./build.sh [debug|release]

set -e

MODE=${1:-debug}
cd "$(dirname "$0")"

export ANDROID_HOME=${ANDROID_HOME:-/home/coder/android-sdk}
export ANDROID_SDK_ROOT=$ANDROID_HOME

echo "=== Focus Racer Mobile Build ==="
echo "Mode: $MODE"

# Sync Capacitor
echo "-> Syncing Capacitor..."
npx cap sync android

# Build APK
echo "-> Building APK ($MODE)..."
if [ "$MODE" = "release" ]; then
  cd android && ./gradlew assembleRelease
  APK="android/app/build/outputs/apk/release/app-release.apk"
else
  cd android && ./gradlew assembleDebug
  APK="android/app/build/outputs/apk/debug/app-debug.apk"
fi
cd ..

# Copy to builds/
mkdir -p builds
cp "$APK" "builds/focus-racer-${MODE}.apk"

SIZE=$(du -h "builds/focus-racer-${MODE}.apk" | cut -f1)
echo ""
echo "=== Build complete ==="
echo "APK: builds/focus-racer-${MODE}.apk ($SIZE)"
