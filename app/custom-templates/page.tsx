"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCustomTemplates, type CustomTemplate } from "@/lib/storage";
import { playbooks } from "@/lib/data";

type GroupedTemplates = {
  sourcePlaybookId: string;
  sourcePlaybookName: string;
  items: (CustomTemplate & {
    sourceTemplateLabel: string;
  })[];
};

function getBodyPreview(body: string, maxLength = 140) {
  const clean = body.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
}

export default function ReusableSequencesPage() {
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setTemplates(getCustomTemplates());
  }, []);

  const groupedTemplates = useMemo<GroupedTemplates[]>(() => {
    const groups = new Map<
      string,
      (CustomTemplate & { sourceTemplateLabel: string })[]
    >();

    for (const template of templates) {
      const sourcePlaybook = playbooks.find(
        (p) => p.id === template.sourcePlaybookId
      );

      const sourceTemplate = sourcePlaybook?.templates.find(
        (t) => t.id === template.sourceTemplateId
      );

      const sourceTemplateLabel = sourceTemplate?.label || "Saved Step";
      const groupKey = template.sourcePlaybookId || "saved-sequences";

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }

      groups.get(groupKey)?.push({
        ...template,
        sourceTemplateLabel,
      });
    }

    return Array.from(groups.entries()).map(([sourcePlaybookId, items]) => {
      const playbook = playbooks.find((p) => p.id === sourcePlaybookId);

      return {
        sourcePlaybookId,
        sourcePlaybookName: playbook?.name || "Reusable Sequence",
        items,
      };
    });
  }, [templates]);

  useEffect(() => {
    if (groupedTemplates.length === 0) return;

    setOpenGroups((prev) => {
      const next = { ...prev };

      for (const group of groupedTemplates) {
        if (!(group.sourcePlaybookId in next)) {
          next[group.sourcePlaybookId] = true;
        }
      }

      return next;
    });
  }, [groupedTemplates]);

  function toggleGroup(groupId: string) {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }

  return (
    <main className="main">
      <section className="container">
        <div className="pageHeader">
          <div className="badge">Reusable Sequences</div>
          <h1 className="pageTitle" style={{ marginTop: 14 }}>
            Your Sequence Library
          </h1>
          <p className="muted">
            Save your best sequence steps and build a reusable outbound library
            over time.
          </p>
        </div>

        {templates.length === 0 ? (
          <div className="glassCard emptyState">
            <h3 className="cardTitle">No reusable sequences yet</h3>

            <p className="muted" style={{ maxWidth: 620, marginInline: "auto" }}>
              Create your first email, save the version you want to keep, and
              it will appear here as a reusable sequence asset.
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
                  Start from any playbook step in the System Library.
                </p>
              </div>

              <div className="glassCard" style={{ padding: 14 }}>
                <strong>2. Save version</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Save the version you want to reuse later.
                </p>
              </div>

              <div className="glassCard" style={{ padding: 14 }}>
                <strong>3. Reuse</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  Come back anytime and open it as part of your sequence library.
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
          <div style={{ display: "grid", gap: 24 }}>
            {groupedTemplates.map((group) => {
              const isOpen = openGroups[group.sourcePlaybookId] ?? true;

              return (
                <section
                  key={group.sourcePlaybookId}
                  className="glassCard"
                  style={{ padding: 20 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div className="badge">{group.sourcePlaybookName}</div>
                      <p
                        className="muted"
                        style={{ marginTop: 10, marginBottom: 0 }}
                      >
                        {group.items.length} saved{" "}
                        {group.items.length === 1 ? "sequence" : "sequences"}
                      </p>
                    </div>

                    <button
                      className="button buttonSecondary"
                      onClick={() => toggleGroup(group.sourcePlaybookId)}
                    >
                      {isOpen ? "Hide Sequences" : "Show Sequences"}
                    </button>
                  </div>

                  {isOpen ? (
                    <div
                      style={{
                        display: "grid",
                        gap: 16,
                        marginTop: 18,
                      }}
                    >
                      {group.items.map((template) => (
                        <Link
                          key={template.id}
                          href={`/custom-templates/${template.id}`}
                          className="listCard glassCard clickable"
                          style={{
                            display: "block",
                            padding: 20,
                            textDecoration: "none",
                          }}
                        >
                          <div className="cardTop">
                            <h3 className="cardTitle">{template.title}</h3>
                            <span className="miniBadge">Reusable Sequence</span>
                          </div>

                          <p className="templateMeta">
                            Subject: {template.subject}
                          </p>

                          <p className="small">
                            From: {group.sourcePlaybookName} →{" "}
                            {template.sourceTemplateLabel}
                          </p>

                          <p
                            className="muted"
                            style={{ marginTop: 10, lineHeight: 1.6 }}
                          >
                            {getBodyPreview(template.body)}
                          </p>

                          <p className="small" style={{ marginTop: 10 }}>
                            Saved on {new Date(template.createdAt).toLocaleString()}
                          </p>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}