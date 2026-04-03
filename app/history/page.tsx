"use client";

import { useEffect, useState } from "react";
import { getEmails, type SavedEmail } from "@/lib/storage";
import Link from "next/link";

function getBodyPreview(body: string, maxLength = 180) {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
}

export default function SavedEmailsPage() {
  const [emails, setEmails] = useState<SavedEmail[]>([]);

  useEffect(() => {
    setEmails(getEmails());
  }, []);

  return (
    <main className="main">
      <section className="container">
        <div className="pageHeader">
          <div className="badge">Saved Emails</div>

          <h1 className="pageTitle" style={{ marginTop: 14 }}>
            Your Saved Emails
          </h1>

          <p className="muted">
            Open any saved email to view it, copy it, or use it again.
          </p>
        </div>

        {emails.length === 0 ? (
          <div className="glassCard emptyState">
            <h3 className="cardTitle">No saved emails yet</h3>

            <p className="muted" style={{ maxWidth: 620, marginInline: "auto" }}>
              Create your first email, save it, and come back to reuse it
              anytime from your Saved Emails library.
            </p>

            <div
              style={{
                display: "grid",
                gap: 10,
                maxWidth: 420,
                margin: "20px auto 0",
                textAlign: "left",
              }}
            >
              <div className="glassCard" style={{ padding: 14 }}>
                <strong>1. Create</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Start from any playbook in the System Library.
                </p>
              </div>

              <div className="glassCard" style={{ padding: 14 }}>
                <strong>2. Save</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Save the email you want to keep for later.
                </p>
              </div>

              <div className="glassCard" style={{ padding: 14 }}>
                <strong>3. Reuse</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Open it again anytime to copy it or use it again.
                </p>
              </div>
            </div>

            <div className="toolbar" style={{ justifyContent: "center", marginTop: 20 }}>
              <Link href="/" className="button buttonPrimary">
                Browse System Library
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {emails.map((email) => (
              <Link
                key={email.id}
                href={`/history/${email.id}`}
                className="glassCard clickable"
                style={{
                  padding: 20,
                  display: "block",
                  textDecoration: "none",
                }}
              >
                <div className="cardTop">
                  <h3 className="cardTitle">{email.templateLabel}</h3>
                  <span className="miniBadge">Saved Email</span>
                </div>

                <p className="templateMeta">Subject: {email.subject}</p>

                <p
                  className="muted"
                  style={{ marginTop: 10, lineHeight: 1.6 }}
                >
                  {getBodyPreview(email.body)}
                </p>

                <p className="small" style={{ marginTop: 10 }}>
                  Saved on {new Date(email.createdAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}