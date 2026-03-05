# Add project specific ProGuard rules here.

# Keep JS interface for WebView bridge
-keepclassmembers class app.swipego.focusracer.MainActivity$NtfyBridge {
   public *;
}

# Keep ntfy service
-keep class app.swipego.focusracer.NtfyService { *; }

# Keep Capacitor
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin public class * { *; }
