const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// ----------------------
// ✅ Schema
// ----------------------
const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ),

  title: z.string(),
});

// ----------------------
// 🔁 Retry Helper
// ----------------------
async function generateWithRetry(fn, retries = 2) {
  try {
    return await fn();
  } catch (err) {
    if (retries === 0) throw err;
    console.warn("Retrying due to:", err.message);
    return generateWithRetry(fn, retries - 1);
  }
}

// ----------------------
// 🔥 NORMALIZERS (BULLETPROOF)
// ----------------------
function ensureQuestionArray(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          question: item.question || "Default question",
          intention: item.intention || "Not provided",
          answer: item.answer || "Not provided",
        };
      }

      if (typeof item === "string") {
        return {
          question: item,
          intention: "Not provided",
          answer: "Not provided",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function ensureSkillArray(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          skill: item.skill || "Unknown skill",
          severity: ["low", "medium", "high"].includes(item.severity)
            ? item.severity
            : "medium",
        };
      }

      if (typeof item === "string") {
        return {
          skill: item,
          severity: "medium",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function ensurePlanArray(arr) {
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item, index) => {
      if (typeof item === "object" && item !== null) {
        return {
          day: typeof item.day === "number" ? item.day : index + 1,
          focus: item.focus || "General practice",
          tasks: Array.isArray(item.tasks) ? item.tasks : ["Practice"],
        };
      }

      if (typeof item === "string") {
        return {
          day: index + 1,
          focus: item,
          tasks: [item],
        };
      }

      return null;
    })
    .filter(Boolean);
}

// ----------------------
// 🧠 FINAL VALIDATOR
// ----------------------
function validateAndFix(parsed) {
  return {
    matchScore:
      typeof parsed.matchScore === "number" ? parsed.matchScore : 50,

    technicalQuestions: ensureQuestionArray(parsed.technicalQuestions),
    behavioralQuestions: ensureQuestionArray(parsed.behavioralQuestions),
    skillGaps: ensureSkillArray(parsed.skillGaps),
    preparationPlan: ensurePlanArray(parsed.preparationPlan),

    title:
      typeof parsed.title === "string"
        ? parsed.title
        : "Interview Report",
  };
}

// ----------------------
// 🚀 Main Function
// ----------------------
async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `
Generate a STRICT JSON interview report.

IMPORTANT:
- Return ONLY JSON
- Do NOT return strings for arrays
- Follow exact structure

Schema:
{
  "matchScore": number,
  "technicalQuestions": [{ "question": "", "intention": "", "answer": "" }],
  "behavioralQuestions": [{ "question": "", "intention": "", "answer": "" }],
  "skillGaps": [{ "skill": "", "severity": "low|medium|high" }],
  "preparationPlan": [{ "day": number, "focus": "", "tasks": [] }],
  "title": ""
}

Candidate Details:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;

  return generateWithRetry(async () => {
    const response = await ai.models.generateContent({
      // ✅ WORKING MODEL
      model: "gemini-3-flash-preview",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        responseSchema: zodToJsonSchema(interviewReportSchema),
      },
    });

    // console.log("RAW RESPONSE:", response.text);

    let parsed;
    try {
      parsed = JSON.parse(response.text);
    } catch (err) {
      throw new Error("Invalid JSON from LLM");
    }

    const report = validateAndFix(parsed);

    // ✅ FINAL SAFETY CHECK (prevents DB crash)
    if (
      !report.technicalQuestions.length ||
      !report.behavioralQuestions.length
    ) {
      throw new Error("AI returned insufficient data");
    }

    return report;
  });
}
module.exports = generateInterviewReport;