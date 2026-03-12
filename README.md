# ResumeMatch — AI Resume Analyzer

Upload a resume, paste a job description, get instant ATS analysis with section-level feedback powered by Claude AI.

## Features
- PDF & TXT resume upload
- Match score with circular gauge
- Matched / missing skills
- Keyword suggestions
- ATS breakdown (keyword density, formatting, section clarity)
- Section-level analysis: Summary, Skills, Experience, Projects
- Suggested rewrites for weak sections
- Downloadable report

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Add your API key
Create `.env.local` in the root:
```
API_KEY=sk-ant-your-key-here
```
Get your key 

### 3. Run locally
```bash
npm run dev
```
Open http://localhost:3000

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)
```bash
npm install -g vercel
vercel
```
When prompted, add the environment variable:
- Key: `API_KEY`
- Value: `sk-ant-your-key-here`

### Option B — GitHub + Vercel Dashboard
1. Push this project to a GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/resume-analyzer.git
   git push -u origin main
   ```
2. Go to https://vercel.com → **Add New Project** → Import your repo
3. In **Environment Variables**, add:
   - `API_KEY` = your key
4. Click **Deploy** — done!

---

## Project Structure
```
resume-analyzer/
├── app/
│   ├── layout.jsx          # Root layout with fonts
│   ├── page.jsx            # Main UI (client component)
│   └── api/
│       ├── extract/
│       │   └── route.js    # PDF text extraction endpoint
│       └── analyze/
│           └── route.js    # Resume analysis endpoint
├── .env.local              # Local secrets (never commit)
├── .gitignore
├── next.config.js
└── package.json
```

## Security
- API key lives only in server-side API routes
- Never exposed to the browser
- `.env.local` is gitignored
