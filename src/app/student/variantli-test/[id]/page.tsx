"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";
import { Trophy, Loader2, Play, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TestShell, ShellQuestion, ShellAnswer } from "@/components/test/test-shell";
import { enterFullscreen } from "@/lib/fullscreen";

type Session = {
  questions: ShellQuestion[];
  timeLimitSec: number;
  startedAt: number;
  answers: Record<string, ShellAnswer>;
  currentIndex: number;
};

export default function VariantTestPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const variantId = params.id as string;
  const storageKey = `variantli_session_${variantId}`;

  const [session, setSession] = useState<Session | null>(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [finished, setFinished] = useState<{ score: number; total: number } | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: Session = JSON.parse(raw);
        const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
        if (elapsed < parsed.timeLimitSec) setSession(parsed);
        else localStorage.removeItem(storageKey);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setRestored(true);
  }, [storageKey]);

  function persist(next: Session) {
    setSession(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  async function startTest() {
    enterFullscreen();
    setLoadingStart(true);
    try {
      const res = await fetch(`/api/variantli/${variantId}/start`, { method: "POST" });
      const data = await res.json();
      persist({ questions: data.questions, timeLimitSec: data.timeLimitSec, startedAt: Date.now(), answers: {}, currentIndex: 0 });
    } finally {
      setLoadingStart(false);
    }
  }

  async function handleAnswer(questionId: string, optionId: string) {
    if (!session) return;
    const res = await fetch("/api/questions/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, selectedOptionId: optionId }),
    });
    const data = await res.json();
    const record: ShellAnswer = { selectedOptionId: optionId, isCorrect: data.isCorrect, correctOptionId: data.correctOptionId };
    const nextAnswers = { ...session.answers, [questionId]: record };
    const nextSession = { ...session, answers: nextAnswers };
    persist(nextSession);

    setTimeout(() => {
      const total = session.questions.length;
      let nextIndex = -1;
      for (let step = 1; step <= total; step++) {
        const idx = (session.currentIndex + step) % total;
        if (!nextAnswers[session.questions[idx].id]) {
          nextIndex = idx;
          break;
        }
      }
      if (nextIndex === -1) finishTest(nextSession);
      else persist({ ...nextSession, currentIndex: nextIndex });
    }, 2000);
  }

  async function finishTest(finalSession: Session) {
    const answers = finalSession.questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: finalSession.answers[q.id]?.selectedOptionId ?? null,
    }));
    const timeSpentSec = Math.floor((Date.now() - finalSession.startedAt) / 1000);

    const res = await fetch("/api/test/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stageId: variantId, answers, timeSpentSec }),
    });
    const data = await res.json();

    localStorage.removeItem(storageKey);
    setSession(null);
    setFinished({ score: data.result.score, total: data.result.total });
  }

  if (!restored) return null;

  if (finished) {
    const percent = Math.round((finished.score / finished.total) * 100);
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Trophy className="h-8 w-8 text-primary" strokeWidth={1.75} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">{t("test.resultTitle")}</h1>
        <p className="mt-2 text-4xl font-bold text-foreground">{finished.score} / {finished.total}</p>
        <p className="mt-1 text-sm text-muted-foreground">{percent}%</p>
        <div className="mt-8 flex justify-center gap-3">
          <button type="button" onClick={() => router.back()} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
            {t("test.backToDashboard")}
          </button>
          <button type="button" onClick={() => setFinished(null)} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            {t("test.retakeButton")}
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Ortga
      </button>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Play className="h-8 w-8 text-primary" strokeWidth={1.75} />
        </div>
        <button
          type="button"
          disabled={loadingStart}
          onClick={startTest}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loadingStart && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("studentVariantli.startTestButton")}
        </button>
      </div>
    );
  }

  return (
    <TestShell
      questions={session.questions}
      timeLimitSec={session.timeLimitSec}
      startedAt={session.startedAt}
      answers={session.answers}
      currentIndex={session.currentIndex}
      confirmMode="direct"
      onAnswer={handleAnswer}
      onNavigate={(i) => persist({ ...session, currentIndex: i })}
      onFinish={() => finishTest(session)}
      onExit={() => {
        localStorage.removeItem(storageKey);
        router.back();
      }}
    />
  );
}
