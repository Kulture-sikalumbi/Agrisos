What the project is
Agrisos+ — an AI app for Zambian cassava farmers that diagnoses two diseases (Cassava Mosaic Disease and Cassava Brown Streak Disease) from a photo of a leaf, entirely offline, on cheap phones (<2GB RAM). Farmer takes a photo → on-device AI model analyzes it → app shows a simple red/yellow/green traffic-light result with an icon (no dense text) telling them: pull the plant, treat it, or it's fine.
Core requirements from the doc:

Diagnosis in under 5 seconds, 100% offline (no server calls at all)
Model must run on devices with <2GB RAM → this means model quantization (shrinking the AI model, FP32→INT8)
≥85% accuracy target (realistic field accuracy, not lab-perfect)
UI = icons + traffic-light colors, minimal/no text (literacy barrier)
Built with TensorFlow Lite for on-device inference
Methodology: CRISP-DM (for the AI model) + Scrum (for the app, 2-week sprints)

The simplest path to actually build it
Think of it as two tracks that meet in the middle: train a small AI model → stick it in a basic mobile app.
1. Get a cassava disease image dataset
Don't collect your own photos from scratch — search Kaggle/GitHub for existing "Cassava Leaf Disease" datasets (there are public ones, e.g. from the Makerere/Kaggle cassava disease challenge). This alone can save you weeks.
2. Train a small image classifier

Use a lightweight pretrained model (MobileNetV2 or EfficientNet-Lite) and fine-tune it on the dataset — don't build a CNN from scratch.
Train in Python (TensorFlow/Keras), classifying: CMD, CBSD, healthy/nutrient-deficient.
Target 3 classes to keep it simple, not many disease subtypes.

3. Convert & shrink the model for phones

Convert your trained model to TensorFlow Lite format.
Apply INT8 quantization (one command in TFLite converter) — this is what makes it run on low-RAM phones fast.

4. Build a minimal mobile app

Use Flutter or plain Android (Kotlin) — Flutter is faster if you want one codebase.
Just 3 screens: Camera/photo capture → Loading → Result (traffic light + icon).
Embed the .tflite model directly in the app (no server, no API calls).

5. Wire it together

Camera takes photo → resize/preprocess image → feed into TFLite model → get prediction → map prediction to red/yellow/green result screen with icon.

6. Test on a real cheap phone

Check it runs under 2GB RAM and gives a result in <5 seconds.
Check accuracy against a held-out test set (aim ≥85%).

7. Polish UI

Swap any text for icons, keep it to the traffic-light system as the doc specifies.

and include a lil Chatbot....