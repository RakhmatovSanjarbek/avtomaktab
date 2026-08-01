"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { Plus, RotateCcw, Smartphone, Search, X, Pencil, Trash2, BarChart3 } from "lucide-react";

type Student = {
  id: string;
  fullName: string;
  phone: string;
  groupName: string | null;
  deviceId: string | null;
  isDeviceLocked: boolean;
};

export function StudentsTable() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(data.students ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleReset(id: string) {
    if (!window.confirm(t("admin.students.resetConfirm"))) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/students/${id}/reset-device`, { method: "POST" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: t("admin.students.resetSuccess") });
      loadStudents();
    } catch {
      setToast({ type: "error", text: t("admin.students.resetError") });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("admin.students.deleteConfirm"))) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setToast({ type: "success", text: t("admin.students.deleteSuccess") });
      loadStudents();
    } catch {
      setToast({ type: "error", text: t("admin.students.deleteError") });
    } finally {
      setBusyId(null);
    }
  }

  const filtered = students.filter(
    (s) => s.fullName.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search)
  );

  return (
    <div className="space-y-4">
      {toast && (
        <div className={"rounded-xl px-4 py-2.5 text-sm " + (toast.type === "success" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}>
          {toast.text}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.students.searchPlaceholder")}
            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
          />
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          {t("admin.students.addButton")}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">{t("admin.students.colName")}</th>
              <th className="px-4 py-3">{t("admin.students.colPhone")}</th>
              <th className="px-4 py-3">{t("admin.students.colGroup")}</th>
              <th className="px-4 py-3">{t("admin.students.colDevice")}</th>
              <th className="px-4 py-3 text-right">{t("admin.students.colActions")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("common.loading")}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">{t("admin.students.empty")}</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.groupName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={"inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium " + (s.isDeviceLocked ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground")}>
                      <Smartphone className="h-3 w-3" strokeWidth={1.75} />
                      {s.isDeviceLocked ? t("admin.students.deviceLinked") : t("admin.students.deviceNotLinked")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/talabalar/${s.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <BarChart3 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        Statistika
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditTarget(s)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t("admin.students.editButton")}
                      </button>
                      <button
                        type="button"
                        disabled={!s.isDeviceLocked || busyId === s.id}
                        onClick={() => handleReset(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t("admin.students.resetDevice")}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === s.id}
                        onClick={() => handleDelete(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-40"
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                        {t("admin.students.deleteButton")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {addOpen && (
        <StudentDialog
          mode="create"
          onClose={() => setAddOpen(false)}
          onDone={(msg) => { setAddOpen(false); loadStudents(); setToast({ type: "success", text: msg }); }}
        />
      )}
      {editTarget && (
        <StudentDialog
          mode="edit"
          student={editTarget}
          onClose={() => setEditTarget(null)}
          onDone={(msg) => { setEditTarget(null); loadStudents(); setToast({ type: "success", text: msg }); }}
        />
      )}
    </div>
  );
}

function StudentDialog({
  mode,
  student,
  onClose,
  onDone,
}: {
  mode: "create" | "edit";
  student?: Student;
  onClose: () => void;
  onDone: (successMsg: string) => void;
}) {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(student?.fullName ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [groupName, setGroupName] = useState(student?.groupName ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const url = mode === "create" ? "/api/admin/students" : `/api/admin/students/${student!.id}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone, groupName, password }),
      });

      if (!res.ok) {
        setError(mode === "create" ? t("admin.students.createError") : t("admin.students.editError"));
        setSubmitting(false);
        return;
      }

      onDone(mode === "create" ? t("admin.students.createSuccess") : t("admin.students.editSuccess"));
    } catch {
      setError(mode === "create" ? t("admin.students.createError") : t("admin.students.editError"));
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {mode === "create" ? t("admin.students.dialogTitle") : t("admin.students.editDialogTitle")}
          </h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.students.dialogNameLabel")}</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.students.dialogPhoneLabel")}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.students.dialogGroupLabel")}</label>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {mode === "create" ? t("admin.students.dialogPasswordLabel") : t("admin.students.dialogPasswordOptionalLabel")}
            </label>
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} required={mode === "create"}
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
              {submitting ? t("admin.students.dialogSubmitting") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
