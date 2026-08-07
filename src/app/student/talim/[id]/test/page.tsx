"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";
import { Trophy, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { TestShell, ShellQuestion, ShellAnswer } from "@/components/test/test-shell";

type Session = {
  questions: ShellQuestion[];
  timeLimitSec: number;
  startedAt: number;
  answers: Record<string, ShellAnswer>;
  currentIndex: number;
  bannerText?: string;
};

export default function TalimTestPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const stageId = params.id as string;
  const storageKey = `talim_session_${stageId}`;
  const previewKey = `talim_preview_${stageId}`;

  const [session, setSession] = useState<Session | null>(null);
  const [finished, setFinished] = useState<{ score: number; total: number } | null>(null);
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // 1) Davom etayotgan sessiya bormi — tekshiramiz
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed: Session = JSON.parse(raw);
        const elapsed = Math.floor((Date.now() - parsed.startedAt) / 1000);
        if (elapsed < parsed.timeLimitSec && parsed.questions?.length > 0) {
          setSession(parsed);
          setRestored(true);
          return;
        }
        localStorage.removeItem(storageKey);
      } catch {
        localStorage.removeItem(storageKey);
      }
    }

    // 2) "Testni ko'rish" oynasidan kelgan aynan o'sha savollar to'plamini ishlatamiz
    const previewRaw = sessionStorage.getItem(previewKey);
    if (previewRaw) {
      try {
        const preview = JSON.parse(previewRaw);
        if (preview.questions?.length > 0) {
          persist({
            questions: preview.questions,
            timeLimitSec: preview.timeLimitSec,
            startedAt: Date.now(),
            answers: {},
            currentIndex: 0,
            bannerText: preview.bannerText,
          });
          setRestored(true);
          return;
        }
      } catch {
        // davom etamiz, zaxira variantga o'tamiz
      }
    }

    // 3) Zaxira: to'g'ridan-to'g'ri kirilgan bo'lsa, yangi tasodifiy to'plam so'raymiz
    startTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persist(next: Session) {
    setSession(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }

  async function startTest() {
    setError(false);
    setRestored(false);
    try {
      const res = await fetch(`/api/talim/${stageId}/start`, { method: "POST" });
      if (!res.ok) throw new Error("start failed");
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) throw new Error("no questions");
      persist({ questions: data.questions, timeLimitSec: data.timeLimitSec, startedAt: Date.now(), answers: {}, currentIndex: 0 });
    } catch {
      setError(true);
    } finally {
      setRestored(true);
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
      body: JSON.stringify({ stageId, answers, timeSpentSec }),
    });
    const data = await res.json();

    localStorage.removeItem(storageKey);
    sessionStorage.removeItem(previewKey);
    setSession(null);
    setFinished({ score: data.result.score, total: data.result.total });
  }

  if (!restored) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.75} />
        </div>
        <p className="text-sm text-muted-foreground">Testni yuklashda xatolik yuz berdi.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/student/talim/${stageId}`} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
            {t("studentTalim.backToStage")}
          </Link>
          <button type="button" onClick={startTest} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

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
          <button type="button" onClick={startTest} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90">
            {t("test.retakeButton")}
          </button>
        </div>
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
      topBanner={session.bannerText}
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
