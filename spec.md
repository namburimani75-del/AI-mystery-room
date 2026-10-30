# AI Mystery Room — Project Specification

**Project Name:** AI Mystery Room
**Project Type:** AI-Powered Mystery Investigation Web Application
**Status:** Development
**Project Deadline:** 2 November, 11:59 PM
**AI Provider:** Google Gemini API

---

## 1. Project Overview

### 1.1 Description

AI Mystery Room is an AI-powered web application that allows users to create and solve interactive mystery cases using artificial intelligence.

Users enter a short story premise, select a difficulty level, and generate a complete mystery using the Google Gemini API. The application creates a mystery story containing suspects, clues, hints, and a hidden solution.

Players investigate the case by examining suspects, discovering clues, requesting hints, and identifying the culprit. After submitting an accusation, the application evaluates the player's answer and displays the final verdict, explanation, and score.

The application must generate unique mysteries based on user-provided premises rather than repeatedly displaying predefined sample cases.

### 1.2 Problem Statement

Traditional mystery games often rely on predefined stories, fixed suspects, and repetitive puzzles. This limits replayability and reduces user engagement.

AI Mystery Room addresses this limitation by generating dynamic mysteries using AI. It provides an interactive investigation experience in which each case can have a different story, set of suspects, clues, and solution.

### 1.3 Objectives

* Generate mysteries from user-provided story premises.
* Support Easy, Medium, and Hard difficulty levels.
* Generate structured and logically consistent mystery cases.
* Allow users to investigate suspects and discover clues.
* Provide optional hints during investigations.
* Support suspect accusations and automatic verdict generation.
* Calculate scores securely on the backend.
* Save completed and active cases in MongoDB.
* Provide a case history where users can revisit previously generated mysteries.
* Prevent duplicate sample cases and unnecessary hardcoded mystery data.
* Deploy the complete application and make it accessible through a live website.

### 1.4 Target Users

* Students interested in AI-powered applications.
* Mystery and detective game enthusiasts.
* Users who enjoy solving puzzles and investigating fictional crimes.
* Developers and evaluators exploring generative AI applications.

---

## 2. Technology Stack

### 2.1 Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* React Router DOM
* Axios

Responsibilities:

* Display the application interface.
* Collect the user's mystery premise.
* Allow difficulty selection.
* Display the generated story, suspects, and discovered clues.
* Provide investigation and accusation controls.
* Display results and scores.
* Display the user's case history.
* Communicate with the backend through REST APIs.

### 2.2 Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Google Gemini API using `@google/genai`
* Zod for request and AI response validation
* dotenv for environment configuration
* CORS for cross-origin requests

Responsibilities:

* Validate incoming API requests.
* Generate mysteries using Gemini.
* Validate generated mystery data.
* Store cases in MongoDB.
* Manage investigation progress.
* Process clue discovery and hint requests.
* Evaluate accusations.
* Calculate scores.
* Protect the hidden culprit and solution.
* Return consistent API responses.

### 2.3 Database

Use MongoDB Atlas in production.

Use Mongoose to define and manage the database schema.

### 2.4 AI Integration

Use the Google Gemini API to generate structured mystery cases.

AI generation must occur exclusively on the backend.

The Gemini API key must never be exposed to the frontend.

---

## 3. Core Features

### 3.1 Home Page

The home page introduces the game and provides navigation to the primary features.

Required elements:

* Application name: AI Mystery Room.
* Short project description.
* Start New Mystery button.
* View Case History button.
* Explanation of the three difficulty levels.
* Responsive navigation.

Expected behavior:

* Clicking Start New Mystery opens the mystery creation page.
* Clicking View Case History opens the saved cases page.

### 3.2 Create Mystery

Users create a new mystery by entering a premise and selecting a difficulty level.

Required fields:

**Mystery Premise**

* A text area for entering the story idea.
* Required field.
* Minimum length: 20 characters.
* Maximum length: 1,000 characters.
* Reject empty or whitespace-only input.

**Difficulty**

* Easy
* Medium
* Hard

Required buttons:

* Generate Mystery
* Cancel or Back

Example premise:

"A priceless diamond disappeared from a locked museum during a private event. Five people were inside the building, and each person claims to have been somewhere else when the diamond vanished."

Expected behavior:

1. Validate the premise.
2. Validate the selected difficulty.
3. Display a loading indicator.
4. Send the premise and difficulty to the backend.
5. Generate a new mystery using Gemini.
6. Validate the generated mystery.
7. Save the case in MongoDB.
8. Navigate to the Investigation Room.

If generation fails, display an understandable error and allow the user to retry.

Do not display a fake successful case when generation fails.

### 3.3 Investigation Room

The Investigation Room is the main gameplay interface.

It displays the generated mystery and allows the player to investigate.

Required sections:

**A. Case Information**

* Mystery title.
* Case ID.
* Difficulty level.
* Story description.
* Case status.
* Current score.

**B. Suspect Cards**

Each suspect must contain:

* Name.
* Description.
* Occupation or role.
* Relationship to the case.
* Alibi.
* Publicly available information relevant to the investigation.

Do not expose the actual culprit flag, hidden motive, secret solution, or private solution explanation through the suspect data.

**C. Clues**

Each clue must contain:

* Clue ID.
* Clue title.
* Clue description.
* Discovery status.

Undiscovered clues should be displayed as locked or hidden items without revealing their descriptions.

When the user discovers a clue:

1. Send a request to the backend.
2. Verify that the clue belongs to the specified case.
3. Verify that the case is active.
4. Mark the clue as discovered.
5. Return the clue description.
6. Update the player's progress and score.

A clue must not award points more than once.

**D. Hints**

Display a Request Hint button.

When the user requests a hint:

1. Verify that the case is active.
2. Check whether hints remain.
3. Select the next available hint.
4. Record that the hint was used.
5. Deduct the appropriate points on the backend.
6. Return the hint to the frontend.

Hints must guide the player without revealing the culprit directly.

**E. Progress**

Display:

* Total clues.
* Discovered clues.
* Hints used.
* Current score.
* Investigation progress.

**F. Accusation**

Provide an Accuse Suspect button that opens the accusation interface.

The user must select a suspect before submitting an accusation.

### 3.4 Accusation Page or Modal

The accusation interface allows the player to select the person they believe committed the crime.

Required elements:

* List of suspects.
* Suspect selection.
* Submit Accusation button.
* Confirmation message.
* Cancel button.

Expected behavior:

1. Validate that the selected suspect exists.
2. Confirm that the case is still active.
3. Submit the accusation to the backend.
4. Evaluate the accusation using the server-side solution.
5. Calculate the final score.
6. Mark the case as completed.
7. Return the result.

Only one final accusation is permitted per case.

The frontend must never determine whether an accusation is correct.

### 3.5 Results Page

Display the final outcome after the accusation.

Required elements:

* Case title.
* Verdict: Correct or Incorrect.
* Selected suspect.
* Actual culprit.
* Final score.
* Difficulty level.
* Explanation of the crime.
* Important clues that support the solution.
* Breakdown of score calculation.
* Play Again button.
* View Case History button.

The actual culprit and complete solution may be returned only after the backend confirms that the accusation has been submitted and the case is completed.

The result must explain how the evidence supports the culprit's identity.

### 3.6 Case History

Provide a dedicated page for previously generated cases.

Required elements:

* List of saved cases.
* Mystery title.
* Creation date.
* Difficulty.
* Case status.
* Score, if completed.
* View Case button.
* Delete Case button, if implemented.

History must display real cases retrieved from the backend and stored in MongoDB.

Do not populate the history with hardcoded sample cases, duplicate records, or fabricated entries.

Expected behavior:

1. Fetch saved cases from the backend.
2. Display the cases returned by the API.
3. Open the selected case using its actual database ID.
4. Restore the investigation state for active cases.
5. Display the final result for completed cases.

For the initial version, case history may be associated with the current browser session or a generated player identifier. If user authentication is implemented, history must be associated with the authenticated user.

Never expose one user's private cases to another authenticated user.

If the history is empty, display a clear message and a button to create a new mystery.

### 3.7 New Mystery

The user must be able to start a new mystery after completing a case.

Expected behavior:

* Open the Create Mystery page.
* Allow the user to enter a new premise.
* Allow a new difficulty selection.
* Generate a fresh case.
* Preserve previously saved cases in history.

Starting a new mystery must not overwrite or delete previous cases.

---

## 4. Difficulty Configuration

The backend must enforce the following difficulty configuration.

| Difficulty | Number of Suspects | Number of Clues | Number of Hints | Correct Accusation Points |
| ---------- | -----------------: | --------------: | --------------: | ------------------------: |
| Easy       |                  3 |               5 |               2 |                       100 |
| Medium     |                  4 |               7 |               3 |                       150 |
| Hard       |                  5 |               9 |               3 |                       200 |

Requirements:

* Easy mysteries should be relatively straightforward.
* Medium mysteries should require comparing multiple pieces of evidence.
* Hard mysteries should require deeper reasoning and identifying contradictions.
* Every mystery must have exactly one intended culprit.
* Every mystery must have a logically consistent explanation.
* All difficulty settings must be validated on the backend.

Do not allow Gemini to silently change the required suspect, clue, or hint counts.

---

## 5. AI Mystery Generation

### 5.1 Generation Requirements

The backend must send a structured prompt to Gemini containing:

* User-provided premise.
* Selected difficulty.
* Required suspect count.
* Required clue count.
* Required hint count.
* Mystery-generation rules.
* Logical consistency requirements.
* Output schema.

The model must generate a complete mystery rather than a title and a short description alone.

### 5.2 Required Mystery Structure

The generated mystery must contain:

1. A unique case title.
2. A detailed story.
3. A clearly defined crime or mystery.
4. The required number of suspects.
5. A plausible motive for each suspect.
6. An alibi for each suspect.
7. The required number of clues.
8. The required number of hints.
9. One hidden culprit.
10. A hidden explanation of the solution.
11. An evidence-based solution showing how the clues establish the culprit's responsibility.

### 5.3 AI Output Format

Gemini must return JSON matching the following logical structure:

```json
{
  "title": "The Missing Diamond",
  "story": "A diamond disappeared from a locked museum...",
  "difficulty": "Easy",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Alex Morgan",
      "description": "A museum employee...",
      "occupation": "Museum curator",
      "motive": "Publicly described motive...",
      "alibi": "Claims to have been in the archive...",
      "publicInformation": "Information available to the player..."
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "title": "The Broken Lock",
      "description": "A detailed piece of evidence...",
      "relevance": "How the evidence relates to the solution..."
    }
  ],
  "hints": [
    "Compare the suspects' alibis with the timeline.",
    "Pay attention to the evidence near the display case."
  ],
  "solution": {
    "culpritId": "suspect_1",
    "motive": "The hidden motive...",
    "explanation": "A complete explanation of the crime...",
    "supportingClueIds": [
      "clue_1"
    ]
  }
}
```

**Important:** This is an illustrative schema, not a complete valid case. Production validation must enforce the required number of suspects, clues, and hints for the selected difficulty.

The backend must not send the complete object to the frontend.

### 5.4 AI Response Validation

Use Zod to validate the response received from Gemini.

Validate:

* Required fields.
* Correct data types.
* Unique suspect IDs.
* Unique clue IDs.
* Correct difficulty.
* Exact suspect count.
* Exact clue count.
* Exact hint count.
* Valid culprit ID.
* Valid supporting clue IDs.
* Nonempty descriptions.
* A valid explanation.
* Consistency between clue references and generated entities.

If validation fails:

1. Do not save the invalid case.
2. Optionally request one controlled regeneration.
3. Validate the regenerated response.
4. If validation still fails, return a suitable error.
5. Do not expose the raw AI response or internal errors to the user.

### 5.5 Logical Consistency

Every mystery must have a defensible solution.

Requirements:

* Exactly one intended culprit.
* The culprit must be a valid suspect.
* The explanation must match the story.
* The clues must support the intended solution.
* The solution must not depend on evidence that is never presented.
* Red herrings must not make another suspect equally guilty.
* The hints must help investigation without immediately revealing the culprit.
* The solution must remain private until accusation submission.

AI-generated content must be checked structurally and, where practical, through additional consistency checks before being saved.

---

## 6. Backend Security and Solution Privacy

The culprit and solution must remain on the backend until the player submits an accusation.

### 6.1 Data Separation

Use separate representations for private and public case data.

**Private data:**

* Culprit ID.
* Hidden motive.
* Complete solution explanation.
* Internal evidence analysis.
* Any secret information that would reveal the solution prematurely.

**Public data:**

* Title.
* Story.
* Difficulty.
* Suspect information.
* Clue metadata.
* Discovered clue descriptions.
* Available hints.
* Player progress.

The backend may store both representations in the same MongoDB document, but all API responses must be explicitly constructed to exclude private fields during an active investigation.

### 6.2 Security Requirements

* Never expose the Gemini API key in React code.
* Never send the private solution through an active-case API response.
* Never rely on frontend checks to protect the culprit.
* Never accept a client-provided score as authoritative.
* Never accept a client-provided culprit as the correct answer.
* Validate all database IDs and request parameters.
* Prevent duplicate clue awards.
* Prevent repeated hint deductions for the same hint.
* Prevent accusations against nonexistent suspects.
* Prevent modifications to completed cases.
* Configure CORS for the deployed frontend.
* Use environment variables for secrets.
* Avoid logging API keys or private solution data.
* Apply reasonable rate limits to AI-generation endpoints.
* Use request validation and safe error messages.

### 6.3 Case Access

If authentication is not implemented, use a generated player/session identifier and validate it on the backend.

Do not trust an arbitrary case ID alone as authorization.

If authentication is implemented, verify that the authenticated user owns the requested case before allowing access or modification.

---

## 7. Scoring Rules

All scoring calculations must occur on the backend.

### 7.1 Correct Accusation

| Difficulty | Correct Accusation Points |
| ---------- | ------------------------: |
| Easy       |                       100 |
| Medium     |                       150 |
| Hard       |                       200 |

### 7.2 Clue Discovery

Each newly discovered clue awards:

**+5 points**

Requirements:

* Award points only once per clue.
* Repeated discovery requests must not award additional points.
* The backend must verify that the clue belongs to the requested case.

### 7.3 Hint Usage

Each hint used deducts:

**-10 points**

Requirements:

* Deduct points only when a valid hint is actually provided.
* Do not deduct points for failed requests.
* Do not allow the player to request more hints than the case provides.
* Do not allow duplicate requests to return the same hint while causing repeated deductions.

### 7.4 Final Score Formula

For a completed case:

`Final Score = Correct Accusation Points + (Unique Discovered Clues × 5) - (Hints Used × 10)`

If the accusation is incorrect, the correct-accusation bonus is zero.

The final score must never be negative.

Therefore:

`Final Score = max(0, Correct Accusation Bonus + Clue Points - Hint Penalties)`

### 7.5 Example

Suppose a player solves a Medium mystery.

* Correct accusation: 150 points.
* Discovered clues: 5 × 5 = 25 points.
* Hints used: 2 × 10 = 20 points.

Final score:

150 + 25 - 20 = **155 points**

The backend must calculate the score using the saved case state, not values submitted by the frontend.

---

## 8. Database Design

Use MongoDB with Mongoose.

### 8.1 Case Model

Create a `Case` model with the following fields:

| Field             | Type           | Description                   |
| ----------------- | -------------- | ----------------------------- |
| title             | String         | Mystery title                 |
| story             | String         | Public mystery story          |
| premise           | String         | User-provided premise         |
| difficulty        | String         | Easy, Medium, or Hard         |
| suspects          | Array          | Generated suspect information |
| clues             | Array          | Generated clue information    |
| hints             | Array          | Available hints               |
| solution          | Object         | Private solution information  |
| discoveredClueIds | Array          | IDs of discovered clues       |
| usedHintIds       | Array          | IDs of used hints             |
| accusation        | Object or null | Final accusation details      |
| score             | Number         | Current or final score        |
| status            | String         | Active or Completed           |
| playerId          | String         | Player/session identifier     |
| createdAt         | Date           | Case creation time            |
| updatedAt         | Date           | Last update time              |
| completedAt       | Date or null   | Case completion time          |

Use Mongoose timestamps where appropriate.

### 8.2 Suspect Structure

Each suspect must contain:

* `id`
* `name`
* `description`
* `occupation`
* `motive`
* `alibi`
* `publicInformation`

Only information safe for the investigation should be returned through public APIs.

### 8.3 Clue Structure

Each clue must contain:

* `id`
* `title`
* `description`
* `relevance`

Clue descriptions must only be returned when the clue is discovered, unless the UI needs a safe preview that does not reveal the evidence.

### 8.4 Hint Structure

Each hint must contain:

* `id`
* `text`

The backend must track which hints have already been used.

### 8.5 Solution Structure

The private solution must contain:

* `culpritId`
* `motive`
* `explanation`
* `supportingClueIds`

Never include the private solution in general case-list responses or active-case responses.

### 8.6 Case Status

Allowed values:

* `ACTIVE`
* `COMPLETED`

Completed cases must not accept additional clue discovery, hint usage, or accusation submissions.

### 8.7 Data Persistence

MongoDB must be the source of truth for case history and gameplay progress.

Refreshing the page must not erase saved cases or discovered clues.

Do not use static JavaScript arrays as the permanent case database.

If local storage is used to remember the current player/session identifier, it must not replace server-side case storage or authorization checks.

---

## 9. API Specification

Base URL during local development:

`http://localhost:5000`

Production frontend requests must use a configurable backend API base URL.

All endpoints must return JSON.

Use consistent error responses.

Example:

```json
{
  "success": false,
  "message": "The requested case was not found."
}
```

### 9.1 Health Check

**Endpoint:** `GET /api/health`

Purpose:

Check whether the backend is running.

Example response:

```json
{
  "success": true,
  "message": "AI Mystery Room API is running."
}
```

### 9.2 Generate Mystery

**Endpoint:** `POST /api/cases`

Request:

```json
{
  "premise": "A priceless painting disappeared from a locked gallery.",
  "difficulty": "Medium",
  "playerId": "generated-player-session-id"
}
```

Validation:

* Premise must contain between 20 and 1,000 characters.
* Difficulty must be Easy, Medium, or Hard.
* Player/session identifier must be valid.
* Rate limits must be enforced.

Response:

Return the public case representation and its database ID.

Do not return the private solution.

Expected status codes:

* `201`: Case created successfully.
* `400`: Invalid request.
* `429`: Rate limit exceeded.
* `502`: AI generation failed.
* `500`: Unexpected server error.

### 9.3 Retrieve Case

**Endpoint:** `GET /api/cases/:id`

Purpose:

Retrieve a case and its current investigation progress.

Requirements:

* Validate the case ID.
* Verify case access.
* Return public case information.
* Return discovered clues and used hints as appropriate.
* Do not reveal undiscovered clue descriptions.
* Do not reveal the private solution for an active case.

Expected status codes:

* `200`: Case retrieved.
* `400`: Invalid case ID.
* `403`: Access denied.
* `404`: Case not found.

### 9.4 Discover Clue

**Endpoint:** `POST /api/cases/:id/clues/:clueId/discover`

Purpose:

Discover a clue and award points.

Requirements:

* Case must exist.
* Case must be active.
* Player must have permission to access the case.
* Clue must belong to the case.
* Clue points must be awarded only once.

Example response:

```json
{
  "success": true,
  "clue": {
    "id": "clue_1",
    "title": "The Broken Lock",
    "description": "A detailed piece of evidence..."
  },
  "score": 25,
  "discoveredClueCount": 1
}
```

The score shown here is illustrative. The implementation must return the actual score calculated from the saved case state.

Expected status codes:

* `200`: Clue discovered.
* `400`: Invalid request.
* `403`: Access denied.
* `404`: Case or clue not found.
* `409`: Case already completed.

Repeated discovery requests must not award additional points.

### 9.5 Request Hint

**Endpoint:** `POST /api/cases/:id/hints`

Purpose:

Return the next available hint.

Requirements:

* Case must be active.
* Player must have permission to access the case.
* A hint must be available.
* Deduct 10 points only when a new hint is successfully provided.
* Record the hint as used.
* Prevent repeated deductions for the same hint.

Example response:

```json
{
  "success": true,
  "hint": {
    "id": "hint_1",
    "text": "Compare the suspects' alibis with the timeline."
  },
  "score": 15,
  "hintsRemaining": 2
}
```

The example score and remaining hint count are illustrative.

Expected status codes:

* `200`: Hint provided.
* `400`: Invalid request.
* `403`: Access denied.
* `404`: Case not found.
* `409`: No hints remain or case already completed.

### 9.6 Submit Accusation

**Endpoint:** `POST /api/cases/:id/accuse`

Request:

```json
{
  "suspectId": "suspect_2"
}
```

Requirements:

* Case must exist.
* Case must be active.
* Player must have permission to access the case.
* Suspect ID must belong to the case.
* The accusation must be evaluated on the backend.
* Final score must be calculated on the backend.
* The case must be marked completed.
* The result must include the culprit and explanation only after the accusation is submitted.

Example response:

```json
{
  "success": true,
  "result": {
    "correct": true,
    "accusedSuspectId": "suspect_2",
    "culpritId": "suspect_2",
    "explanation": "The evidence establishes the suspect's responsibility.",
    "score": 175
  }
}
```

All values in this example are illustrative.

Expected status codes:

* `200`: Accusation processed.
* `400`: Invalid request.
* `403`: Access denied.
* `404`: Case or suspect not found.
* `409`: Case already completed.

Only one final accusation is permitted per case.

### 9.7 Retrieve Result

**Endpoint:** `GET /api/cases/:id/result`

Purpose:

Retrieve the completed case result.

Requirements:

* Case must exist.
* Case must be completed.
* Player must have permission to access the case.
* Return the actual culprit, verdict, explanation, and final score.

Expected status codes:

* `200`: Result retrieved.
* `403`: Access denied.
* `404`: Case not found.
* `409`: Case is still active.

### 9.8 List Case History

**Endpoint:** `GET /api/cases`

Purpose:

Retrieve saved cases belonging to the current player.

Use a validated player/session identifier or authenticated user context.

Return a summary containing:

* Case ID.
* Title.
* Difficulty.
* Status.
* Creation date.
* Final score, if completed.

Do not return private solution fields in the list.

Support pagination if required.

### 9.9 Delete Case

**Endpoint:** `DELETE /api/cases/:id`

This endpoint is optional.

If implemented:

* Verify case ownership.
* Delete only the requested case.
* Return a clear success response.
* Do not delete other cases.
* Ensure the frontend updates the history list after deletion.

---

## 10. Frontend Page Structure

Recommended project structure:

```text
ai-mystery-room/
│
├── SPEC.md
├── README.md
├── .gitignore
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── SuspectCard.jsx
│   │   │   ├── ClueCard.jsx
│   │   │   ├── HintPanel.jsx
│   │   │   ├── ScoreBoard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ErrorMessage.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CreateMystery.jsx
│   │   │   ├── InvestigationRoom.jsx
│   │   │   ├── Results.jsx
│   │   │   └── CaseHistory.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env.example
│   └── package.json
│
└── server/
    ├── src/
    │   ├── config/
    │   │   └── database.js
    │   │
    │   ├── models/
    │   │   └── Case.js
    │   │
    │   ├── controllers/
    │   │   └── caseController.js
    │   │
    │   ├── routes/
    │   │   ├── caseRoutes.js
    │   │   └── healthRoutes.js
    │   │
    │   ├── services/
    │   │   ├── geminiService.js
    │   │   ├── scoringService.js
    │   │   └── caseService.js
    │   │
    │   ├── validators/
    │   │   ├── caseValidator.js
    │   │   └── mysteryValidator.js
    │   │
    │   ├── middleware/
    │   │   ├── errorHandler.js
    │   │   └── rateLimiter.js
    │   │
    │   └── app.js
    │
    ├── .env.example
    └── package.json
```

This structure is a recommendation. Adapt it to the existing repository if a project structure already exists.

Do not create duplicate files or rewrite working modules unnecessarily.

---

## 11. UI and User Experience Requirements

### 11.1 Design

Use a modern detective-themed interface.

Suggested visual direction:

* Dark navy or charcoal background.
* High-contrast text.
* Subtle gold or amber accents.
* Clear suspect cards.
* Evidence-board-inspired clue presentation.
* Readable typography.
* Clear status badges.
* Consistent buttons and spacing.

The design must prioritize usability rather than unnecessary animations.

### 11.2 Responsive Layout

The application must work on:

* Desktop computers.
* Laptops.
* Tablets.
* Mobile phones.

Use responsive Tailwind CSS classes.

Suspect cards and clue cards should adapt to available screen space.

### 11.3 Loading States

Display appropriate loading indicators during:

* Mystery generation.
* Case retrieval.
* Clue discovery.
* Hint requests.
* Accusation submission.
* Result retrieval.
* Case history loading.

Disable duplicate submissions while an operation is in progress.

### 11.4 Error Handling

Display clear messages for:

* Empty premise.
* Invalid difficulty.
* Mystery-generation failure.
* Backend unavailable.
* Database connection failure.
* Case not found.
* Invalid suspect selection.
* No hints remaining.
* Duplicate clue discovery.
* Completed case modification.
* Network failure.

Do not display raw stack traces or API keys.

### 11.5 Navigation

The user must be able to navigate between:

* Home.
* Create Mystery.
* Investigation Room.
* Results.
* Case History.

Use React Router DOM.

Refreshing a case-specific route must restore the saved case when the user has permission to access it.

Do not rely exclusively on in-memory React state for persistent game progress.

---

## 12. Environment Configuration

### 12.1 Backend Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```

Never commit this file to GitHub.

Create `server/.env.example` containing placeholder values only.

### 12.2 Frontend Environment Variables

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Create `client/.env.example` with the same variable and a placeholder value.

Only public configuration may use the `VITE_` prefix.

Never put `GEMINI_API_KEY` or MongoDB credentials in frontend environment variables.

### 12.3 Git Configuration

The `.gitignore` file must exclude:

```gitignore
node_modules/
.env
.env.*
!.env.example
dist/
coverage/
*.log
```

Adjust the configuration if the project requires additional files to be ignored.

Before pushing to GitHub, verify that no secrets have been committed.

---

## 13. Local Development Setup

### 13.1 Create Frontend

```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom axios
npm install tailwindcss @tailwindcss/vite
```

Configure Tailwind CSS according to the installed version.

### 13.2 Create Backend

From the project root:

```bash
mkdir server
cd server
npm init -y
npm install express cors dotenv mongoose @google/genai zod
npm install --save-dev nodemon
```

Add a development script to `server/package.json`:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js"
  }
}
```

Merge these scripts into the existing package configuration rather than replacing unrelated scripts.

### 13.3 Run the Backend

From the `server` directory:

```bash
npm run dev
```

Expected local address:

`http://localhost:5000`

### 13.4 Run the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

Expected local address:

`http://localhost:5173`

### 13.5 Verify MongoDB

Confirm that:

* The MongoDB connection succeeds.
* The server reports database connection status.
* New mysteries are saved successfully.
* Saved mysteries remain available after restarting the backend.
* The application handles database failures gracefully.

---

## 14. Testing Requirements

### 14.1 Mystery Generation Tests

Verify that:

* A valid premise generates a mystery.
* Easy produces 3 suspects, 5 clues, and 2 hints.
* Medium produces 4 suspects, 7 clues, and 3 hints.
* Hard produces 5 suspects, 9 clues, and 3 hints.
* Empty premises are rejected.
* Invalid difficulty values are rejected.
* Malformed AI output is rejected.
* A failed AI request does not create a fake case.
* Different premises can produce different cases.

### 14.2 Investigation Tests

Verify that:

* Suspects display correctly.
* Undiscovered clue descriptions remain hidden.
* Discovering a clue reveals its description.
* Each clue awards points only once.
* Hint usage deducts points only once.
* Hint limits are enforced.
* Active cases can be resumed after a refresh.
* Completed cases cannot be modified.

### 14.3 Accusation Tests

Verify that:

* Valid suspects can be accused.
* Invalid suspect IDs are rejected.
* Correct accusations receive the appropriate difficulty bonus.
* Incorrect accusations receive no correct-accusation bonus.
* Final scores cannot be negative.
* A second accusation is rejected.
* The actual culprit is revealed only after submission.
* The result explanation matches the stored solution.

### 14.4 History Tests

Verify that:

* Newly generated cases appear in history.
* Multiple cases are preserved.
* Cases are not duplicated by page refreshes.
* Active cases can be reopened.
* Completed cases show their saved results.
* History is retrieved from MongoDB.
* Unauthorized users cannot access another user's cases.

### 14.5 Deployment Tests

Verify that:

* The frontend loads on the production URL.
* The backend health endpoint responds.
* MongoDB connects successfully in production.
* Gemini generation works in production.
* Environment variables are configured correctly.
* CORS allows the deployed frontend.
* All gameplay endpoints work.
* Refreshing the page preserves saved progress.
* No private API keys appear in browser requests or frontend bundles.

---

## 15. Deployment Plan

### 15.1 Database Deployment

Use MongoDB Atlas.

Steps:

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Configure appropriate network access.
4. Obtain the MongoDB connection string.
5. Set `MONGODB_URI` in the backend hosting environment.
6. Verify the production connection.

Use a secure database password and appropriate network restrictions.

### 15.2 Backend Deployment

Deploy the Node.js backend to a suitable hosting provider.

Required production environment variables:

* `PORT`, if required by the provider.
* `MONGODB_URI`.
* `GEMINI_API_KEY`.
* `CLIENT_URL`.

Requirements:

* Start the server using the production command.
* Ensure the health endpoint works.
* Ensure API routes are accessible.
* Confirm the database connection.
* Confirm Gemini generation.
* Configure CORS for the actual frontend origin.

### 15.3 Frontend Deployment

Deploy the React/Vite frontend to Vercel.

Set the production environment variable:

`VITE_API_BASE_URL=https://your-backend-domain/api`

Replace the placeholder with the actual deployed backend URL.

If deploying from a monorepo, set the frontend root directory to `client`.

Build command:

```bash
npm run build
```

Output directory:

```text
dist
```

Configure SPA route rewrites if required so that refreshing a React Router route works correctly.

### 15.4 Production Verification

After deployment:

1. Open the live website.
2. Generate a mystery from a custom premise.
3. Confirm the selected difficulty is respected.
4. Investigate suspects.
5. Discover clues.
6. Request hints.
7. Submit an accusation.
8. Verify the verdict and score.
9. Return to case history.
10. Reopen the saved case.
11. Confirm that the game works without local development servers.

---

## 16. Acceptance Criteria

The project is considered complete when all mandatory criteria pass.

### Planning

* [ ] A complete `SPEC.md` exists in the project root.
* [ ] The technology stack and project structure are documented.
* [ ] API contracts and database requirements are documented.

### AI Generation

* [ ] Users can submit a custom premise.
* [ ] Easy, Medium, and Hard modes work.
* [ ] Gemini generates structured mystery data.
* [ ] AI output is validated before saving.
* [ ] Invalid generation responses are handled safely.

### Investigation

* [ ] The story and suspects display correctly.
* [ ] Clues can be discovered.
* [ ] Hints can be requested.
* [ ] Progress and score update correctly.
* [ ] Duplicate clue awards are prevented.

### Security

* [ ] The culprit remains hidden during active investigations.
* [ ] The solution is not returned by active-case endpoints.
* [ ] Accusations are evaluated on the backend.
* [ ] Scores are calculated on the backend.
* [ ] Secrets are not exposed in frontend code.

### Results and History

* [ ] Correct and incorrect accusations work.
* [ ] Results display the actual culprit and explanation.
* [ ] Case history displays real database records.
* [ ] Previous cases remain available after refresh.
* [ ] A new case does not overwrite existing cases.

### Deployment

* [ ] The frontend is deployed.
* [ ] The backend is deployed.
* [ ] MongoDB Atlas is connected.
* [ ] Gemini API integration works in production.
* [ ] The complete game works on the live website.

---

## 17. Development Rules for AI Coding Assistants

When using Codex or another AI coding assistant, follow these rules.

1. Read this `SPEC.md` completely before making code changes.
2. Inspect the existing repository before creating or modifying files.
3. Preserve working functionality and the existing project structure where practical.
4. Do not delete working features without a clear requirement.
5. Do not create duplicate components, API routes, or database models.
6. Do not introduce hardcoded sample mysteries into the production gameplay flow.
7. Generate mysteries from the premise submitted by the user.
8. Store generated cases and gameplay progress in MongoDB.
9. Keep the private solution on the backend.
10. Validate AI output before saving it.
11. Calculate scores exclusively on the backend.
12. Handle loading, success, and error states.
13. Use environment variables for configuration and secrets.
14. Test each feature after implementing it.
15. Fix errors before proceeding to the next major feature.
16. Keep the frontend and backend API contracts consistent.
17. Do not replace real API integration with mock data unless explicitly required for isolated testing.
18. Do not claim a feature works unless it has been implemented and verified.
19. Update this specification if a necessary architectural decision changes.
20. Before completing the project, run through every acceptance criterion.

### Recommended Implementation Order

**Step 1:** Inspect the repository and identify existing functionality.

**Step 2:** Finalize `SPEC.md` and the project architecture.

**Step 3:** Configure the Express server and MongoDB connection.

**Step 4:** Implement the Mongoose case model and validation schemas.

**Step 5:** Integrate Gemini and implement structured mystery generation.

**Step 6:** Implement the case retrieval and investigation APIs.

**Step 7:** Implement clue discovery, hints, accusations, and scoring.

**Step 8:** Implement secure result retrieval and case history.

**Step 9:** Build the React pages and connect them to the backend.

**Step 10:** Test all three difficulty levels and the complete game flow.

**Step 11:** Fix errors and verify solution privacy.

**Step 12:** Deploy the backend, configure MongoDB Atlas, and deploy the frontend.

**Step 13:** Test the complete experience on the production website.

**Step 14:** Update the README with setup instructions, environment variables, architecture, and deployment details.

**Step 15:** Submit the GitHub repository and live website URL.

---

## 18. Final Deliverables

The final submission must include:

1. **SPEC.md** — Complete project specification.
2. **Source Code** — Frontend and backend implementations.
3. **MongoDB Integration** — Persistent mystery storage.
4. **Gemini Integration** — AI-powered mystery generation.
5. **Investigation System** — Suspects, clues, hints, and accusations.
6. **Scoring System** — Backend-calculated scores.
7. **Case History** — Previously generated and completed cases.
8. **README.md** — Installation, setup, and usage instructions.
9. **GitHub Repository URL** — Complete source code.
10. **Live Website URL** — Deployed application.
11. **Working Demonstration** — Generate and solve a mystery on the live website.

### Submission Deadline

**2 November, 11:59 PM**

### Project Submission Form

https://bit.ly/ai-mystery-room-sub-form

---

## 19. Definition of Done

AI Mystery Room is complete when a user can open the deployed website, enter an original mystery premise, select a difficulty, generate a structured mystery, investigate suspects, discover clues, request hints, submit an accusation, receive a correct verdict and score, and revisit the saved case through case history.

All mystery generation must use the configured AI integration, all gameplay progress must persist in the database, scoring must be enforced on the backend, and the culprit must remain hidden until the accusation is submitted.

The final application must work on the deployed website without depending on a local development server.
