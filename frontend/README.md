# PG Finder AI - Frontend Web Application

Modern Next.js & TypeScript web application for college student PG accommodation search and local AI evaluation in India.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend API**: FastAPI (`http://127.0.0.1:8000`)
- **Local AI Engine**: Ollama (`llama3.2:3b`)

## 📁 Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind CSS styling and theme
│   │   ├── layout.tsx          # Root layout and metadata
│   │   └── page.tsx            # Main PG explorer and AI assistant dashboard
│   ├── components/
│   │   ├── Navbar.tsx          # Header with branding and live API health status
│   │   ├── HeroSection.tsx     # Student search hero with quick city tags
│   │   ├── FilterBar.tsx       # Dynamic filters (budget, room type, amenities)
│   │   ├── PGCard.tsx          # Accommodation card with verification badges
│   │   ├── PGModal.tsx         # Detailed accommodation popup dialog
│   │   ├── AIChatSection.tsx   # Ollama AI chat assistant with suggested prompts
│   │   ├── EmptyState.tsx      # Friendly empty search results state
│   │   └── Footer.tsx          # Project disclaimer & architecture info
│   ├── lib/
│   │   └── api.ts              # Fetch client communicating with FastAPI
│   └── types/
│       └── pg.ts               # TypeScript schemas matching backend Pydantic models
├── public/                     # Static assets
├── .env.example                # Configuration template
├── .env.local                  # Local environment settings
├── package.json                # Node dependencies
└── tsconfig.json               # TypeScript configuration
```

## 💻 Quickstart (Windows PowerShell)

### Step 1: Open Terminal & Navigate to Frontend
```powershell
cd "c:\Users\ARP INFOTECH\Desktop\PG finder -Ai\frontend"
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Start the Development Server
```powershell
npm run dev
```

The web application will be accessible at:
👉 **[http://localhost:3000](http://localhost:3000)** (or `http://127.0.0.1:3000`)

---

## 🔗 Running Alongside the Backend

1. **Terminal 1 (Backend - FastAPI)**:
   ```powershell
   cd "c:\Users\ARP INFOTECH\Desktop\PG finder -Ai\backend"
   .\.venv\Scripts\Activate.ps1
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Terminal 2 (Frontend - Next.js)**:
   ```powershell
   cd "c:\Users\ARP INFOTECH\Desktop\PG finder -Ai\frontend"
   npm run dev
   ```

3. **Terminal 3 (Local Ollama daemon)**:
   Ensure Ollama is running in Windows background with `llama3.2:3b`.
