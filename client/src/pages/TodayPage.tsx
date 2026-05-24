import { useState } from "react";
import { EvidenceNote } from "../components/EvidenceNote";
import { SectionCard } from "../components/SectionCard";
import { getLevelData } from "../data/mockData";
import type { CheckInItem, UserLevel } from "../types/appTypes";

function getMaxValue(label: string) {
  if (label === "Session Duration" || label === "Bodyweight") {
    return "100";
  }

  if (label === "Session RPE" || label === "Hard Sets") {
    return "10";
  }

  return "5";
}

type TodayPageProps = {
  selectedLevel: UserLevel;
};

export function TodayPage({ selectedLevel }: TodayPageProps) {
  const data = getLevelData(selectedLevel);
  const [quickValues, setQuickValues] = useState<CheckInItem[]>(data.quickLogItems);
  const sessionRpe = quickValues.find((item) => item.label === "Session RPE")?.value ?? 0;
  const sessionDuration = quickValues.find((item) => item.label === "Session Duration")?.value ?? 0;
  const fatigue = quickValues.find((item) => item.label === "Fatigue")?.value ?? 0;
  const sleepQuality = quickValues.find((item) => item.label === "Sleep Quality")?.value ?? 0;
  const sessionLoad = sessionRpe * sessionDuration;

  function updateQuickValue(label: string, value: number) {
    setQuickValues(
      quickValues.map((item) => (
        item.label === label ? { ...item, value } : item
      )),
    );
  }

  return (
    <div className="page page-stack">
      <header className="log-hero">
        <div>
          <p className="eyebrow">Today / 今天</p>
          <h1 className="page-title">Log the few signals that actually change the recommendation.</h1>
          <p className="page-subtitle">
            For most users, four inputs are enough: how hard the session felt, how long it took, fatigue, and sleep.
          </p>
        </div>
        <div className="log-output-stack">
          <div className="log-output-card log-output-card--dark">
            <p className="log-output-label">Today output</p>
            <p className="log-output-value">{data.trainingBlock.trainingMode}</p>
            <p className="log-output-detail">{data.userCase.currentDay}</p>
          </div>
          <div className="log-output-card">
            <p className="log-output-label">Session load</p>
            <p className="log-output-value">{sessionLoad} AU</p>
            <p className="log-output-detail">RPE {sessionRpe} x {sessionDuration} min</p>
          </div>
        </div>
      </header>

      <section className="quick-log-shell">
        <div className="quick-log-header">
          <div>
            <p className="section-eyebrow">Default: 4 inputs</p>
            <h2 className="section-title">Quick log / 快速记录</h2>
          </div>
          <span className="status-badge status-badge--good">~60 sec</span>
        </div>

        <div className="quick-control-grid">
          {quickValues.map((item) => (
            <article key={item.label} className="quick-control-card">
              <div className="quick-control-top">
                <div>
                  <p className="quick-control-label">{item.label}</p>
                  <p className="quick-control-sub">{item.labelZh}</p>
                </div>
                <span className="quick-value-pill">{item.value}</span>
              </div>
              <p className="quick-output">Changes: {item.output}</p>
              <input
                type="range"
                min="1"
                max={getMaxValue(item.label)}
                value={item.value}
                onChange={(event) => updateQuickValue(item.label, Number(event.target.value))}
                className="range-input range-input--modern"
              />
            </article>
          ))}
        </div>
      </section>

      <div className="two-column">
        <SectionCard title="Optional when useful" titleZh="有需要时再记录" eyebrow="More detail, more friction">
          <div className="compact-card-list">
            {data.optionalLogItems.map((item) => (
              <article key={item.label} className="compact-signal-card">
                <div>
                  <p className="work-title">{item.label}</p>
                  <p className="info-subtitle">{item.labelZh}</p>
                </div>
                <span className="signal-chip">{item.output}</span>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="What changed today" titleZh="今天哪些输出变化了" eyebrow="Plain-language result">
          <div className="compact-card-list">
            <article className="compact-signal-card">
              <div>
                <p className="work-title">Training pressure rose</p>
                <p className="info-subtitle">训练压力上升</p>
              </div>
              <span className="signal-chip">675 AU</span>
            </article>
            <article className="compact-signal-card">
              <div>
                <p className="work-title">Recovery is worth watching</p>
                <p className="info-subtitle">恢复值得观察</p>
              </div>
              <span className="signal-chip signal-chip--muted">{fatigue}/5 · {sleepQuality}/5</span>
            </article>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Why these inputs matter" titleZh="为什么记录这些" eyebrow="Simple cause and effect">
        <div className="output-map-grid">
          {data.recordOutputItems.slice(0, 3).map((item) => (
            <article key={item.input} className="output-map-card">
              <p className="work-title">{item.input}</p>
              <p className="info-subtitle">{item.inputZh}</p>
              <p className="work-detail">{item.output}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <EvidenceNote title="Keep the daily habit light / 保持每日记录轻量" evidenceType="watch">
        <p>LiftOps should feel like a quick training receipt. Advanced metrics stay optional.</p>
        <p>LiftOps 应该像训练小票一样快速。高级指标保持可选，不强迫普通用户学习公式。</p>
      </EvidenceNote>
    </div>
  );
}
