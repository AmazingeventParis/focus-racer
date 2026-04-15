package app.swipego.focusracer;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.graphics.Color;
import android.view.Window;
import android.Manifest;
import android.content.pm.PackageManager;
import android.util.Log;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "FocusRacer";
    private static final int NOTIFICATION_PERMISSION_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Edge-to-edge dark theme
        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("#042F2E"));
        window.setNavigationBarColor(Color.parseColor("#042F2E"));

        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);

        // Request notification permission on Android 13+
        requestNotificationPermission();
    }

    @Override
    public void onResume() {
        super.onResume();

        WebView webView = getBridge().getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            settings.setRenderPriority(WebSettings.RenderPriority.HIGH);

            // Add JS bridge for ntfy push registration
            webView.addJavascriptInterface(new NtfyBridge(), "FocusRacerNative");

            // Inject push notification registration script
            injectPushRegistration(webView);
        }
    }

    /**
     * Injects JS that registers the device for push notifications.
     * Calls the API to get the ntfy topic, then starts the background service.
     */
    private void injectPushRegistration(WebView webView) {
        String js = "javascript:(function() {" +
            "if (window.__pushRegistered) return;" +
            "fetch('/api/notifications/device-token', {" +
            "  method: 'POST'," +
            "  headers: {'Content-Type': 'application/json'}," +
            "  body: JSON.stringify({platform: 'android'})" +
            "}).then(function(r) { return r.json(); })" +
            ".then(function(data) {" +
            "  if (data.success && data.ntfyUrl && data.topic) {" +
            "    window.FocusRacerNative.startPushService(data.ntfyUrl, data.topic);" +
            "    window.__pushRegistered = true;" +
            "    console.log('[Push] Registered: ' + data.topic);" +
            "  }" +
            "}).catch(function(e) { console.warn('[Push] Registration failed:', e); });" +
            "})();";

        webView.evaluateJavascript(js, null);
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                    != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                    this,
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    NOTIFICATION_PERMISSION_CODE
                );
            }
        }
    }

    /**
     * JS bridge exposed as window.FocusRacerNative in the WebView.
     */
    public class NtfyBridge {
        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }

        @JavascriptInterface
        public void startPushService(String ntfyUrl, String topic) {
            Log.d(TAG, "Starting push service for topic: " + topic);
            Intent intent = new Intent(MainActivity.this, NtfyService.class);
            intent.putExtra("ntfy_url", ntfyUrl);
            intent.putExtra("topic", topic);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
        }

        @JavascriptInterface
        public void stopPushService() {
            Log.d(TAG, "Stopping push service");
            Intent intent = new Intent(MainActivity.this, NtfyService.class);
            stopService(intent);
        }
    }
}
