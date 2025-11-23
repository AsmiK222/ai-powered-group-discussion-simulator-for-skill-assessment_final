# ML Models Directory

This directory is for optional TensorFlow.js models to enhance analysis accuracy.

## Optional Models

### 1. Text Sequence Model (LSTM)
**Path**: `text_model/model.json`
**Purpose**: Enhances confidence and fluency scoring using LSTM
**Format**: TensorFlow.js LayersModel
**Input**: Encoded text sequences [1, T, F]
**Output**: [confidence, fluency] scores [0-1]

### 2. Attention CNN Model
**Path**: `attention_cnn/model.json`
**Purpose**: Detects user attention from webcam frames
**Format**: TensorFlow.js LayersModel
**Input**: Grayscale image [1, 96, 96, 1]
**Output**: Attention score [0-1]

## Note

**The application works without these models!** It uses heuristic-based analysis by default.

If you have trained models, place them here following the TensorFlow.js model format:
- `model.json` (model architecture and weights manifest)
- `group1-shard1of1.bin` (or similar weight files)

The system will automatically detect and use them if present.
