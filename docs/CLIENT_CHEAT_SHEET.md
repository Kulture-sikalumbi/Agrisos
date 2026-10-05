# Agrisos+ Supervisor Cheat Sheet

## 30-second explanation

Agrisos+ is an **offline cassava leaf screening application**. A farmer takes a photo, the app checks whether the image is usable, and a TensorFlow Lite model running on the Android phone classifies it as:

- Healthy
- Cassava Mosaic Disease (CMD)
- Cassava Brown Streak Disease (CBSD)

The model does not need an internet connection, account, or cloud AI service to produce the core scan. The app gives a likely category, confidence information, and practical next steps. It is a screening and decision-support tool, not a replacement for an agricultural extension officer or laboratory diagnosis.

## The key technical story

| Stage | What happens |
|---|---|
| Training | TensorFlow/Keras trains a cassava classifier using labeled images. |
| Export | The trained model is converted to TensorFlow Lite for mobile deployment. |
| Packaging | The `.tflite` file is bundled inside the Android app. |
| Inference | The phone preprocesses the photo and runs the model locally. |
| Result | The highest-scoring class is shown with confidence and guidance. |

The Python training pipeline is not shipped inside the app. Training happens during development; the phone only performs inference with the exported model.

## What model is used?

The model uses **MobileNetV2 transfer learning**:

1. MobileNetV2 starts with features learned from ImageNet, such as edges, shapes, and textures.
2. Its original classification head is removed.
3. The feature extractor is initially frozen.
4. Global average pooling, dropout, and a new three-class softmax head are added.
5. The new head is trained for the Agrisos cassava classes.

### Why MobileNetV2?

MobileNetV2 is designed for relatively efficient vision inference. It is a sensible choice for an app that must run on Android devices with limited processing power, storage, or connectivity. It is smaller and more mobile-friendly than many large general-purpose vision models.

### What is transfer learning?

Transfer learning reuses general visual knowledge from a model trained on a large image dataset, then adapts the final classification layer to the project task. It usually needs less data and training time than training every model parameter from zero. It does not mean that the model already knew cassava disease; the cassava classification head still had to be trained on labeled cassava images.

## Model input and output contract

The app and training pipeline use the same contract. This agreement is essential: changing the class order or normalization can make a valid model produce the wrong labels.

### Input

- Image is center-cropped to a square.
- Image is resized to **224 x 224 pixels**.
- Color channels are **RGB**.
- Input type is **float32**.
- Each channel is normalized with:

  `(pixel - 127.5) / 127.5`

- Normalized values are approximately in the range **-1 to +1**.

### Output

The model returns three softmax scores. The fixed class order is:

```text
0 = healthy
1 = cmd
2 = cbsd
```

The app selects the class with the highest score using **argmax**. It also records the top-two score gap, which helps identify predictions where the leading classes are close.

## What happens during a scan?

```text
Photo selected
    |
    v
Offline image-quality gate
    |
    +--> Reject unusable image: too small, too dark, too bright,
    |    too flat, unreadable, or clearly not leaf-like
    |
    v
Center crop -> resize to 224x224 -> RGB -> normalize
    |
    v
Bundled MobileNetV2 TFLite model
    |
    v
Three output scores
    |
    v
Highest score -> class + confidence + practical guidance
```

The image-quality gate is deliberately separate from the disease model. It catches obvious bad inputs before the classifier is asked to interpret them. Its green/yellow color check is a loose plant-like heuristic, not proof that the image is cassava.

## Confidence and uncertainty

The app uses **0.75** as its current confidence threshold for the `isConfident` flag. This is an application rule, not a guarantee that the result is correct and not a medical-grade probability.

The app should be described this way:

> “A higher score means the model matched this image more strongly to one of its trained classes. It does not mean the model is correct with that exact percentage.”

Low confidence, close top-two scores, poor photos, unusual symptoms, and unfamiliar field conditions should lead to a clearer photo or confirmation from an extension officer.

## Training data

The organized dataset contains **17,924 images** split into training, validation, and held-out test data:

| Split | Healthy | CMD | CBSD | Total |
|---|---:|---:|---:|---:|
| Training | 1,803 | 9,210 | 1,532 | 12,545 |
| Validation | 386 | 1,973 | 328 | 2,687 |
| Test | 388 | 1,975 | 329 | 2,692 |
| **Total** | **2,577** | **13,158** | **2,189** | **17,924** |

The split uses approximately 70% training, 15% validation, and 15% testing, with seed 42. The model has three output classes because the current app scope is healthy, CMD, and CBSD. Other source labels were excluded from this classifier rather than silently mapped to one of these three classes.

### Why are the classes imbalanced?

CMD has more images than the other classes. The training script uses **class weights** so that the large CMD class does not dominate the loss function. More balanced, locally collected data would still be valuable for a stronger production model.

### Was augmentation used?

The current training script does not define an explicit augmentation pipeline. This is an honest limitation. Future training should evaluate controlled changes in lighting, blur, rotation, scale, camera type, leaf angle, and background, while keeping a separate field test set untouched.

## Reported performance

The exported model metadata records:

- Held-out test accuracy: **82.43%**
- Test loss: approximately **0.455**
- Training accuracy at the selected run's final recorded epoch: approximately **79.68%**
- Validation accuracy at that epoch: approximately **81.32%**

These are results on the available held-out dataset, not a guarantee of performance on every farm, phone, season, disease stage, or lighting condition. Accuracy alone also hides which classes are being confused. A stronger evaluation should report a confusion matrix, precision, recall, F1 score, and per-class results.

## What the model can and cannot claim

### It can claim

- It provides an offline first-pass classification for three cassava categories.
- It uses a documented TensorFlow-to-TFLite workflow.
- It uses a fixed input shape, normalization formula, and class mapping.
- It provides fast local inference without sending the scan to a cloud model.
- It can reject obviously unusable photos before classification.

### It cannot claim

- It diagnoses every cassava disease.
- It is 100% accurate.
- Its confidence number is a guaranteed probability.
- It has been validated on every Zambian farming condition.
- It can distinguish every nutrient deficiency, pest, virus stage, or abiotic stress.
- A single leaf photo replaces field inspection or expert confirmation.

## Common supervisor questions

### Did you use TensorFlow?

Yes. TensorFlow/Keras is used for training and evaluation. The trained model is exported to TensorFlow Lite, and the Android app runs that exported model locally. The app does not train on the phone.

### Why not use a large cloud AI model?

The core scan should work in rural areas with weak, expensive, or unavailable connectivity. Local inference also reduces latency and keeps the scan image on the phone for the model path. A cloud model could be considered separately in a future version, but it is not required for the current core workflow.

### Why not train from scratch?

Training every layer from zero would require more data, time, and compute. Transfer learning gives the project a practical starting point while still training a task-specific cassava classification head.

### How do you know the app is using the correct labels?

The same class order is explicitly defined in both the training script and the mobile configuration: `healthy`, `cmd`, `cbsd`. The model metadata records the same mapping, and the app logs the model input/output information during loading.

### What happens with a bad photo?

Before inference, the app checks image size, brightness, contrast, decodability, and a loose plant-like color ratio. It asks the user to retake photos that are obviously too dark, too bright, too small, flat, unreadable, or not leaf-like.

### What happens when the model is uncertain?

The app shows the result as low confidence, keeps the confidence visible, gives conservative practical guidance, and recommends a clearer photo or an extension officer. It does not claim certainty from one image.

### What is the biggest limitation?

The biggest limitation is generalization. A model can perform well on a held-out dataset and still struggle with local varieties, phones, backgrounds, seasons, disease stages, or symptoms that were underrepresented in training.

### What should be improved next?

1. Collect more expert-labeled images from local farms and multiple seasons.
2. Keep a genuinely independent field test set outside model development.
3. Add augmentation and compare its effect rather than assuming it helps.
4. Report a confusion matrix and per-class precision, recall, and F1 score.
5. Tune and calibrate the confidence threshold using field validation.
6. Add more disease or stress classes only when there is enough reliable labeled data.
7. Conduct usability testing with farmers and extension officers.

## Suggested live demonstration

1. Turn off Wi-Fi and mobile data.
2. Open Agrisos+ and show that the scan workflow remains available.
3. Scan a clear cassava leaf photo.
4. Point out the predicted class, confidence, and practical advice.
5. Try an obviously poor image and show the quality gate response.
6. Explain that a serious or unclear case should still be checked by an extension officer.

This demonstration proves the central claim: the model used for the scan is packaged in the app and runs locally.

## One-minute closing answer

> “Agrisos+ uses a MobileNetV2 image classifier trained with TensorFlow on labeled cassava images. We export it to TensorFlow Lite and bundle it in the Android app, where the phone preprocesses each image and runs inference without internet. The model currently classifies healthy, CMD, and CBSD. On the held-out dataset it achieved 82.43% accuracy, but we present it as a screening aid because real field conditions are more varied. The next validation step is a larger, locally collected field dataset with per-class metrics and expert review.”

## Source files for verification

- Training pipeline: `ml/train.py`
- Dataset metadata: `ml/data/dataset_meta.json`
- Model export metadata: `src/assets/model_export_meta.json`
- Mobile model configuration: `src/config/tfliteModelConfig.ts`
- TFLite inference and preprocessing: `src/services/tflite.ts`
- Image-quality gate: `src/services/imageQuality.ts`
- Classifier flow: `src/services/classifier.ts`
- Offline model notes: `docs/OFFLINE_MODEL_GUIDE.md`
