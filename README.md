# 🐕⚖️ Dog Court — A Mock Courtroom for Household Canine "Crimes"

> **Justice, served with a chew toy.**  
> A deadpan, legal-drama comedy web app built for the **DEV Weekend Challenge: Dog Days Edition** (Targeting **Best Use of Google AI** and **Best Use of ElevenLabs** prize categories).

![Dog Court Banner](https://img.shields.io/badge/DEV_Challenge-Dog_Days_Edition-gold?style=for-the-badge&logo=dev.to)
![Google AI](https://img.shields.io/badge/Google_AI-Gemini_API-blue?style=for-the-badge&logo=google)
![ElevenLabs](https://img.shields.io/badge/ElevenLabs-AI_Voices-purple?style=for-the-badge)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla_HTML%2FCSS%2FJS-black?style=for-the-badge&logo=javascript)

---

## 📜 What is Dog Court?

Every dog owner knows the routine: your dog chews a slipper, steals a sausage off the table, or barks at the mailman for 47 minutes straight. Instead of giving them a stern talking-to, **Dog Court** puts your dog on trial in a deadpan, hyper-dramatic mock courtroom.

### 🌟 Key Features

1. **⚖️ Real-Time Legal Drama Script Generation (Google Gemini API)**
   - Delivers a dead-serious prosecutor opening statement treating a chewed slipper like a felony.
   - Summons 2+ inanimate or living witnesses (*The Living Room Rug*, *Mr. Whiskers the Cat*, *The Vacuum Cleaner*).
   - Passionate (and absurd) defense attorney argument arguing dog innocence.
   - Wise judicial verdict with reasoning and absurd sentencing.

2. **🎙️ Multi-Role Voice Acting (ElevenLabs API & Web SpeechSynthesis Fallback)**
   - Every courtroom role (Prosecutor, Witnesses, Defense Counsel, Chief Justice) is voiced with distinct ElevenLabs AI Voice IDs.
   - Graceful zero-break fallback to browser `SpeechSynthesis` if ElevenLabs is offline or unconfigured.

3. **📜 Downloadable Official Court Certificates (HTML5 Canvas)**
   - 1-click generation of a vintage parchment judicial decree complete with dog mugshot, wax seal, judge signature (*Hon. Sir Barks-a-Lot 🐾*), case docket number, and verdict stamp.
   - High-resolution PNG output ready to share on DEV comments or social media!

4. **🐕 Interactive Mugshot Customizer**
   - Choose coat colors (*Golden Retriever, Black Lab, Grey/Husky, Dalmatian spots*).
   - Equips fun accessories (*Powdered Judge Wig, Formal Bowtie, Detective Fedora Hat*).

5. **🔊 Web Audio Wooden Gavel Strike**
   - Synthesizes realistic wooden mallet impact audio using Web Audio API oscillators and noise burst filters alongside SVG gavel animations.

6. **📁 Court Docket Archives (LocalStorage)**
   - Keeps track of up to 20 past canine trials, letting you load, replay, or re-export certificates anytime.

7. **🎲 "Randomize Case" Button**
   - Pre-loaded with 10 hilarious pre-made dog criminal dossiers for instant zero-type testing.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vanilla HTML5, CSS3 (Custom Wood & Parchment Theme), JavaScript (ES6+). Zero build steps or heavy node modules needed!
- **AI Generator**: Google Gemini API (`gemini-flash-latest`, `gemini-2.0-flash-001`, with automatic 8-model fallback matrix).
- **Voice Engine**: ElevenLabs REST API (`eleven_flash_v2_5` model) + Web `SpeechSynthesis` API.
- **Audio & Visual**: HTML5 2D Canvas API, Web Audio API, SVG Graphics & CSS keyframe animations.

---

## 🤖 Gemini API JSON Schema Prompt

Dog Court uses a strictly constrained JSON prompt schema with Gemini to ensure deterministic courtroom output:

```json
{
  "case_number": "DC-2026-114",
  "charge": "Aggravated Footwear Destruction in the First Degree",
  "prosecutor_opening": "Members of the jury, the left sneaker was devoured with premeditated intent...",
  "witnesses": [
    { "name": "The Living Room Rug", "testimony": "I felt the crumbs fall upon me at 14:02 hours." },
    { "name": "Mr. Whiskers the Cat", "testimony": "The defendant displayed no remorse, only enthusiasm." }
  ],
  "defense_argument": "My client is a good boy. The shoe was clearly acting aggressively towards him.",
  "judge_verdict": "ACQUITTED",
  "verdict_reasoning": "The shoe lacked a permit to sit on the floor.",
  "sentence": "Immediate restoration of treat privileges and two mandatory belly rubs."
}
```

---

## 🚀 Quickstart & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/dog-court.git
   cd dog-court
   ```

2. **Configure API Keys**:
   - Copy `config.example.js` to `config.js`:
     ```bash
     cp config.example.js config.js
     ```
   - Open `config.js` and add your Google Gemini API Key (get a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)):
     ```javascript
     window.APP_CONFIG = {
       GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
       GEMINI_MODEL: 'gemini-flash-latest',
       // Optional ElevenLabs setup:
       ELEVENLABS_API_KEY: 'YOUR_ELEVENLABS_KEY',
       ELEVENLABS_ENABLED: true
     };
     ```
   - *Note*: You can also set API keys directly inside the web app UI by clicking **⚙️ Settings**!

3. **Run the app**:
   - Open `index.html` directly in any web browser, or serve via local server:
     ```bash
     npx serve .
     ```

---

## 📜 License

MIT License — free to use, modify, and share! Dedicated to dogs everywhere 🐕.
