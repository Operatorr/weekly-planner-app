import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authenticateRequest } from "../_lib/auth.js";
import { parseBody, handleError } from "../_lib/validate.js";
import { processDictationSchema } from "../_lib/schemas.js";

const SYSTEM_PROMPT = `You are a task extraction assistant for a productivity app called DoMarrow. Your job is to extract actionable tasks from dictated text.

Rules:
- Extract every distinct task mentioned in the dictation
- Keep titles concise (under 80 characters) — use the description for detail
- Generate a description that adds context or clarifies the task
- Only add checklist items when sub-steps are clearly implied
- Infer due dates from temporal language using the provided today date and day of week
  - "today" → the provided today date
  - "tomorrow" → the day after today
  - "next week" → the Monday of next week
  - "this Friday" → the coming Friday relative to the provided day of week
  - If no time reference is given for a task, set due_date to null
- Dates must be in YYYY-MM-DD format
- Output ONLY the TOON format below — no preamble, no explanation, no markdown

Output format (TOON expanded list-item):

tasks[N]:
  - title: Short task title
    description: More context about the task
    due_date: YYYY-MM-DD
    checklist[N]: Step one,Step two,Step three
  - title: Another task
    description: Details here
    due_date: null

Where N is the count. Checklist line is omitted if there are no sub-steps.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    await authenticateRequest(req);
    const { transcription } = parseBody(req, processDictationSchema);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API key not configured" });
    }

    const model = process.env.OPENROUTER_MODEL || "google/gemini-2.5-flash-preview";

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const dayOfWeek = today.toLocaleDateString("en-US", { weekday: "long" });

    // Format user message in TOON
    const userMessage = `dictation:\n  text: ${transcription}\n  today: ${todayStr}\n  day_of_week: ${dayOfWeek}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://domarrow.app",
        "X-Title": "DoMarrow",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenRouter error:", response.status, err);
      return res.status(502).json({ error: "AI service request failed" });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return res.status(502).json({ error: "Empty response from AI service" });
    }

    // Parse TOON response, fall back to JSON
    let tasks;
    try {
      tasks = parseToonTasks(content);
      if (tasks.length === 0) throw new Error("No tasks parsed from TOON");
    } catch {
      try {
        const parsed = JSON.parse(content);
        tasks = Array.isArray(parsed) ? parsed : parsed.tasks;
      } catch {
        console.error("Failed to parse AI response:", content);
        return res.status(502).json({ error: "Failed to parse AI response" });
      }
    }

    return res.status(200).json({ tasks });
  } catch (err) {
    return handleError(err, res);
  }
}

// Inline minimal TOON parser
interface ToonTask {
  title: string;
  description: string;
  checklist?: string[];
  due_date?: string | null;
}

function parseToonTasks(raw: string): ToonTask[] {
  const tasks: ToonTask[] = [];
  const lines = raw.split("\n");
  let current: Partial<ToonTask> | null = null;

  for (const line of lines) {
    const itemMatch = line.match(/^\s*-\s+(\w+):\s*(.*)$/);
    if (itemMatch) {
      if (current?.title) tasks.push(normalize(current));
      current = {};
      setField(current, itemMatch[1], itemMatch[2]);
      continue;
    }
    const fieldMatch = line.match(/^\s{2,}(\w+(?:\[\d+\])?):\s*(.*)$/);
    if (fieldMatch && current) {
      setField(current, fieldMatch[1].replace(/\[\d+\]$/, ""), fieldMatch[2]);
    }
  }
  if (current?.title) tasks.push(normalize(current));
  return tasks;
}

function setField(task: Partial<ToonTask>, key: string, value: string) {
  const v = value.trim();
  if (key === "title") task.title = v;
  else if (key === "description") task.description = v;
  else if (key === "due_date") task.due_date = v === "null" || v === "" ? null : v;
  else if (key === "checklist" && v) {
    task.checklist = v.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function normalize(p: Partial<ToonTask>): ToonTask {
  return {
    title: p.title ?? "",
    description: p.description ?? "",
    ...(p.checklist && { checklist: p.checklist }),
    ...(p.due_date !== undefined && { due_date: p.due_date }),
  };
}
