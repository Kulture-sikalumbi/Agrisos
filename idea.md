
refactor and enhance our disease detection pipeline—specifically handling the edge models (TFLite/ONNX) and our Gemini cloud fallback prompt logic.

Please help me implement the following improvements across our codebase:

---

### 1. Gemini Cloud Fallback Prompt Refinement
Update the system prompt used when sending images and edge-model predictions to Gemini for secondary confirmation.

Requirements for the Prompt:
- **Disambiguate CMD vs. CBSD:**
  - Instruct Gemini to evaluate whether yellowing is an asymmetric/distorted mosaic pattern (typical of CMD) versus feathery chlorosis along secondary veins on non-distorted leaves (typical of CBSD).
  - Explicitly prompt Gemini to ask or instruct the user to check for secondary physical signs (e.g., *"If CBSD is suspected, advise the user to inspect the roots for brown rot or check stems for brown streaks"*).
- **Handle Natural Senescence & Abiotic Stress:**
  - Add logic to check for uniform yellowing on older lower leaves while surrounding canopy leaves remain green. Categorize this as "Natural Leaf Shedding / Senescence" or "Abiotic Stress" rather than a panic-inducing viral outbreak.
- **Severity Indexing:**
  - Output a severity scale (Grade 1 to 5) when a disease is confirmed so the app can render appropriate, actionable advice (e.g., rogue immediately vs. monitor field).
- **Structured JSON Output:**
  - Ensure Gemini responds in a strict JSON schema containing:
    `{ primary_diagnosis, confidence_assessment, severity_score, differential_diagnosis, immediate_action_steps, secondary_inspection_required }`

---

### 2. Edge Dataset & Inference Safeguards (Mobile Code / Preprocessing)
Suggest and implement structural updates for our mobile/edge model handler:

- **Confidence Thresholding & Fallback Triggers:**
  - If the offline model's top prediction confidence is below a defined threshold (e.g., < 80%) OR if the top two predicted classes (e.g., CMD vs. CBSD) have a narrow confidence delta, automatically queue or trigger the Gemini cloud call (if online).
- **Image Preprocessing & Context Prompts:**
  - When sending an image to Gemini, include bounding/context metadata if available, and prompt the user if the image quality is too low, blurry, or overexposed for fine vein analysis.

---

### Deliverables Needed:
1. The complete, updated **System Prompt string/template** for the Gemini API call.
2. The TypeScript/JSON TypeScript interfaces for parsing Gemini's structured response.
3. The helper function/logic for determining when to fall back from the offline model to Gemini based on classification confidence scores.                  