# AI Livelihood Navigator

A simple voice-first prototype that turns a person's story into a grounded Skill Bridge, potential transferable skills, opportunity shortlist, and practical learning roadmap.

## Run locally

### Frontend

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

### Backend

Create and activate a virtual environment, then install the FastAPI dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`.

## Prototype notes

- Use **Try Demo** to load the agriculture example without a microphone.
- Voice input uses the browser Web Speech API when available; every question also has a text input fallback.
- Recommendation results are selected only from `backend/data/opportunities.json`. If no record matches, the API returns an empty list and the UI shows `No suitable opportunity found in our current database.`
- `.env.example` documents the future LLM configuration. The current recommendation path is deterministic by design so the demo cannot invent opportunities.
- The six-question conversation collects education, current work, existing skills, experience, interests, and income/career goal.
- Potential skills are explicitly labelled as possibilities. Users can confirm or remove them before using them as part of their profile story.
- AI reasoning is separated from opportunity data to reduce hallucinated recommendations. The recommendation endpoint only returns records from `backend/data/opportunities.json`.

## Architecture

```text
Voice or text
	|
	v
React conversation  --->  POST /api/profile  --->  potential transferable skills
	|                                      \
	|                                       --->  POST /api/recommend
	|                                                        |
	v                                                        v
Skill Bridge results  <----------------------- opportunities.json only
```

API surface:

- `POST /api/chat` accepts a conversational message and current profile.
- `POST /api/profile` returns the submitted profile and potential skills.
- `POST /api/recommend` returns at most three grounded opportunities.
- `GET /api/opportunities` returns the local opportunity dataset for inspection.

## Hackathon presentation input

### One-line pitch

AI Livelihood Navigator converts a person's spoken lived experience into a verified skill bridge, suitable opportunity shortlist, and practical learning roadmap.

### Problem

Many people know how to work but do not know the formal name of their skills, which jobs those skills can lead to, or what small training step would improve their income. Long forms and English-only career tools create another barrier.

### What is different

- Voice-first interaction with Kannada and English support.
- Skill Bridge explains the transition from an existing skill to a realistic next opportunity.
- Recommendations are grounded in a small verified-looking dataset instead of invented jobs.
- Every recommendation ends with a concrete four-step roadmap.

### Two-minute judge demo

1. Select Kannada or English.
2. Click **Try Demo** to guarantee a complete result even when a venue blocks microphone access.
3. Point out the Profile, Existing Skills, Skill Bridge, three grounded opportunities, and Roadmap.
4. Return home and show the six-question voice/text flow.
5. Explain that speech is a progressive enhancement and typed answers are the reliable fallback.

### Spoken demo script

**0:00-0:15 | Problem**

"Many people already have valuable work skills, but they do not know what those skills can become. Our app turns a person's story into a practical livelihood path."

**0:15-0:35 | Input**

Click **Try Demo** for a reliable result, or start the conversation and say:

"I am Ramesh. I completed 10th standard. I have farmed for four years, operate a tractor, and manage irrigation. I am interested in agriculture technology and want to increase my income."

**0:35-1:00 | Understanding**

"The app separates what the user confirmed from what it only suspects. Farming, tractor operation, and irrigation are existing skills. Resource management and supplier coordination are potential transferable skills that the user can confirm or remove."

**1:00-1:30 | Skill Bridge**

"This is our unique feature: the Skill Bridge. It explains what the person knows, what they can become, what they need to learn, and the next practical step."

**1:30-1:50 | Grounded opportunities**

"The recommendations are not invented by the model. They come only from our local opportunity dataset. Each card shows why it matches, the skill gap, training, and source."

**1:50-2:00 | Trust and impact**

"Voice makes the experience accessible, text keeps it reliable, Kannada improves inclusion, and the roadmap turns a recommendation into an action."

### Recommended improvements after the hackathon

- Replace browser-only speech recognition with a hosted speech-to-text service for more reliable Kannada transcription.
- Add consent, audio privacy messaging, and an explicit transcript correction step.
- Expand the verified opportunity and training-centre dataset with government or partner sources.
- Add outcome tracking: training enrollment, completion, placement, and user feedback.
- Add an LLM only for extracting structured skills; keep opportunity selection deterministic against the verified dataset.

## Checks

```powershell
npm run build
python -m compileall backend
python -m unittest discover -s tests -p "test_*.py"
```
