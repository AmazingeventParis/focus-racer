package app.swipego.focusracer;

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
import com.google.firebase.messaging.FirebaseMessaging;

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

        // Get FCM token
        FirebaseMessaging.getInstance().getToken()
            .addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Log.w(TAG, "FCM token fetch failed", task.getException());
                    return;
                }
                String token = task.getResult();
                Log.d(TAG, "FCM token: " + token);
                TokenStore.setToken(this, token);
            });
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

            // Add JS bridge for FCM token registration
            webView.addJavascriptInterface(new FcmBridge(), "FocusRacerNative");

            // Inject token registration script after page loads
            injectTokenRegistration(webView);
        }
    }

    private void injectTokenRegistration(WebView webView) {
        String token = TokenStore.getToken(this);
        if (token == null) return;

        // Inject JS that registers the FCM token with the server
        String js = "javascript:(function() {" +
            "if (window.__fcmTokenRegistered) return;" +
            "var token = '" + token.replace("'", "\\'") + "';" +
            "fetch('/api/notifications/device-token', {" +
            "  method: 'POST'," +
            "  headers: {'Content-Type': 'application/json'}," +
            "  body: JSON.stringify({token: token, platform: 'android'})" +
            "}).then(function(r) {" +
            "  if (r.ok) {" +
            "    window.__fcmTokenRegistered = true;" +
            "    console.log('[FCM] Token registered');" +
            "  }" +
            "}).catch(function(e) { console.warn('[FCM] Registration failed:', e); });" +
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
     * Allows the web app to retrieve the FCM token.
     */
    public class FcmBridge {
        @JavascriptInterface
        public String getFcmToken() {
            return TokenStore.getToken(MainActivity.this);
        }

        @JavascriptInterface
        public boolean isNativeApp() {
            return true;
        }
    }
}
