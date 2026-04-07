"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEmails, saveEmail, type SavedEmail } from "@/lib/storage";
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
  const [logoData, setLogoData] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    if (!id) return;

    const emails = getEmails();
    const found = emails.find((item) => item.id === id) ?? null;

    if (found) {
      setEmail(found);
      setSubject(found.subject);
      setBody(found.body);
    }
  }, [id]);

  function makeId() {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      alert("Copied!");
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
      logoUrl: logoData,
    });
  }

  function handleSaveEmail() {
    if (!email) return;

    saveEmail({
      id: makeId(),
      playbookId: email.playbookId,
      templateId: email.templateId,
      templateLabel: email.templateLabel,
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
            <p className="muted">This email could not be duplicated.</p>
            <div className="toolbar" style={{ justifyContent: "center" }}>
              <button
                className="button buttonPrimary"
                onClick={() => router.push("/history")}
              >
                Back to Saved Emails
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="main">
      <section className="container">
        <div className="pageHeader">
          <div className="badge">Duplicate Email</div>
          <h1 className="pageTitle" style={{ marginTop: 14 }}>
            Duplicate and edit
          </h1>
          <p className="muted">
            Make a new version of this saved email without changing the original.
          </p>
        </div>

        <div className="editorLayout">
          <div className="formCard">
            <div className="formGroup">
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="formGroup">
              <label className="label">Body</label>
              <textarea
                className="input"
                rows={14}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Enter email body"
              />
            </div>

            <div className="formGroup">
              <label className="label">Company Name</label>
              <input
                className="input"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name for export"
              />
            </div>

            <div className="formGroup">
              <label className="label">Upload Logo</label>
              <input
                type="file"
                accept="image/*"
                className="input"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    setLogoData(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />

              {logoData ? (
                <img
                  src={logoData}
                  alt="Logo preview"
                  style={{ marginTop: 10, maxHeight: 50 }}
                />
              ) : null}
            </div>

            <div className="toolbar">
              <button className="button buttonPrimary" onClick={handleCopy}>
                Copy Email
              </button>

              <button
                className="button buttonSecondary"
                onClick={handleDownloadText}
              >
                Download TXT
              </button>

              <button
                className="button buttonSecondary"
                onClick={handleDownloadHtml}
              >
                Export HTML
              </button>

              <button
                className="button buttonSecondary"
                onClick={handleSaveEmail}
              >
                Save Email
              </button>
            </div>

            {savedMessage ? <p className="notice">{savedMessage}</p> : null}

            <div className="toolbar" style={{ marginTop: 12 }}>
              <button
                className="button buttonSecondary"
                onClick={() => router.push("/history")}
              >
                Back to Saved Emails
              </button>
            </div>
          </div>

          <div className="previewCard">
            <div className="previewLabel">Preview</div>

            <div className="previewBox">
              <strong>Subject: {subject}</strong>
              <br />
              <br />
              {body}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}