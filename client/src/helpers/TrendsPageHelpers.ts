export function normalizeToMonday(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

export function getJobStatusLabel(status: string) {
  if (status === "EnqueuePending") {
    return "准备入队";
  }

  if (status === "Queued") {
    return "排队中";
  }

  if (status === "Processing") {
    return "生成中";
  }

  if (status === "Completed") {
    return "已完成";
  }

  if (status === "Failed") {
    return "生成失败";
  }

  if (status === "CancelRequested") {
    return "正在停止旧报告";
  }

  if (status === "Outdated") {
    return "报告已过期";
  }

  if (status === "Superseded") {
    return "已被新版本取代";
  }

  return "已取消";
}
