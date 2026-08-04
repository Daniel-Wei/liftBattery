import { PageKey, type NavItem } from "../types/appTypes";

export const navItems: NavItem[] = [
  { key: PageKey.Overview, label: "Overview", labelZh: "总览" },
  { key: PageKey.PreCheck, label: "Pre-check", labelZh: "练前检查" },
  { key: PageKey.Training, label: "Training", labelZh: "训练记录" },
  { key: PageKey.ExerciseGuide, label: "Exercise guide", labelZh: "动作指引" },
  { key: PageKey.DailyReport, label: "Daily report", labelZh: "每日报告" },
  { key: PageKey.Trends, label: "Trends", labelZh: "趋势报告" },
  { key: PageKey.Profile, label: "Profile", labelZh: "个人设置" },
];
