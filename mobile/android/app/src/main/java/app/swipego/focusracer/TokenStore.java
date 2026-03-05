package app.swipego.focusracer;

import android.content.Context;
import android.content.SharedPreferences;

/**
 * Simple persistent storage for FCM token.
 * The token is retrieved by the WebView JS bridge after login.
 */
public class TokenStore {
    private static final String PREFS = "fcm_prefs";
    private static final String KEY_TOKEN = "fcm_token";
    private static final String KEY_REGISTERED = "token_registered";

    public static void setToken(Context ctx, String token) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_TOKEN, token)
            .putBoolean(KEY_REGISTERED, false)
            .apply();
    }

    public static String getToken(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getString(KEY_TOKEN, null);
    }

    public static boolean isRegistered(Context ctx) {
        return ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .getBoolean(KEY_REGISTERED, false);
    }

    public static void markRegistered(Context ctx) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_REGISTERED, true)
            .apply();
    }

    public static void clearRegistration(Context ctx) {
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            .edit()
            .putBoolean(KEY_REGISTERED, false)
            .apply();
    }
}
