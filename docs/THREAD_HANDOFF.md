# Thread Handoff — AgrisosApp (ready for new chat)

## Copy-paste starter prompt for next thread

```
Continue AgrisosApp work.
Project: C:\Users\Administrator\Desktop\Agrisos\AgrisosApp
Read: docs/THREAD_HANDOFF.md

Status:
- Custom TFLite 3-class model live (healthy/cmd/cbsd), 82.43% test acc, ArrayBuffer output bug fixed
- Gallery crop stuck fixed (allowsEditing=false); quality gate rejects bad photos
- Gemini key in src/services/gemini.ts; structured AI advice; chatbot replies in selected language
- i18n EN / Bemba with home language picker (src/i18n/*)
- Cassava leaf icon+splash in assets/; OTA linked to EAS @mr-ninja1/AgrisosApp (cd214a31-1f4f-4bd4-a72a-45d07ec0f16e)
- Expo account: mr-ninja1

Next (do in order):
1. Rebuild native so icon/splash/updates apply: npx expo run:android  (or eas build -p android --profile preview)
2. Smoke-test language switch + camera Back + reject bad photo + one real leaf scan
3. Optional: eas update --branch production after JS-only changes
4. Optional: longer training for accuracy; polish Bemba with a native speaker

Do NOT commit Gemini API key to a public repo.
```

---

## Project
`C:\Users\Administrator\Desktop\Agrisos\AgrisosApp`

## Product goal
Offline cassava disease scanner for Zambian farmers (EN / Bemba), with optional Gemini advice when online, Expo OTA for JS updates.

## Classes (TFLite order)
0 `healthy` · 1 `cmd` · 2 `cbsd`  
Config: `src/config/tfliteModelConfig.ts` — 224×224, float32, mean/std 127.5, threshold 0.75

## What works now
| Area | Status |
|------|--------|
| TFLite offline classify | Working (ArrayBuffer → Float32Array fix in `src/services/tflite.ts`) |
| Camera + Gallery | Both use `classifyImage`; gallery has **no** crop editor |
| Bad photo reject | `src/services/imageQuality.ts` — dark/bright/blank rejected, no disease advice |
| Result UX | What to do + Prevention; Treatment/AI collapsed |
| Gemini | Key in `gemini.ts`; structured JSON advice; careful chemical guidance |
| Languages | Picker on Home: English / IciBemba — `src/i18n/` |
| History | Last 8 scans on device — Home → Recent scans |
| Icon / splash | Cassava leaf — `assets/icon.png`, `assets/splash-icon.png` |
| OTA code | `expo-updates` + `src/services/ota.ts` + `eas.json` + `docs/OTA_UPDATES.md` |
| OTA linked | **DONE** — project `@mr-ninja1/AgrisosApp`, ID `cd214a31-1f4f-4bd4-a72a-45d07ec0f16e` |

## Important paths
- App entry / nav: `App.tsx`
- Classify: `src/services/classifier.ts`
- TFLite: `src/services/tflite.ts` + `src/assets/model.tflite`
- i18n: `src/i18n/{en,bem,LanguageContext,types}.ts`
- Gemini: `src/services/gemini.ts` (**secret key in file**)
- ML train: `ml/train.py`, venv `ml/.venv`, data `ml/data/`
- Emulator test imgs: `/sdcard/Pictures/AgrisosTest/`

## Env notes
- `ANDROID_HOME`: `C:\Users\Administrator\AppData\Local\Android\Sdk`
- Java: Android Studio JBR
- Expo login: `mr-ninja1` / `sikalumbit30@gmail.com`
- Package: `com.mrninja1.AgrisosApp`

## Known gaps / next work
1. **Native rebuild** required for new icon/splash/`expo-updates` (OTA JS alone won’t update icon)
2. Keep polishing Bemba in `bem.ts` (leave technical terms in English where clearer)
3. Optional: more training epochs
4. Don’t push Gemini key publicly — rotate if repo is shared

## Quick commands
```powershell
cd C:\Users\Administrator\Desktop\Agrisos\AgrisosApp
npx expo run:android
npx eas-cli update --branch production --message "describe change"
npx eas-cli build -p android --profile preview
```

## Do not re-do
- TFLite ArrayBuffer interpret fix
- allowsEditing crop removal
- EAS project link (`cd214a31-1f4f-4bd4-a72a-45d07ec0f16e`)
- Full i18n scaffolding (extend strings in `en.ts` / `bem.ts` instead)
