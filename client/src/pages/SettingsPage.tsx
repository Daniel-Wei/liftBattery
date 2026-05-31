import { SectionCard } from "../components/SectionCard";
import { getLevelData, levelProfiles } from "../data/mockData";
import type { UserLevel } from "../types/appTypes";

type SettingsPageProps = {
  selectedLevel: UserLevel;
};

export function SettingsPage({ selectedLevel }: SettingsPageProps) {
  const data = getLevelData(selectedLevel);
  const settings = data.settingsMock;
  const profile = levelProfiles.find((item) => item.level === selectedLevel);

  return (
    <div className="page page--narrow page-stack">
      <header className="page-header">
        <p className="eyebrow">Settings / 设置</p>
        <h1 className="page-title">Define the training context behind the formulas.</h1>
        <p className="page-subtitle">{profile?.label}: {profile?.title}</p>
      </header>

      <SectionCard title="Training setup" titleZh="训练设置" eyebrow="Mock settings">
        <div className="two-column">
          <div className="info-card">
            <p className="info-label">Mode preset</p>
            <p className="info-title">{settings.modePreset}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Cycle length</p>
            <p className="info-title">{settings.cycleLength}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Training goal</p>
            <p className="info-title">{settings.trainingGoal}</p>
          </div>
          <div className="info-card">
            <p className="info-label">Units</p>
            <p className="info-title">{settings.units}</p>
          </div>
        </div>
        <div className="preview-risk">
          <p className="preview-eyebrow">Target muscle priorities</p>
          <p className="preview-risk-title">{settings.targetMuscles.join(", ")}</p>
        </div>
      </SectionCard>

    </div>
  );
}
