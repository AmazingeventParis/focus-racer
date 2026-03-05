# Add project specific ProGuard rules here.

# Keep JS interface for WebView bridge
-keepclassmembers class app.swipego.focusracer.MainActivity$FcmBridge {
   public *;
}

# Keep Firebase Messaging
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep Capacitor
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
