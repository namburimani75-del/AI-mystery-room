# 🔍 AI Mystery Room

A full-stack, AI-powered detective investigation web application. Enter a story premise, choose a difficulty, and let **Google Gemini AI** craft a complete mystery — unique suspects, hidden clues, strategic hints, and a secret culprit only revealed upon your accusation.

---

## ✨ Features

- **AI-Generated Mysteries** — Every case is uniquely created by Gemini based on your premise
- **3 Difficulty Levels** — Easy (3 suspects, 5 clues), Medium (4 suspects, 7 clues), Hard (5 suspects, 9 clues)
- **Clue Discovery** — Investigate evidence systematically (+5 pts each)
- **Hint System** — Request strategic hints with a score penalty (−10 pts each)
- **Detective Scoring** — Server-side scoring: clue points + accusation bonus − hint deductions
- **Case History** — All cases persisted in MongoDB; reopen active cases with full state restored
- **Result Page** — Full solution reveal with culprit, motive, explanation, and supporting evidence
- **Security-First** — Hidden solution never exposed in API responses during active investigation

---

## 🧱 Technology Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 18, Vite, JavaScript, Tailwind CSS v4   |
| Routing     | React Router DOM v6                           |
| HTTP Client | Axios                                         |
| Icons       | Lucide React                                  |
| Backend     | Node.js, Express.js (ESM)                     |
| AI          | Google Gemini API (`@google/genai`)           |
| Database    | MongoDB Atlas + Mongoose                      |
| Validation  | Zod (AI response + request validation)        |
| Security    | Helmet, CORS, express-rate-limit              |
| Deployment  | Frontend → Vercel, Backend → Railway/Render   |

---

## 🏗️ Architecture

```
Mystery_room_AI/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Landing page
│   │   │   ├── CreateMysteryPage.jsx # Mystery generation form
│   │   │   ├── InvestigationPage.jsx # Main gameplay UI
│   │   │   ├── ResultPage.jsx        # Case result + solution reveal
│   │   │   └── CaseHistoryPage.jsx   # All cases list
│   │   ├── services/
│   │   │   └── api.js               # Centralized axios API service
│   │   ├── App.jsx                  # Router setup
│   │   ├── main.jsx                 # Entry point
│   │   └── index.css               # Design system (dark gold theme)
│   ├── vercel.json                 # SPA routing for Vercel
│   ├── vite.config.js
│   └── .env.example
│
└── server/                    # Express.js backend
    ├── src/
    │   ├── config/
    │   │   └── database.js          # MongoDB connection
    │   ├── models/
    │   │   └── Case.js             # Mongoose schema (all case data)
    │   ├── services/
    │   │   ├── geminiService.js    # Gemini AI integration + validation
    │   │   └── caseService.js      # Business logic (scoring, privacy)
    │   ├── controllers/
    │   │   └── caseController.js   # HTTP request handlers
    │   ├── routes/
    │   │   ├── cases.js            # Case API routes
    │   │   └── health.js           # Health check
    │   ├── validators/
    │   │   └── schemas.js          # Zod validation schemas
    │   ├── middleware/
    │   │   └── errorHandler.js     # Global error handler
    │   └── index.js               # Express app entry point
    ├── .env.example
    └── package.json
```

---

## 📋 Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB Atlas account (free tier works)
- Google AI Studio API key (free at [aistudio.google.com](https://aistudio.google.com))

---

## 🚀 Local Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Mystery_room_AI
```

### 2. Setup Backend

```bash
cd server
npm install
cp .env.example .env
# → Edit .env with your real values (see Environment Variables section)
```

### 3. Setup Frontend

```bash
cd ../client
npm install
cp .env.example .env
# → Edit .env if your backend runs on a different port
```

---

## 🔑 Environment Variables

### Backend (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mystery-room?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
GEMINI_MODEL=gemini-1.5-flash
NODE_ENV=development
```

### Frontend (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000
```

> ⚠️ **Never commit `.env` files to version control.**

---

## ▶️ Running Locally

### Start Backend

```bash
cd server
npm run dev
# Server starts at http://localhost:5000
# Check: http://localhost:5000/api/health
```

### Start Frontend

```bash
cd client
npm run dev
# Frontend starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🍃 MongoDB Atlas Configuration

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write permissions
3. Allow your IP (or `0.0.0.0/0` for development)
4. Copy the connection string and set it as `MONGODB_URI`
5. The `mystery-room` database and `cases` collection are created automatically

---

## 🤖 Gemini API Configuration

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Create a new API key
3. Set it as `GEMINI_API_KEY` in `server/.env`
4. Default model: `gemini-1.5-flash` (configurable via `GEMINI_MODEL`)

---

## 🎮 Gameplay & Scoring

```
Final Score = max(0, Accusation Bonus + Discovered Clues × 5 − Hints Used × 10)
```

| Difficulty | Suspects | Clues | Hints | Accusation Bonus |
|------------|----------|-------|-------|-----------------|
| Easy       | 3        | 5     | 2     | +100 pts        |
| Medium     | 4        | 7     | 3     | +150 pts        |
| Hard       | 5        | 9     | 3     | +200 pts        |

**Security rules:**
- All scoring is enforced server-side
- Hidden culprit ID never returned to client during active case
- Undiscovered clue descriptions never returned before discovery
- Duplicate clue/hint requests do not award extra points (atomic DB operations)
- Completed cases cannot be modified

---

## 🔌 API Endpoints

```
GET    /api/health                           — Health check
POST   /api/cases                            — Create new mystery (calls Gemini)
GET    /api/cases                            — Get all cases for player
GET    /api/cases/:id                        — Get case (active or completed view)
POST   /api/cases/:id/clues/:clueId/discover — Discover a clue (+5 pts)
POST   /api/cases/:id/hints                  — Request a hint (−10 pts)
POST   /api/cases/:id/accuse                 — Make final accusation
GET    /api/cases/:id/result                 — Get completed case result
DELETE /api/cases/:id                        — Delete a case
```

All endpoints require `x-player-id` header or `playerId` query param for access control.

---

## 🧪 Testing

### Manual Test Workflow

1. **Health**: `GET http://localhost:5000/api/health`
2. **Generate**: Create a mystery with premise + difficulty
3. **Investigate**: Discover clues, request hints, verify score updates
4. **Accuse**: Submit accusation, verify final score calculation
5. **History**: Refresh page, verify case persists with full state

### Security Checks

- Verify no `culpritId`, `privateMotive`, or `explanation` in active case API response
- Verify undiscovered clue descriptions are `null` in API response
- Verify invalid case IDs return 404, not 500
- Try sending `score: 999` in request body — server ignores it

---

## 🚢 Deployment

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import repo in Vercel
3. Set root directory to `client`
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend.railway.app`
5. Deploy — `vercel.json` handles SPA routing

### Backend → Railway / Render

1. Push `server/` to GitHub
2. Create new Web Service pointing to `server/`
3. Set start command: `npm start`
4. Add all environment variables from `server/.env.example`
5. Set `CLIENT_URL` to your Vercel frontend URL
6. Deploy

### MongoDB Atlas

- Already configured via `MONGODB_URI`
- Add your production server's IP to Atlas IP allowlist (or use `0.0.0.0/0`)

---

## ⚠️ Known Limitations

- AI generation takes 10–30 seconds (Gemini model response time)
- Rate limiting: 20 mystery generations per IP per hour
- Player identity uses `localStorage` (not user authentication) — cases are browser-session-tied
- No real-time multiplayer
- Gemini model availability depends on Google API quotas

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `server/src/services/geminiService.js` | Gemini AI prompt + validation |
| `server/src/services/caseService.js` | All scoring + privacy logic |
| `server/src/validators/schemas.js` | Zod schemas for AI + requests |
| `server/src/models/Case.js` | Full Mongoose case schema |
| `client/src/services/api.js` | Frontend API service |
| `client/src/pages/InvestigationPage.jsx` | Main gameplay UI |

---

## 🔗 Links

- **Live Website**: *(Add after deployment)*
- **GitHub Repository**: *(Add your repo URL)*
- **Google AI Studio**: https://aistudio.google.com
- **MongoDB Atlas**: https://www.mongodb.com/atlas
