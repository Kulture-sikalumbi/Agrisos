# Model Handoff Template

Use this template whenever a new TensorFlow Lite model is provided.

## A) Model artifact

- Model filename: `model.tflite`
- Source training notebook/repo:
- Export date:
- Export command used:

## B) Input contract

- Input shape:
- Input dtype: `float32` / `uint8`
- Channel order: `RGB` / `BGR`
- Resize method:
- Crop policy: center crop / no crop
- Normalization formula:
  - mean:
  - std:
  - example: `(pixel - mean) / std`

## C) Output contract

- Output tensor shape:
- Output meaning: probabilities / logits
- Class index mapping:
  - 0 ->
  - 1 ->
  - 2 ->
  - 3 ->
  - ...

## D) Runtime mapping to Agrisos keys

Map each output class to one of:
- `healthy`
- `cmd`
- `cbsd`
- `uncertain`

## E) Validation notes

- Sample test image count:
- Top-1 accuracy:
- Common confusion pairs:
- Recommended confidence threshold:

