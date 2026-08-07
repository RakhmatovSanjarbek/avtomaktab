"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/lib/text-for";
import { Loader2 } from "lucide-react";
import { enterFullscreen } from "@/lib/fullscreen";
import { TestShell, ShellQuestion } from "@/components/test/test-shell";

export function TalimPreviewView({ stageId }: { stageId: string }) {
  const { locale } = useLanguage();
  const router = useRouter();

  const [bannerText, setBannerText] = useState("");
  const [questions, setQuestions] = useState<ShellQuestion[]>([]);
  const [timeLimitSec, setTimeLimitSec] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    enterFullscreen();
    Promise.all([
      fetch(`/api/talim/${stageId}/info`).then((r) => r.json()),
      fetch(`/api/talim/${stageId}/start`, { method: "POST" }).then((r) => r.json()),
    ])
      .then(([infoData, startData]) => {
        const banner = textFor(infoData.stage?.descJson, locale) || textFor(infoData.stage?.titleJson, locale);
        setBannerText(banner);
        setQuestions(startData.questions ?? []);
        setTimeLimitSec(startData.timeLimitSec ?? 0);
        sessionStorage.setItem(
          `talim_preview_${stageId}`,
          JSON.stringify({ questions: startData.questions, timeLimitSec: startData.timeLimitSec, bannerText: banner })
        );
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId]);

  function handleStartTest() {
    enterFullscreen();
    router.push(`/student/talim/${stageId}/test`);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0B1220]">
        <Loader2 className="h-6 w-6 animate-spin text-white/60" />
      </div>
    );
  }

  return (
    <TestShell
      questions={questions}
      timeLimitSec={timeLimitSec}
      startedAt={Date.now()}
      answers={{}}
      currentIndex={currentIndex}
      confirmMode="direct"
      topBanner={bannerText}
      readOnly
      onAnswer={() => {}}
      onNavigate={setCurrentIndex}
      onFinish={() => {}}
      onExit={() => router.back()}
      onStartTest={handleStartTest}
    />
  );
}
