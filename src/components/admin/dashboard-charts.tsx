"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";

export function DashboardCharts({
  weeklyData,
  distributionData,
  topVariants,
  weeklyTitle,
  scoreTitle,
  variantsTitle,
  noDataText,
}: {
  weeklyData: { day: string; count: number }[];
  distributionData: { name: string; value: number; color: string }[];
  topVariants: { title: string; count: number }[];
  weeklyTitle: string;
  scoreTitle: string;
  variantsTitle: string;
  noDataText: string;
}) {
  const hasScoreData = distributionData.some((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Haftalik faollik */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{weeklyTitle}</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Natijalar taqsimoti */}
      <div id="score-chart" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{scoreTitle}</h2>
        {hasScoreData ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {distributionData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4 text-xs">
              {distributionData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-muted-foreground">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="flex h-56 items-center justify-center text-sm text-muted-foreground">{noDataText}</p>
        )}
      </div>

      {/* Eng faol variantlar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
        <h2 className="mb-4 text-sm font-semibold text-foreground">{variantsTitle}</h2>
        {topVariants.length === 0 ? (
          <p className="flex h-32 items-center justify-center text-sm text-muted-foreground">{noDataText}</p>
        ) : (
          <div className="space-y-2.5">
            {topVariants.map((v, idx) => {
              const max = topVariants[0]?.count || 1;
              const widthPct = Math.max((v.count / max) * 100, 6);
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-foreground sm:w-48">{v.title}</span>
                  <div className="h-6 flex-1 overflow-hidden rounded-lg bg-secondary/50">
                    <div className="h-full rounded-lg bg-primary/80" style={{ width: `${widthPct}%` }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-medium text-muted-foreground">{v.count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
