# Offline TensorFlow Model Guide (Agrisos+)

This guide explains what the app is doing for offline cassava classification, in plain language.

## 1) What "offline model in app" means

- We ship a `.tflite` file **inside the mobile app**.
- When a user picks/takes a leaf image, the app runs the model **on the phone**, not on a server.
- Output is converted into app labels (`healthy`, `cmd`, `cbsd`, `uncertain`) and shown in the Result screen.

## 2) Files that control model behavior

- `src/assets/model.tflite`
  - The actual trained TensorFlow Lite model.
- `src/config/tfliteModelConfig.ts`
  - The model contract (class order, input size, dtype, normalization).
- `src/services/tflite.ts`
  - Runtime inference pipeline (load model -> preprocess image -> run model -> parse output).
- `src/services/classifier.ts`
  - Calls TFLite first, then falls back if inference fails.

## 3) End-to-end inference flow

1. User selects image from camera/gallery.
2. App reads model config (`tfliteModelConfig.ts`).
3. Image is preprocessed:
   - optional center crop
   - resize to model input size
   - convert RGBA to RGB
   - normalize values according to training settings
4. App calls TFLite `model.run(...)`.
5. App picks class with highest score (argmax).
6. App maps class index to disease key (`classOrder`).
7. App returns `{ disease, confidence, isConfident }`.

## 4) The 3 most important model settings

These must match training exactly:

1. `classOrder`
   - Example: index `0` must map to the same class used during training export.
2. `input.size`
   - Example: `224x224` or `320x320`.
3. `input.dtype + normalization`
   - float model often uses normalized values
   - uint8 model usually expects raw 0..255 pixel bytes

If these are wrong, predictions look random even when code is correct.

## 5) Presentation explanation (simple script)

You can say:

> "We use a TensorFlow Lite model embedded in the app.  
> The app preprocesses each cassava leaf image to the same format used during model training, runs inference locally on-device, and maps model outputs into farmer-friendly categories: healthy, CMD, CBSD, or uncertain.  
> This gives fast classification without requiring internet."

## 6) Current status in this project

- TensorFlow pipeline is wired and buildable.
- App compiles and bundles `.tflite` assets.
- A real starter model is bundled at `src/assets/model.tflite` (CropNet cassava, 6 classes).
- Android dev build has been compiled successfully with native TFLite module.
- Next step is replacing the starter model with your custom trained model and confirming config values.

## 7) Required handoff from model training side

Before final validation, we need:

- final `model.tflite`
- class index order from training/export
- input width/height
- input dtype (`float32` or `uint8`)
- normalization used in training

## 8) What is already running now

- Model source: bundled file `src/assets/model.tflite`
- Labels file: `src/assets/labels.txt`
- Current class mapping in app:
  - 0 Bacterial Blight -> `uncertain`
  - 1 Brown Streak Disease -> `cbsd`
  - 2 Green Mite -> `uncertain`
  - 3 Mosaic Disease -> `cmd`
  - 4 Healthy -> `healthy`
  - 5 Unknown -> `uncertain`
- Current preprocessing:
  - optional center crop
  - resize to `224x224`
  - RGB conversion
  - normalization `(pixel - 127.5) / 127.5` for float input

## 9) Common Q&A for review/demo

- **Q: Why TFLite and not cloud APIs only?**  
  **A:** TFLite supports offline, low-latency inference on low-end devices.

- **Q: Why can wrong config ruin results?**  
  **A:** The model expects exact preprocessing (size/scale/channel order). Any mismatch shifts predictions.

- **Q: Can it work without internet?**  
  **A:** Yes, core diagnosis is on-device. Gemini is optional enhancement.

- **Q: How do we improve accuracy?**  
  **A:** Better labeled dataset, balanced classes, augmentation, and quantization-aware validation.

## 10) Next implementation milestones

1. Train custom 3-class model from organized `ml/data` (`healthy/cmd/cbsd`).
2. Replace bundled CropNet starter `src/assets/model.tflite` with custom export.
3. Set `tfliteModelConfig.ts` classOrder to `['healthy','cmd','cbsd']`.
4. Rebuild app and validate with gallery test images.
5. Tune `confidenceThreshold` and uncertain handling.

