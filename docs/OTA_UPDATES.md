# Agrisos OTA (Expo Updates)

## One-time setup (Expo account)
```powershell
cd C:\Users\Administrator\Desktop\Agrisos\AgrisosApp
npx eas-cli login
npx eas-cli init
```
Copy the project ID into `app.json`:
- `expo.extra.eas.projectId`
- `expo.updates.url` → `https://u.expo.dev/<projectId>`

## Ship a JS/asset update (no Play Store resubmit)
```powershell
npx eas-cli update --branch production --message "language + splash"
```

## Native rebuild still required when you change
- native modules (TFLite, camera, etc.)
- `app.json` permissions / package name
- Android/iOS native project settings

Then:
```powershell
npx eas-cli build -p android --profile preview
```
