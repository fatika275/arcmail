"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCustomTemplates,
  saveCustomTemplate,
  saveEmail,
  type CustomTemplate,
} from "@/lib/storage";
import { downloadHtmlFile } from "@/lib/exportHtml";
import { playbooks } from "@/lib/data";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `sequence-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function SequenceAssetPage() {
  const params = useParams();
  const router = useRouter();

  const id = useMemo(() => {
    const value = params?.id;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  const template = useMemo<CustomTemplate | null>(() => {
    if (!id) return null;
    return getCustomTemplates().find((item) => item.id === id) ?? null;
  }, [id]);
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [subjectDraft, setSubjectDraft] = useState<string | null>(null);
  const [bodyDraft, setBodyDraft] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [logoData, setLogoData] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const title = titleDraft ?? template?.title ?? "";
  const subject = subjectDraft ?? template?.subject ?? "";
  const body = bodyDraft ?? template?.body ?? "";

  const sourceInfo = useMemo(() => {
    if (!template) {
      return {
        playbookName: "",
        templateLabel: "",
      };
    }

    const sourcePlaybook = playbooks.find(
      (p) => p.id === template.sourcePlaybookId
    );

    const sourceTemplate = sourcePlaybook?.templates.find(
      (t) => t.id === template.sourceTemplateId
    );

    return {
      playbookName: sourcePlaybook?.name || "Reusable Sequence",
      templateLabel: sourceTemplate?.label || "Saved Step",
    };
  }, [template]);

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
    anchor.download = "sequence-asset.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function handleDownloadHtml() {
    downloadHtmlFile(subject, body, "sequence-asset", {
      companyName,
      logoUrl: logoData,
    });
  }

  function handleSaveVersion() {
    if (!template) return;

    saveCustomTemplate({
      id: makeId(),
      title,
      subject,
      body,
      sourcePlaybookId: template.sourcePlaybookId,
      sourceTemplateId: template.sourceTemplateId,
      createdAt: new Date().toISOString(),
    });

    setSavedMessage("Saved as new version");
    setTimeout(() => setSavedMessage(""), 2000);
  }

  function handleSaveAsEmail() {
    if (!template) return;

    saveEmail({
      id: makeId(),
      playbookId: template.sourcePlaybookId,
      templateId: template.sourceTemplateId,
      templateLabel: title,
      subject,
      body,
      createdAt: new Date().toISOString(),
    });

    setSavedMessage("Saved to Saved Emails");
    setTimeout(() => setSavedMessage(""), 2000);
  }

  if (!template) {
    return (
      <main className="main">
        <section className="container">
          <div className="glassCard emptyState">
            <h1 className="pageTitle">Reusable sequence not found</h1>
            <p className="muted">
              This reusable sequence could not be loaded.
            </p>
            <div className="toolbar" style={{ justifyContent: "center" }}>
              <button
                className="button buttonPrimary"
                onClick={() => router.push("/custom-templates")}
              >
                Back to Reusable Sequences
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
          <div className="badge">Reusable Sequence</div>

          <h1 className="pageTitle" style={{ marginTop: 14 }}>
            {title}
          </h1>

          <p className="muted">
            From: {sourceInfo.playbookName} → {sourceInfo.templateLabel}
          </p>
        </div>

        <div className="editorLayout">
          <div className="formCard">
            <div className="glassCard" style={{ padding: 18, marginBottom: 18 }}>
              <h4 style={{ margin: 0 }}>Sequence Details</h4>
              <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
                <div>
                  <p
                    className="muted"
                    style={{
                      margin: 0,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Asset Name
                  </p>
                  <p style={{ margin: "6px 0 0", fontWeight: 700 }}>{title}</p>
                </div>

                <div>
                  <p
                    className="muted"
                    style={{
                      margin: 0,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Subject
                  </p>
                  <p style={{ margin: "6px 0 0" }}>{subject}</p>
                </div>

                <div>
                  <p
                    className="muted"
                    style={{
                      margin: 0,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Source
                  </p>
                  <p style={{ margin: "6px 0 0" }}>
                    {sourceInfo.playbookName} → {sourceInfo.templateLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Asset Name</label>
              <input
                className="input"
                value={title}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="Enter asset name"
              />
            </div>

            <div className="formGroup">
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubjectDraft(e.target.value)}
                placeholder="Enter subject"
              />
            </div>

            <div className="formGroup">
              <label className="label">Body</label>
              <textarea
                className="input"
                rows={14}
                value={body}
                onChange={(e) => setBodyDraft(e.target.value)}
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
                Copy Sequence
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
                onClick={handleSaveVersion}
              >
                Save New Version
              </button>

              <button
                className="button buttonSecondary"
                onClick={handleSaveAsEmail}
              >
                Save as Email
              </button>
            </div>

            {savedMessage ? <p className="notice">{savedMessage}</p> : null}

            <div className="toolbar">
              <button
                className="button buttonSecondary"
                onClick={() => router.push("/custom-templates")}
              >
                Back to Reusable Sequences
              </button>
            </div>
          </div>

          <div className="previewCard">
            <div className="previewLabel">Sequence Preview</div>

            <div className="previewBox">
              <strong>Subject: {subject}</strong>
              <br />
              <br />
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                {body}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
