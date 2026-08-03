"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { ADMIN_SECTION_KEYS, AdminSectionKey } from "@/lib/admin-sections";
import { Plus, Pencil, Trash2, ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";

type AdminRow = {
  id: string;
  fullName: string;
  phone: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  allowedSections: string[] | null;
  workDays: number[] | null;
  workStartTime: string | null;
  workEndTime: string | null;
};

const DAY_KEYS: { value: number; labelKey: string }[] = [
  { value: 1, labelKey: "dayMon" },
  { value: 2, labelKey: "dayTue" },
  { value: 3, labelKey: "dayWed" },
  { value: 4, labelKey: "dayThu" },
  { value: 5, labelKey: "dayFri" },
  { value: 6, labelKey: "daySat" },
  { value: 0, labelKey: "daySun" },
];

const SECTION_LABEL_KEY: Record<AdminSectionKey, string> = {
  students: "admin.nav.students",
  questions: "admin.questions.title",
  talim: "admin.talim.title",
  bosqichli: "admin.bosqichli.title",
};

export function AdminsList() {
  const { t } = useLanguage();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => setAdmins(data.admins ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleToggleActive(admin: AdminRow) {
    if (!confirm(t("admin.admins.toggleActiveConfirm"))) return;
    setBusyId(admin.id);
    try {
      await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(admin: AdminRow) {
    if (!confirm(t("admin.admins.deleteConfirm"))) return;
    setBusyId(admin.id);
    try {
      await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  function formatSchedule(admin: AdminRow) {
    const daysText =
      admin.workDays && admin.workDays.length > 0
        ? DAY_KEYS.filter((d) => admin.workDays!.includes(d.value)).map((d) => t(`admin.admins.${d.labelKey}`)).join(", ")
        : t("admin.admins.allDays");
    const hoursText =
      admin.workStartTime && admin.workEndTime ? `${admin.workStartTime}–${admin.workEndTime}` : t("admin.admins.allHours");
    return `${daysText} · ${hoursText}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => { setEditingAdmin(null); setDialogOpen(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {t("admin.admins.addButton")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3">{t("admin.admins.colName")}</th>
              <th className="px-5 py-3">{t("admin.admins.colPhone")}</th>
              <th className="px-5 py-3">{t("admin.admins.colSections")}</th>
              <th className="px-5 py-3">{t("admin.admins.colSchedule")}</th>
              <th className="px-5 py-3">{t("admin.admins.colStatus")}</th>
              <th className="px-5 py-3">{t("admin.admins.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">{t("common.loading")}</td></tr>
            ) : admins.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">{t("admin.admins.empty")}</td></tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-1.5">
                      {admin.fullName}
                      {admin.role === "SUPER_ADMIN" && (
                        <span className="flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          <ShieldCheck className="h-3 w-3" /> {t("admin.admins.superAdminBadge")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{admin.phone}</td>
                  <td className="px-5 py-3">
                    {admin.role === "SUPER_ADMIN" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(admin.allowedSections ?? []).length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          (admin.allowedSections ?? []).map((s) => (
                            <span key={s} className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] text-foreground">
                              {t(SECTION_LABEL_KEY[s as AdminSectionKey] ?? s)}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {admin.role === "SUPER_ADMIN" ? "—" : formatSchedule(admin)}
                  </td>
                  <td className="px-5 py-3">
                    {admin.role === "SUPER_ADMIN" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === admin.id}
                        onClick={() => handleToggleActive(admin)}
                        className={
                          "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:opacity-40 " +
                          (admin.isActive
                            ? "bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/20")
                        }
                      >
                        {admin.isActive ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {admin.isActive ? t("admin.admins.statusActive") : t("admin.admins.statusBlocked")}
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {admin.role !== "SUPER_ADMIN" && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => { setEditingAdmin(admin); setDialogOpen(true); }}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={busyId === admin.id}
                          onClick={() => handleDelete(admin)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {dialogOpen && (
        <AdminDialog
          admin={editingAdmin}
          onClose={() => setDialogOpen(false)}
          onSaved={() => { setDialogOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function AdminDialog({
  admin,
  onClose,
  onSaved,
}: {
  admin: AdminRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const isEdit = !!admin;

  const [fullName, setFullName] = useState(admin?.fullName ?? "");
  const [phone, setPhone] = useState(admin?.phone ?? "");
  const [password, setPassword] = useState("");
  const [sections, setSections] = useState<Set<string>>(new Set(admin?.allowedSections ?? []));
  const [days, setDays] = useState<Set<number>>(new Set(admin?.workDays ?? []));
  const [startTime, setStartTime] = useState(admin?.workStartTime ?? "");
  const [endTime, setEndTime] = useState(admin?.workEndTime ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function toggleSection(key: string) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleDay(value: number) {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      fullName,
      phone,
      password: password || undefined,
      allowedSections: [...sections],
      workDays: [...days],
      workStartTime: startTime || null,
      workEndTime: endTime || null,
    };

    try {
      const url = isEdit ? `/api/admin/admins/${admin!.id}` : "/api/admin/admins";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setError(t("admin.admins.createError"));
        return;
      }
      if (!res.ok) throw new Error();

      onSaved();
    } catch {
      setError(t("admin.settings.saveError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-base font-semibold text-foreground">
          {isEdit ? t("admin.admins.dialogEditTitle") : t("admin.admins.dialogAddTitle")}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.admins.nameLabel")}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.admins.phoneLabel")}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+998901234567"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {isEdit ? t("admin.admins.passwordOptionalLabel") : t("admin.admins.passwordLabel")}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("admin.admins.sectionsLabel")}</label>
            <div className="flex flex-wrap gap-2">
              {ADMIN_SECTION_KEYS.map((key) => {
                const isChecked = sections.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSection(key)}
                    className={
                      "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors " +
                      (isChecked ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {t(SECTION_LABEL_KEY[key])}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("admin.admins.workDaysLabel")}</label>
            <div className="flex flex-wrap gap-2">
              {DAY_KEYS.map((d) => {
                const isChecked = days.has(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleDay(d.value)}
                    className={
                      "h-9 w-12 rounded-lg border text-xs font-medium transition-colors " +
                      (isChecked ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-secondary")
                    }
                  >
                    {t(`admin.admins.${d.labelKey}`)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">{t("admin.admins.workHoursLabel")}</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
              />
              <span className="text-muted-foreground">—</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : isEdit ? (
                t("admin.admins.dialogSubmit")
              ) : (
                t("admin.admins.dialogSubmit")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
