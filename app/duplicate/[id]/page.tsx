"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSavedEmails, saveEmail, type SavedEmail } from "@/lib/storage";
import { downloadHtmlFile } from "@/lib/exportHtml";

export default function DuplicateEmailPage() {
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const [email, setEmail] = useState<SavedEmail | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const emails = getSavedEmails();
    const found = emails.find((item) => item.id === id) ?? null;

    if (found) {
      setEmail(found);
      setSubject(found.subject);
      setBody(found.body);
    }
  }, [id]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      alert("Email copied");
    } catch {
      alert("Copy failed");
    }
  }

  function handleDownloadText() {
    const content = `Subject: ${subject}\n\n${body}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "duplicated-email.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function handleDownloadHtml() {
    downloadHtmlFile(subject, body, "duplicated-email", {
      companyName,
      logoUrl,
    });
  }

  function handleSaveAsNew() {
    if (!email) return;

    const newId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    saveEmail({
      id: newId,
      playbookId: email.playbookId,
      templateId: email.templateId,
      templateLabel: `${email.templateLabel} Copy`,
      subject,
      body,
      createdAt: new Date().toISOString(),
    });

    setSavedMessage("Saved as a new email");
    setTimeout(() => setSavedMessage(""), 2000);
  }

  if (!email) {
    return (
      <main className="main">
        <section className="container">
          <div className="glassCard emptyState">
            <h1 className="pageTitle">Email not found</h1>
            <p className="muted">Could not load this saved email.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="container">
        <div className="pageHeader">
          <div className="badge">Duplicate & Edit</div>
          <h1 className="pageTitle" style={{ marginTop: 14 }}>
            Edit Your Saved Email
          </h1>
          <p className="muted">
            Make changes, then save this as a new version.
          </p>
        </div>

        <div className="editorLayout">
          <div className="formCard">
            <h3 className="cardTitle">Edit Email</h3>

            <div className="formGroup">
              <label className="label" htmlFor="subject">
                Subject
              </label>
              <input
                id="subject"
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="formGroup">
              <label className="label" htmlFor="body">
                Body
              </label>
              <textarea
                id="body"
                className="input"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter email body"
                rows={16}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="companyName" className="label">
                Brand / Company Name
              </label>
              <input
                id="companyName"
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name for HTML export"
              />
            </div>

            <div className="formGroup">
              <label htmlFor="logoUrl" className="label">
                Logo URL
              </label>
              <input
                id="logoUrl"
                className="input"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="Paste logo image URL (optional)"
              />
            </div>

            <div className="toolbar">
              <button className="button buttonPrimary" onClick={handleCopy}>
                Copy Email
              </button>
              <button className="button buttonSecondary" onClick={handleDownloadText}>
                Download TXT
              </button>
              <button className="button buttonSecondary" onClick={handleDownloadHtml}>
                Export HTML
              </button>
              <button className="button buttonSecondary" onClick={handleSaveAsNew}>
                Save As New
              </button>
            </div>

            {savedMessage ? <p className="notice">{savedMessage}</p> : null}

            <div className="toolbar">
              <button
                className="button buttonSecondary"
                onClick={() => router.push("/history")}
              >
                Back to History
              </button>
            </div>
          </div>

          <div className="previewCard">
            <div className="previewLabel">Live Preview</div>

            <div className="previewLabel" style={{ marginTop: 10 }}>
              Subject
            </div>
            <div className="previewBox">{subject}</div>

            <div className="previewSpacer" />

            <div className="previewLabel">Body</div>
            <div className="previewBox">{body}</div>
          </div>
        </div>
      </section>
    </main>
  );
}