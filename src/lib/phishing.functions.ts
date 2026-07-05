import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  subject: z.string().max(500),
  sender: z.string().max(200),
  body: z.string().min(1).max(20000),
});

export type PhishingAnalysis = {
  verdict: "PHISHING" | "SAFE";
  confidence: number;
  risk_level: "Critical" | "High" | "Medium" | "Low";
  indicators: {
    suspicious_links: boolean;
    urgency_language: boolean;
    sender_mismatch: boolean;
    grammar_issues: boolean;
    personal_info_request: boolean;
    impersonation: boolean;
    suspicious_attachments: boolean;
  };
  explanation: string;
};

const SYSTEM_PROMPT = `You are an expert cybersecurity AI specializing in phishing email detection.
Analyze the provided email and return ONLY a JSON response in this exact format:
{
  "verdict": "PHISHING" or "SAFE",
  "confidence": 87.5,
  "risk_level": "Critical" or "High" or "Medium" or "Low",
  "indicators": {
    "suspicious_links": true,
    "urgency_language": true,
    "sender_mismatch": false,
    "grammar_issues": false,
    "personal_info_request": true,
    "impersonation": true,
    "suspicious_attachments": false
  },
  "explanation": "2-3 sentence explanation of findings"
}
Return ONLY valid JSON, no extra text.`;

export const analyzeEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<PhishingAnalysis> => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("AI service not configured");

    const userMsg = `Subject: ${data.subject}\nFrom: ${data.sender}\nBody:\n${data.body}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${SYSTEM_PROMPT}\n\n${userMsg}` }] },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit exceeded. Please try again shortly.");
      throw new Error(`AI gateway error: ${res.status}`);
    }

    const json = await res.json();
    const content: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const cleaned = content.replace(/```json|```/g, "").trim();
    let parsed: PhishingAnalysis;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned an invalid response. Please try again.");
    }
    return parsed;
  });