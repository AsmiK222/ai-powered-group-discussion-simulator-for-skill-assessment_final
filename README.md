# AI-Powered Group Discussion Simulator

An intelligent multi-modal group discussion simulator that uses deep learning for real-time skill assessment. Practice group discussions with AI bots powered by LLMs, receive instant feedback, and improve your communication skills.

## Features

- **4 AI Bot Personalities**: Alexa (Knowledge Coach), Maya (Communication Mentor), Sarah (Leadership Guide), and Momo (Panel Evaluator)
- **Multi-Modal Interaction**: Text and voice input with real-time speech recognition and TTS
- **Real-Time Analytics**: Live performance metrics including confidence, fluency, originality, teamwork, and reasoning
- **Emotion Analysis**: Facial expression and emotion detection using MediaPipe and TensorFlow.js
- **Comprehensive Reports**: Detailed performance analysis with actionable insights and PDF/HTML export
- **Accessibility**: WCAG 2.1 compliant with screen reader support, high contrast mode, and keyboard navigation

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Tailwind CSS
- **AI/ML**: TensorFlow.js, MediaPipe, Ollama (LLMs)
- **Speech**: Web Speech API (native browser)
- **Computer Vision**: BlazeFace, Face Landmarks Detection
- **Reports**: jsPDF, html2canvas

## Prerequisites

- Node.js 18+ and npm
- Modern browser with camera and microphone support (Chrome, Edge, or Safari recommended)
- (Optional) Ollama installed locally for LLM-powered bot responses

## Installation

1. **Clone the repository**
   ```bash
   cd ai-powered-group-discussion-simulator-for-skill-assessment_final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Optional: Ollama Setup for LLM Responses

For enhanced AI bot responses using Large Language Models:

1. **Install Ollama**
   - Download from [ollama.ai](https://ollama.ai)
   - Follow installation instructions for your OS

2. **Pull required models**
   ```bash
   ollama pull gemma
   ollama pull mistral
   ollama pull llama3
   ollama pull phi3
   ```

3. **Start Ollama server**
   ```bash
   ollama serve
   ```
   The server runs on `http://localhost:11434` by default.

**Note**: If Ollama is not available, the system gracefully falls back to pre-configured canned responses.

## ML Models (Optional)

The system works with heuristic-based analysis by default. For enhanced accuracy, you can add TensorFlow.js models:

### Text Sequence Model (Optional)
Place a trained LSTM model at:
```
public/models/text_model/model.json
```

### Attention CNN Model (Optional)
Place a trained CNN model at:
```
public/models/attention_cnn/model.json
```

**Note**: The system will automatically detect and use these models if present, otherwise it uses heuristic analysis.

## Usage

1. **Start a Discussion**
   - Click "Start Practice Session" on the home page
   - Select a topic from the catalog or create a custom one
   - Choose difficulty level (beginner, intermediate, advanced)

2. **During Discussion**
   - Type messages or use voice input (click microphone icon)
   - Enable camera for emotion and attention analysis
   - Watch real-time performance metrics update
   - AI bots will respond and engage with your ideas

3. **View Results**
   - Click "End Discussion" when finished
   - Review comprehensive performance report
   - Export as PDF or HTML for future reference

## Browser Permissions

The app requires the following permissions:
- **Microphone**: For voice input (optional)
- **Camera**: For emotion and attention analysis (optional)

You can use the app without granting these permissions; text-only mode will work fine.

## Project Structure

```
├── src/
│   ├── components/      # React components
│   │   ├── Discussion/  # Discussion UI components
│   │   ├── Layout/      # Layout components
│   │   └── Reports/     # Report visualization
│   ├── pages/           # Main page components
│   ├── services/        # AI/ML services
│   │   ├── DiscussionService.ts    # Bot logic & metrics
│   │   ├── EmotionService.ts       # Emotion detection
│   │   ├── AttentionService.ts     # Attention tracking
│   │   ├── SpeechService.ts        # Speech recognition/synthesis
│   │   ├── NlpService.ts           # Text analysis
│   │   ├── ReportService.ts        # Report generation
│   │   ├── SequenceModelService.ts # LSTM scoring
│   │   └── OllamaService.ts        # LLM integration
│   ├── hooks/           # Custom React hooks
│   ├── data/            # Static data (bots, topics)
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
│   ├── images/          # Bot avatars
│   └── models/          # Optional ML models
└── README.md
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

To preview the production build:
```bash
npm run preview
```

## Known Limitations

- Speech recognition requires modern browser with Web Speech API support
- Camera-based emotion analysis works best in good lighting
- LLM responses require Ollama running locally
- Currently supports English language only

## Troubleshooting

### Camera not working
- Ensure browser has camera permissions
- Check if another app is using the camera
- Try refreshing the page

### Voice input not working
- Verify microphone permissions in browser
- Check if microphone is properly connected
- Ensure you're using a supported browser (Chrome/Edge recommended)

### Ollama connection failed
- Verify Ollama is running: `ollama list`
- Check if port 11434 is accessible
- The app will work with fallback responses if Ollama is unavailable

### Models not loading
- Models are optional; the app works with heuristics
- Check browser console for specific error messages
- Ensure model files are in correct paths under `public/models/`

## Privacy & Data

- All processing happens locally in your browser
- No data is sent to external servers (except Ollama if running locally)
- Camera and microphone data is processed in real-time and not stored
- Session data is not persisted between page refreshes

## Contributing

This is an academic project for deep learning coursework. For issues or suggestions, please contact the development team.

## License

Academic project - Amrita Vishwa Vidyapeetham, Coimbatore

## Authors

- Asmi K (CB.SC.U4AIE23351)
- Geshna B (CB.SC.U4AIE23360)
- Vibhu Sanchana (CB.SC.U4AIE23347)
- Malavika S Prasad (CB.SC.U4AIE23315)

**Supervisor**: Dr. Neelesh Ashok  
**Department**: Artificial Intelligence, Amrita Vishwa Vidyapeetham

---

For more details, refer to the IEEE paper: `enhanced_ieee_paper.tex`
