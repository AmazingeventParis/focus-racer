# Configuration Firebase pour Focus Racer Mobile

## 1. Creer le projet Firebase

1. Aller sur https://console.firebase.google.com
2. "Ajouter un projet" -> nom: "Focus Racer"
3. Desactiver Google Analytics (optionnel)
4. Cliquer "Creer le projet"

## 2. Ajouter l'app Android

1. Dans la console Firebase, cliquer "Ajouter une application" -> Android
2. Package name: `app.swipego.focusracer`
3. Nom: "Focus Racer"
4. Telecharger `google-services.json`
5. Copier dans `mobile/android/app/google-services.json`

## 3. Generer la cle de service (server-side)

1. Firebase Console -> Parametres du projet -> Comptes de service
2. "Generer une nouvelle cle privee"
3. Telecharger le JSON
4. Copier le contenu JSON en une seule ligne
5. Ajouter dans Coolify comme variable d'environnement:
   ```
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"..."}
   ```

## 4. Rebuild l'APK

```bash
cd mobile
./build.sh release
```

## 5. Uploader l'APK sur S3

Utiliser la route admin ou le script:
```bash
curl -X POST https://focusracer.swipego.app/api/admin/upload-apk \
  -H "Cookie: <session-cookie>" \
  -F "apk=@builds/focus-racer-release.apk"
```
