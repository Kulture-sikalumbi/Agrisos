TensorFlow Lite wiring (progress)
I wired in on-device TensorFlow Lite support using react-native-fast-tflite.

What’s now in place:

Installed react-native-fast-tflite, expo-image-manipulator, jpeg-js
Updated app.json to add the Expo config plugin for TFLite
Updated metro.config.js to recognize .tflite as an asset type
Prebuilt native code once (npx expo prebuild --clean)
Replaced your mock classifyImage() so it will use TFLite when a model is configured, otherwise it falls back to the mock (so the app still runs)
Bundled CropNet cassava model at AgrisosApp/src/assets/model.tflite (~16 MB)
Switched loading to bundled asset mode (require(...))
Added CropNet preprocessing (center crop, 224 resize, [-1,1] normalization)
Mapped 6 CropNet classes to Agrisos keys (CMD, CBSD, healthy, uncertain)
Key files:

src/services/tflite.ts — model loading, preprocessing, inference
src/assets/model.tflite — bundled CropNet model
src/assets/labels.txt — CropNet class labels
ml/README.md + ml/train.py — pipeline to train a smaller 3-class INT8 model later
What you should do next

1. Ensure internet can reach Maven Central (repo.maven.apache.org) and Google Maven (dl.google.com).
   If builds fail with "Connection timed out", fix network/VPN/firewall first.

2. Android SDK path is set in android/local.properties:
   sdk.dir=C:\\Users\\Administrator\\AppData\\Local\\Android\\Sdk

3. Rebuild and install on emulator/device:
   cd AgrisosApp
   npx expo start
   (in another terminal)
   npx expo run:android

4. Metro is already bundling the app with model.tflite successfully.

5. Test on emulator (emulator-5554) or a real phone with cassava leaf photos.

6. (Optional) Set GEMINI_API_KEY in src/services/gemini.ts for online chatbot/second opinion.