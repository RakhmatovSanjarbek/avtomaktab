"use client";

import { useState } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { Loader2 } from "lucide-react";

export function SettingsForm({ currentName, currentEmail }: { currentName: string; currentEmail: string }) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      if (res.status === 409) {
        setToast({ type: "error", text: t("admin.settings.emailTakenError") });
        return;
      }
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: t("admin.settings.saveSuccess") });
      setPassword("");
    } catch {
      setToast({ type: "error", text: t("admin.settings.saveError") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-foreground">{t("admin.settings.profileTitle")}</h2>
      <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.settings.nameLabel")}</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.settings.emailLabel")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@misol.uz"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.settings.passwordLabel")}</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        {toast && (
          <p className={"text-sm " + (toast.type === "success" ? "text-primary" : "text-destructive")}>{toast.text}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="inline h-4 w-4 animate-spin" /> : t("admin.settings.saveButton")}
        </button>
      </form>
    </div>
  );
}
