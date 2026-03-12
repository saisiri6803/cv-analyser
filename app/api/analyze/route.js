export const maxDuration = 60;

export async function POST(request) {
  try {
    const { resumeText, jobDesc } = await request.json();

    if (!resumeText || !jobDesc) {
      return Response.json({ error: "Missing resume or job description" }, { status: 400 });
    }

    const apiKey = process.env.API_KEY;

    const prompt = `You are an expert ATS resume analyzer and career coach with deep knowledge across ALL industries and job roles including Software Engineering, HR, Finance, Marketing, Sales, Operations, Healthcare, Legal, Education, Design, Data Science, and more.
    STEP 1 — AUTO-DETECT THE ROLE DOMAIN from the job description:
      - Software / Tech / Engineering
      - HR / People Operations / Talent Acquisition
      - Finance / Accounting / Banking / Investment
      - Marketing / Growth / Content / SEO
      - Sales / Business Development
      - Operations / Supply Chain / Logistics
      - Healthcare / Medical / Nursing
      - Legal / Compliance / Risk
      - Design / UX / Creative
      - Data / Analytics / BI
      - Education / Training / L&D
      - Management / Leadership / Strategy
      - Other (detect and handle)
CRITICAL MATCHING RULES — follow these strictly:
1. Treat abbreviations and full forms as IDENTICAL:
   - "Gen AI" = "Generative AI" = "GenAI"
   - "ML" = "Machine Learning"
   - "DL" = "Deep Learning"
   - "NLP" = "Natural Language Processing"
   - "CV" = "Computer Vision"
   - "LLM" = "Large Language Model"
   - "RAG" = "Retrieval Augmented Generation"
   - "JS" = "JavaScript"
   - "TS" = "TypeScript"
   - "PY" = "Python"
   - "K8s" = "Kubernetes"
   - "DB" = "Database"
   - "API" = "REST API" = "RESTful API"
   - "CI/CD" = "Continuous Integration" = "Continuous Deployment"
   - "AWS" = "Amazon Web Services"
   - "GCP" = "Google Cloud Platform"
   - "OOP" = "Object Oriented Programming"
   - "AI"  = "Artificial Intelligence"
    "P&L" = "Profit and Loss", "B2B" = "Business to Business"
   - "HR" = "Human Resources", "TA" = "Talent Acquisition"
   - "KPI" = "Key Performance Indicator", "OKR" = "Objectives and Key Results"
   - "CRM" = "Customer Relationship Management"
   - "ERP" = "Enterprise Resource Planning"
   - "ROI" = "Return on Investment", "ARR" = "Annual Recurring Revenue"
   - "SLA" = "Service Level Agreement", "SOW" = "Statement of Work"
   - "M&A" = "Mergers and Acquisitions"
   - "GAAP" = "Generally Accepted Accounting Principles"
   - "ATS" = "Applicant Tracking System"
   - "L&D" = "Learning and Development"
   - "DEI" = "Diversity Equity Inclusion"

2. Treat semantic equivalents as MATCHED:
   - "Built X" = "Experience with X" = "Worked on X"
   - "React" = "ReactJS" = "React.js"
   - "Node" = "NodeJS" = "Node.js"
   - "Postgres" = "PostgreSQL"
   - "Mongo" = "MongoDB"
   - "Led team" = "Team lead" = "Managed team"
   - "Increased revenue" = "Revenue growth" = "Drove sales"
   - "Reduced costs" = "Cost optimization" = "Cost savings"
   - "Stakeholder management" = "Client management" = "Client relations"

3. RESUME SKILLS — extract ALL skills mentioned anywhere in the resume:
   - Programming languages, frameworks, libraries, frontend, backend, Testing
   - Tools, platforms, cloud services
   - Concepts, methodologies (Agile, Scrum, etc.)
   - Soft skills if explicitly mentioned
   - Certifications and courses

4. A skill counts as MATCHED if the resume contains it in ANY form (abbreviation, synonym, related term).

5. A skill is MISSING only if there is genuinely NO mention of it or any equivalent in the resume.

6. For Suggested Improvement think and suggest like a Human with simple and professional tone

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDesc}

Return this exact JSON (no markdown, no backticks):
{
  "matchScore": <0-100 integer>,
  "verdict": "<2-sentence summary of overall fit>",
  "matchedSkills": ["skill1","skill2"],
  "missingSkills": ["skill1","skill2"],
  "suggestedKeywords": ["kw1","kw2"],
  "allResumeSkills": ["every single skill found in resume"],
  "atsScore": <0-100>,
  "atsBreakdown": {
    "keywordDensity": <0-100>,
    "formatting": <0-100>,
    "sectionClarity": <0-100>
  },
  "sections": {
    "Summary": {
      "score": <0-100>,
      "feedback": "<2-3 sentence feedback>",
      "weakPoints": ["point1","point2"],
      "rewrite": "<improved version tailored to the job>"
    },
    "Skills": {
      "score": <0-100>,
      "feedback": "<feedback>",
      "weakPoints": ["point1"],
      "rewrite": "<suggested skills section>"
    },
    "Experience": {
      "score": <0-100>,
      "feedback": "<feedback>",
      "weakPoints": ["weak bullet 1","weak bullet 2"],
      "rewrite": "<example of a rewritten strong bullet>"
    },
    "Projects": {
      "score": <0-100>,
      "feedback": "<feedback>",
      "weakPoints": ["point1"],
      "rewrite": "<suggested improvement>"
    }
  },
  "topImprovements": ["improvement1","improvement2","improvement3","improvement4","improvement5"]
}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are an expert ATS resume analyzer. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "API error");

    const result = JSON.parse(data.choices[0].message.content);
    return Response.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    return Response.json({ error: err.message || "Analysis failed" }, { status: 500 });
  }
}