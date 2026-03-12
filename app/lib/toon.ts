/**
 * Minimal TOON parser for the expected LLM response format.
 * Only handles: expanded list-item arrays with key-value fields,
 * inline primitive arrays, and null values.
 */

interface ToonTask {
  title: string;
  description: string;
  checklist?: string[];
  due_date?: string | null;
}

export function parseToonTasks(raw: string): ToonTask[] {
  const tasks: ToonTask[] = [];
  const lines = raw.split("\n");

  let current: Partial<ToonTask> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // New list item: "  - key: value"
    const itemMatch = line.match(/^\s*-\s+(\w+):\s*(.*)$/);
    if (itemMatch) {
      // Push previous task
      if (current?.title) {
        tasks.push(normalizeToonTask(current));
      }
      current = {};
      const [, key, value] = itemMatch;
      setField(current, key, value);
      continue;
    }

    // Continuation field: "    key: value" (indented, no dash)
    const fieldMatch = line.match(/^\s{2,}(\w+(?:\[\d+\])?):\s*(.*)$/);
    if (fieldMatch && current) {
      const [, rawKey, value] = fieldMatch;
      const key = rawKey.replace(/\[\d+\]$/, "");
      setField(current, key, value);
      continue;
    }
  }

  // Push last task
  if (current?.title) {
    tasks.push(normalizeToonTask(current));
  }

  return tasks;
}

function setField(task: Partial<ToonTask>, key: string, value: string) {
  const trimmed = value.trim();

  if (key === "title") {
    task.title = trimmed;
  } else if (key === "description") {
    task.description = trimmed;
  } else if (key === "due_date") {
    task.due_date = trimmed === "null" || trimmed === "" ? null : trimmed;
  } else if (key === "checklist") {
    // Inline array: "item1,item2,item3"
    if (trimmed) {
      task.checklist = trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
}

function normalizeToonTask(partial: Partial<ToonTask>): ToonTask {
  return {
    title: partial.title ?? "",
    description: partial.description ?? "",
    ...(partial.checklist && { checklist: partial.checklist }),
    ...(partial.due_date !== undefined && { due_date: partial.due_date }),
  };
}
