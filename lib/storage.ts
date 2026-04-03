export type SavedEmail = {
  id: string;
  playbookId: string;
  templateId: string;
  templateLabel: string;
  subject: string;
  body: string;
  createdAt: string;
};

export type CustomTemplate = {
  id: string;
  title: string;
  subject: string;
  body: string;
  sourcePlaybookId: string;
  sourceTemplateId: string;
  createdAt: string;
};

const EMAILS_KEY = "arcmail_emails";
const TEMPLATES_KEY = "arcmail_templates";

/* ---------------- EMAILS ---------------- */

export function getEmails(): SavedEmail[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(EMAILS_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEmail(email: SavedEmail) {
  const emails = getEmails();
  const updated = [email, ...emails];
  localStorage.setItem(EMAILS_KEY, JSON.stringify(updated));
}

/* ---------------- CUSTOM PLAYBOOKS ---------------- */

export function getCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined") return [];

  const raw = localStorage.getItem(TEMPLATES_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomTemplate(template: CustomTemplate) {
  const templates = getCustomTemplates();
  const updated = [template, ...templates];
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
}