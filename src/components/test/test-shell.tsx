"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { textFor } from "@/components/admin/question-dialog";
import { localeOptions, Locale } from "@/i18n/dictionaries";
import { useLanguage } from "@/i18n/language-provider";
import { CheckCircle2, XCircle, LogOut, Flag, Car, Bookmark, X, ZoomIn } from "lucide-react";
import { exitFullscreen } from "@/lib/fullscreen";

export type ShellOption = { id: string; optionTextJson: any };
export type ShellQuestion = { id: string; textJson: any; imageUrl: string | null; options: ShellOption[] };
export type ShellAnswer = { selectedOptionId: string; isCorrect: boolean; correctOptionId: string };

const FKEYS = ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9"];

// Rasm biriktirilmagan savollar uchun standart rasm.
// Fayl yo'lini o'zgartirish uchun shu manzilga rasm yuklang: public/defaults/question-default.png
const DEFAULT_QUESTION_IMAGE = "/defaults/question-default.jpeg";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TestShell({
  questions,
  timeLimitSec,
  startedAt,
  answers,
  currentIndex,
  confirmMode,
  enforceFocus = false,
  onAnswer,
  onNavigate,
  onFinish,
  onExit,
}: {
  questions: ShellQuestion[];
  timeLimitSec: number;
  startedAt: number;
  answers: Record<string, ShellAnswer>;
  currentIndex: number;
  confirmMode: "dialog" | "direct";
  enforceFocus?: boolean;
  onAnswer: (questionId: string, optionId: string) => Promise<void> | void;
  onNavigate: (index: number) => void;
  onFinish: () => void;
  onExit: () => void;
}) {
  const { locale, setLocale } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"finish" | "exit" | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [displayOptions, setDisplayOptions] = useState<ShellOption[]>(() => shuffleArray(questions[currentIndex].options));
  const [focusWarning, setFocusWarning] = useState(false);
  const hiddenAtRef = useRef<number | null>(null);
  const violationCountRef = useRef(0);
  const activeRef = useRef<string | null>(null);
  const finishedRef = useRef(false);

  const q = questions[currentIndex];
  const answered = answers[q.id];
  const isSaved = savedIds.has(q.id);
  const displayImage = imageError ? null : (q.imageUrl || DEFAULT_QUESTION_IMAGE);

  useEffect(() => {
    const ids = questions.map((qq) => qq.id);
    fetch("/api/saved-questions/bulk-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionIds: ids }),
    })
      .then((res) => res.json())
      .then((data) => setSavedIds(new Set(data.savedIds ?? [])))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleBookmark() {
    if (savingBookmark) return;
    setSavingBookmark(true);
    try {
      const res = await fetch("/api/saved-questions/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.id }),
      });
      const data = await res.json();
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (data.saved) next.add(q.id);
        else next.delete(q.id);
        return next;
      });
    } finally {
      setSavingBookmark(false);
    }
  }

  useEffect(() => {
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      const left = Math.max(timeLimitSec - elapsed, 0);
      setTimeLeft(left);
      if (left <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        onFinish();
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [startedAt, timeLimitSec, onFinish]);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (!enforceFocus) return;

    function handleVisibility() {
      if (document.hidden) {
        hiddenAtRef.current = Date.now();
      } else if (hiddenAtRef.current) {
        hiddenAtRef.current = null;
        violationCountRef.current += 1;
        if (violationCountRef.current >= 2) {
          onFinish();
        } else {
          setFocusWarning(true);
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [enforceFocus, onFinish]);

  useEffect(() => {
    setPendingOptionId(null);
    activeRef.current = null;
    setZoomOpen(false);
    setImageError(false);
    setDisplayOptions(shuffleArray(questions[currentIndex].options));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const commitAnswer = useCallback(
    async (optionId: string) => {
      if (checking || answered) return;
      setChecking(true);
      activeRef.current = null;
      setPendingOptionId(null);
      try {
        await onAnswer(q.id, optionId);
      } finally {
        setChecking(false);
      }
    },
    [checking, answered, onAnswer, q.id]
  );

  function handleOptionClick(optionId: string) {
    if (answered || checking) return;
    if (confirmMode === "direct") {
      if (activeRef.current === optionId) {
        commitAnswer(optionId);
      } else {
        activeRef.current = optionId;
        setPendingOptionId(optionId);
      }
      return;
    }
    setPendingOptionId(optionId);
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && zoomOpen) {
        setZoomOpen(false);
        return;
      }
      if (answered || checking) return;
      const idx = FKEYS.indexOf(e.key);
      if (idx !== -1 && q.options[idx]) {
        e.preventDefault();
        handleOptionClick(q.options[idx].id);
      } else if (e.key === "Enter" && pendingOptionId) {
        e.preventDefault();
        commitAnswer(pendingOptionId);
      } else if (e.key === "Escape" && confirmMode === "dialog") {
        setPendingOptionId(null);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-[#0B1220] text-white">
      {/* TOP BAR */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4">
        <div className="flex gap-2">
          {localeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLocale(opt.value as Locale)}
              className={
                "rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                (locale === opt.value
                  ? "border-white bg-white text-[#0B1220]"
                  : "border-white/20 text-white/60 hover:border-white/40 hover:text-white")
              }
            >
              {opt.value === "uz-latin" ? "O'zbek tili" : opt.value === "uz-cyrl" ? "Ўзбек тили" : "Русский язык"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmAction("finish")}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/80 hover:border-white/40 hover:text-white"
          >
            <Flag className="h-3.5 w-3.5" />
            Testni yakunlash
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction("exit")}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3.5 py-1.5 text-xs font-medium text-white/80 hover:border-white/40 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Ortga
          </button>
        </div>
      </div>

      {/* QUESTION BANNER + BOOKMARK */}
      <div className="flex shrink-0 items-center gap-3 px-6">
        <div className="flex-1 rounded-xl bg-[#2b4fc9] px-5 py-3.5 text-center text-sm font-semibold sm:text-base">
          {textFor(q.textJson, locale)}
        </div>
        <button
          type="button"
          onClick={toggleBookmark}
          disabled={savingBookmark}
          className={
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 transition-colors " +
            (isSaved ? "border-amber-400 bg-amber-400/20 text-amber-300" : "border-white/20 text-white/50 hover:border-white/40 hover:text-white")
          }
          title="Saqlash"
        >
          <Bookmark className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} strokeWidth={1.75} />
        </button>
      </div>

      {/* CONTENT: variantlar + rasm (kattaroq) */}
      <div className="flex flex-col gap-4 px-6 py-6 lg:flex-row lg:gap-6">
        <div className="flex w-full flex-col gap-3 lg:max-w-md">
          {displayOptions.map((o, i) => {
            const isPending = pendingOptionId === o.id;
            const isSelected = answered?.selectedOptionId === o.id;
            const isCorrectOption = answered?.correctOptionId === o.id;

            let cls = "border-white/15 bg-white/5 hover:bg-white/10";
            if (isPending && !answered) cls = "border-white bg-white/15";
            if (answered) {
              if (isCorrectOption) cls = "border-green-400 bg-green-500/20";
              else if (isSelected) cls = "border-red-400 bg-red-500/20";
              else cls = "border-white/10 bg-white/5 opacity-50";
            }

            return (
              <button
                key={o.id}
                type="button"
                disabled={!!answered || checking}
                onClick={() => handleOptionClick(o.id)}
                className={`flex items-center gap-3 rounded-xl border-2 px-3 py-3 text-left text-sm transition-colors ${cls}`}
              >
                <span className="flex h-7 w-9 shrink-0 items-center justify-center rounded-md bg-[#1a2a5c] text-xs font-bold text-white/90">
                  {FKEYS[i] ?? i + 1}
                </span>
                <span className="flex-1">{textFor(o.optionTextJson, locale)}</span>
                {answered && isCorrectOption && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                {answered && isSelected && !isCorrectOption && <XCircle className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* RASM — har doim bir xil ramkali, markazlashgan katta quti */}
        <div className="relative mx-auto h-[300px] w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 sm:h-[420px] lg:h-[560px] lg:flex-1">
          <div className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-bold">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
          {displayImage ? (
            <button
              type="button"
              onClick={() => setZoomOpen(true)}
              className="group relative block h-full w-full"
            >
              <img
                src={displayImage}
                alt=""
                onError={() => setImageError(true)}
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100">
                <ZoomIn className="h-3.5 w-3.5" /> Kattalashtirish
              </span>
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Car className="h-24 w-24 text-white/40" strokeWidth={1.1} />
            </div>
          )}
        </div>
      </div>

      {/* SAVOLLAR PANELI — rasm ostida, markazda, oddiy oqimda */}
      <div className="flex justify-center px-6 pb-8 pt-2">
        <div className="flex max-w-4xl flex-wrap justify-center gap-1.5">
          {questions.map((qq, i) => {
            const ans = answers[qq.id];
            const isCurrent = i === currentIndex;
            let bg = "bg-[#1a2a5c] text-white/70 hover:bg-[#243a7a]";
            if (ans) bg = ans.isCorrect ? "bg-green-600/70 text-white" : "bg-red-600/70 text-white";

            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => onNavigate(i)}
                style={{ borderRadius: "6px" }}
                className={`flex h-7 w-7 shrink-0 items-center justify-center text-[11px] font-semibold transition-colors sm:h-8 sm:w-8 sm:text-xs ${bg} ${
                  isCurrent ? "outline outline-2 outline-offset-1 outline-white" : ""
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {zoomOpen && displayImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
          onClick={() => setZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={displayImage}
            alt=""
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}

      {confirmMode === "dialog" && pendingOptionId && !answered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#2b4fc9] p-6 text-center shadow-2xl">
            <p className="text-sm font-semibold text-white/80">Variantni tasdiqlash</p>
            <p className="mt-1 text-xs text-white/60">Tanlangan javob:</p>
            <button
              type="button"
              onClick={() => commitAnswer(pendingOptionId)}
              className="mt-3 w-full rounded-xl bg-white/10 px-4 py-3 text-sm font-medium transition-colors hover:bg-white/20"
            >
              {textFor(displayOptions.find((o) => o.id === pendingOptionId)?.optionTextJson, locale)}
            </button>
            <p className="mt-3 text-xs text-white/60">Tasdiqlash uchun yana bir marta bosing</p>
            <button
              type="button"
              onClick={() => setPendingOptionId(null)}
              className="mt-4 w-full rounded-xl border border-white/20 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#151d38] p-6 text-center shadow-2xl">
            <p className="text-base font-semibold">
              {confirmAction === "finish" ? "Testni yakunlashni tasdiqlaysizmi?" : "Testdan chiqishni tasdiqlaysizmi?"}
            </p>
            <p className="mt-2 text-sm text-white/60">
              {confirmAction === "finish"
                ? "Javob berilmagan savollar xato hisoblanadi."
                : "Test natijalari saqlanmaydi, qaytadan boshlashingiz kerak bo'ladi."}
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmAction;
                  setConfirmAction(null);
                  exitFullscreen();
                  if (action === "finish") onFinish();
                  else onExit();
                }}
                className="flex-1 rounded-xl bg-red-500/90 py-2.5 text-sm font-medium text-white hover:bg-red-500"
              >
                Ha, tasdiqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {focusWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-red-500/95 p-6 text-center shadow-2xl">
            <p className="text-base font-semibold text-white">Ogohlantirish!</p>
            <p className="mt-2 text-sm text-white/90">
              Siz sahifadan chiqib ketdingiz. Imtihon davomida boshqa tab yoki oynaga o'tish taqiqlanadi.
              Yana takrorlansa, test avtomatik yakunlanadi.
            </p>
            <button
              type="button"
              onClick={() => setFocusWarning(false)}
              className="mt-4 w-full rounded-xl bg-white/15 py-2.5 text-sm font-medium text-white hover:bg-white/25"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
