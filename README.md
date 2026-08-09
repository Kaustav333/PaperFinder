# PaperFind

A full-stack, polished research paper search engine that aggregates results from Semantic Scholar, OpenAlex, and arXiv.

## Features
- **Parallel Search**: Queries 3 APIs simultaneously and merges the results.
- **Deduplication**: Automatically deduplicates papers using exact DOI matches and fuzzy title matching.
- **Smart Ranking**: Ranks results based on relevance to query and total citation count.
- **Caching**: Queries are cached locally (SQLite) for 24 hours to prevent API rate limiting and speed up repeat searches.
- **Minimal, Considered UI**: Built with React and Tailwind CSS featuring a clean typography stack (Playfair Display + Work Sans) and information-dense result cards.

## Prerequisites
- **Python 3.10+**
- **Node.js 18+** and npm

## Setup & Running Locally

You need to run both the backend and frontend servers simultaneously.

### 1. Backend Setup

Open a terminal and navigate to the `backend` folder:

```bash
cd backend
```

Create a virtual environment (optional but recommended):
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Run the FastAPI server:
```bash
uvicorn main:app --reload
```
The backend will start at `http://127.0.0.1:8000`.

*(Optional: You can copy `.env.example` to `.env` if you wish to add API keys later. Currently, the app works fine without them for low volume searches.)*

### 2. Frontend Setup

Open a **new** terminal and navigate to the `frontend` folder:

```bash
cd frontend
```

Install the Node modules:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The frontend will start at `http://localhost:5173`. Open this URL in your browser to start searching!

## Architecture Details
- **Backend Framework**: FastAPI for high performance asynchronous endpoint serving.
- **HTTP Client**: `httpx` to trigger all 3 API searches in parallel.
- **Deduplication**: `thefuzz` library.
- **Frontend Framework**: React 18 initialized via Vite (TypeScript).
- **Styling**: Tailwind CSS with custom font families. Icons via `lucide-react`.
