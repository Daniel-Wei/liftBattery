import { useState } from "react";
import { EvidenceNote } from "../components/EvidenceNote";
import { SectionCard } from "../components/SectionCard";
import { advancedLogItems, optionalLogItems, quickLogItems, recordOutputItems } from "../data/mockData";
import type { CheckInItem } from "../types/appTypes";

function getMaxValue(label: string) {
  if (label === "Session Duration" || label === "Bodyweight" || label === "HRV") {
    return "100";
  }

  if (label === "Rep Velocity") {
    return "100";
  }

  if (label === "CMJ Height") {
    return "60";
  }

  if (label === "Session RPE" || label === "Hard Sets") {
    return "10";
  }

  return "5";
}

export function DailyLogPage() {
  const [quickValues, setQuickValues] = useState<CheckInItem[]>(quickLogItems);
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
          <p className="eyebrow">Daily Log / 每日记录</p>
          <h1 className="page-title">Start with a 60-second quick log.</h1>
          <p className="page-subtitle">Four inputs are enough for a useful first read. More detail can unlock later.</p>
        </div>
        <div className="log-output-stack">
          <div className="log-output-card log-output-card--dark">
            <p className="log-output-label">Session load</p>
            <p className="log-output-value">{sessionLoad} AU</p>
            <p className="log-output-detail">RPE {sessionRpe} x {sessionDuration} min</p>
          </div>
          <div className="log-output-card">
            <p className="log-output-label">Readiness inputs</p>
            <p className="log-output-value">{fatigue}/5 · {sleepQuality}/5</p>
            <p className="log-output-detail">Fatigue · Sleep</p>
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
              <p className="quick-output">Output: {item.output}</p>
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
        <SectionCard title="Optional when ready" titleZh="准备好了再加" eyebrow="More signal, more friction">
          <div className="compact-card-list">
            {optionalLogItems.map((item) => (
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

        <SectionCard title="Advanced later" titleZh="高级版后续再开" eyebrow="Device or coach data">
          <div className="compact-card-list">
            {advancedLogItems.map((item) => (
              <article key={item.label} className="compact-signal-card">
                <div>
                  <p className="work-title">{item.label}</p>
                  <p className="info-subtitle">{item.labelZh}</p>
                </div>
                <span className="signal-chip signal-chip--muted">{item.output}</span>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Input to output map" titleZh="输入到输出映射" eyebrow="What changes what">
        <div className="output-map-grid">
          {recordOutputItems.map((item) => (
            <article key={item.input} className="output-map-card">
              <p className="work-title">{item.input}</p>
              <p className="info-subtitle">{item.inputZh}</p>
              <p className="work-detail">{item.output}</p>
            </article>
          ))}
        </div>
      </SectionCard>

      <EvidenceNote title="Daily log boundary / 每日记录边界" evidenceType="watch">
        <p>The daily log should feel like a quick training receipt, not homework. More inputs should unlock only when the user wants more precision.</p>
        <p>每日记录应该像快速训练小票，而不是作业。更多输入只在用户想要更高精度时再解锁。</p>
      </EvidenceNote>
    </div>
  );
}
