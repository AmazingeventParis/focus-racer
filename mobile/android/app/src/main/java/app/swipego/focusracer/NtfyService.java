package app.swipego.focusracer;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

/**
 * Background service that subscribes to a ntfy topic via HTTP streaming (SSE/JSON).
 * Receives push notifications without Firebase.
 */
public class NtfyService extends Service {
    private static final String TAG = "NtfyService";
    private static final String CHANNEL_ID = "focus_racer_default";
    private static final String FOREGROUND_CHANNEL_ID = "focus_racer_service";

    private volatile boolean running = false;
    private Thread subscriptionThread;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String ntfyUrl = intent.getStringExtra("ntfy_url");
        String topic = intent.getStringExtra("topic");

        if (ntfyUrl == null || topic == null) {
            Log.w(TAG, "Missing ntfy_url or topic");
            stopSelf();
            return START_NOT_STICKY;
        }

        // Start as foreground service (required for Android 8+)
        startForeground(1, buildForegroundNotification());

        // Stop existing subscription if any
        stopSubscription();

        // Start new subscription
        running = true;
        subscriptionThread = new Thread(() -> subscribeLoop(ntfyUrl, topic));
        subscriptionThread.setDaemon(true);
        subscriptionThread.start();

        Log.d(TAG, "Subscribed to " + ntfyUrl + "/" + topic);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        stopSubscription();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void stopSubscription() {
        running = false;
        if (subscriptionThread != null) {
            subscriptionThread.interrupt();
            subscriptionThread = null;
        }
    }

    /**
     * Long-polling loop that reconnects on failure.
     * Uses ntfy's JSON stream endpoint (/topic/json).
     */
    private void subscribeLoop(String ntfyUrl, String topic) {
        int backoff = 1000; // Start with 1s backoff

        while (running) {
            HttpURLConnection conn = null;
            try {
                URL url = new URL(ntfyUrl + "/" + topic + "/json");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setReadTimeout(0); // No timeout — keep connection open
                conn.setConnectTimeout(15000);
                conn.setRequestProperty("Accept", "application/x-ndjson");

                int code = conn.getResponseCode();
                if (code != 200) {
                    Log.w(TAG, "ntfy returned " + code);
                    Thread.sleep(backoff);
                    backoff = Math.min(backoff * 2, 60000);
                    continue;
                }

                // Reset backoff on successful connection
                backoff = 1000;

                BufferedReader reader = new BufferedReader(
                    new InputStreamReader(conn.getInputStream())
                );

                String line;
                while (running && (line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty()) continue;

                    try {
                        JSONObject msg = new JSONObject(line);
                        String event = msg.optString("event", "");

                        if ("message".equals(event)) {
                            String title = msg.optString("title", "Focus Racer");
                            String body = msg.optString("message", "");
                            String clickUrl = msg.optString("click", null);

                            showNotification(title, body, clickUrl);
                        }
                    } catch (Exception e) {
                        Log.w(TAG, "Parse error: " + e.getMessage());
                    }
                }

                reader.close();
            } catch (InterruptedException e) {
                // Service stopping
                break;
            } catch (Exception e) {
                if (running) {
                    Log.w(TAG, "Connection error: " + e.getMessage());
                    try {
                        Thread.sleep(backoff);
                        backoff = Math.min(backoff * 2, 60000);
                    } catch (InterruptedException ie) {
                        break;
                    }
                }
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        }

        Log.d(TAG, "Subscription loop ended");
    }

    private void showNotification(String title, String body, String clickUrl) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (clickUrl != null) {
            intent.putExtra("push_url", clickUrl);
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, (int) System.currentTimeMillis(), intent,
            PendingIntent.FLAG_ONE_SHOT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setColor(0xFF10B981);

        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) {
            manager.notify((int) System.currentTimeMillis(), builder.build());
        }
    }

    private Notification buildForegroundNotification() {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, FOREGROUND_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Focus Racer")
            .setContentText("Notifications actives")
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .setColor(0xFF10B981);

        return builder.build();
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            // Main notification channel
            NotificationChannel mainChannel = new NotificationChannel(
                CHANNEL_ID,
                "Focus Racer",
                NotificationManager.IMPORTANCE_HIGH
            );
            mainChannel.setDescription("Notifications Focus Racer");
            mainChannel.enableVibration(true);
            manager.createNotificationChannel(mainChannel);

            // Foreground service channel (silent)
            NotificationChannel serviceChannel = new NotificationChannel(
                FOREGROUND_CHANNEL_ID,
                "Service Focus Racer",
                NotificationManager.IMPORTANCE_MIN
            );
            serviceChannel.setDescription("Service de notifications en arriere-plan");
            serviceChannel.setShowBadge(false);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
