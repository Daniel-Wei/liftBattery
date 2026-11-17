import { PageKey, type NavItem } from "../types/appTypes";

export const navItems: NavItem[] = [
  { key: PageKey.CoachOverview, label: "Coach workspace", labelZh: "教练工作台", group: "coach" },
  { key: PageKey.Clients, label: "Clients", labelZh: "学员档案", group: "coach" },
  { key: PageKey.Preparation, label: "Competition prep", labelZh: "备赛管理", group: "coach" },
  { key: PageKey.Schedule, label: "Calendar & credits", labelZh: "排课与课时", group: "coach" },
  { key: PageKey.Nutrition, label: "Nutrition & weight", labelZh: "营养与体重", group: "coach" },
  { key: PageKey.Reviews, label: "Weekly reviews", labelZh: "备赛复盘", group: "coach" },
  { key: PageKey.Overview, label: "Personal overview", labelZh: "个人总览", group: "personal" },
  { key: PageKey.PreCheck, label: "Pre-check", labelZh: "练前检查", group: "personal" },
  { key: PageKey.Training, label: "Training", labelZh: "训练记录", group: "personal" },
  { key: PageKey.DailyReport, label: "Daily report", labelZh: "每日报告", group: "personal" },
  { key: PageKey.Trends, label: "Trends", labelZh: "趋势报告", group: "personal" },
  { key: PageKey.ExerciseGuide, label: "3D exercise guide", labelZh: "3D 动作指引", group: "tools" },
  { key: PageKey.Profile, label: "Profile", labelZh: "个人设置", group: "workspace" },
];

export const coachPageKeys = new Set([PageKey.CoachOverview, PageKey.Clients, PageKey.Preparation, PageKey.Schedule, PageKey.Nutrition, PageKey.Reviews]);
