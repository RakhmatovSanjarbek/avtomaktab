"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { Loader2, Phone, Send, Camera, MessageCircle } from "lucide-react";

export function ContactSettingsForm() {
  const { t } = useLanguage();
  const [adminPhone, setAdminPhone] = useState("");
  const [adminTelegram, setAdminTelegram] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [telegramChannel, setTelegramChannel] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings;
        if (s) {
          setAdminPhone(s.adminPhone ?? "");
          setAdminTelegram(s.adminTelegram ?? "");
          setInstagramUrl(s.instagramUrl ?? "");
          setTelegramChannel(s.telegramChannel ?? "");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPhone, adminTelegram, instagramUrl, telegramChannel }),
      });
      setToast(t("admin.settings.saveSuccess"));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold text-foreground">{t("admin.settings.contactTitle")}</h2>
      <p className="mb-4 text-xs text-muted-foreground">{t("admin.settings.contactDesc")}</p>

      <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Phone className="h-3.5 w-3.5" /> {t("admin.settings.adminPhoneLabel")}
          </label>
          <input
            value={adminPhone}
            onChange={(e) => setAdminPhone(e.target.value)}
            placeholder="+998901234567"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Send className="h-3.5 w-3.5" /> {t("admin.settings.adminTelegramLabel")}
          </label>
          <input
            value={adminTelegram}
            onChange={(e) => setAdminTelegram(e.target.value)}
            placeholder="https://t.me/username"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Camera className="h-3.5 w-3.5" /> {t("admin.settings.instagramLabel")}
          </label>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/username"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MessageCircle className="h-3.5 w-3.5" /> {t("admin.settings.telegramChannelLabel")}
          </label>
          <input
            value={telegramChannel}
            onChange={(e) => setTelegramChannel(e.target.value)}
            placeholder="https://t.me/kanalnomi"
            className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>

        {toast && <p className="text-sm text-primary">{toast}</p>}

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
