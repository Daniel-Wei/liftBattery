import {
  MainDriverId,
  MetricStatus,
  ReadinessStatus,
  type MainDriver,
  type ReadinessResult,
  type PreCheckDetailsLog,
} from "../types/appTypes";

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getPreviousSessionLoad(input: PreCheckDetailsLog) {
  return input.previousSessionRpe * input.previousSessionDurationMinutes;
}

function getSleepAdjustment(sleepHours: number) {
  if (sleepHours < 4) {
    return -36;
  }

  if (sleepHours < 5) {
    return -28;
  }

  if (sleepHours < 6) {
    return -20;
  }

  if (sleepHours < 7) {
    return -10;
  }

  if (sleepHours <= 9) {
    return 4;
  }

  if (sleepHours <= 10) {
    return 2;
  }

  return 0;
}

function getRestingHeartRateAdjustment(restingHeartRateDelta: number) {
  if (restingHeartRateDelta <= -3) {
    return 3;
  }

  if (restingHeartRateDelta <= 2) {
    return 0;
  }

  if (restingHeartRateDelta <= 6) {
    return -5;
  }

  if (restingHeartRateDelta <= 10) {
    return -10;
  }

  if (restingHeartRateDelta <= 15) {
    return -16;
  }

  return -22;
}

function getPreviousSessionLoadAdjustment(previousSessionLoad: number) {
  if (previousSessionLoad >= 900) {
    return -18;
  }

  if (previousSessionLoad >= 700) {
    return -12;
  }

  if (previousSessionLoad >= 500) {
    return -6;
  }

  if (previousSessionLoad <= 250) {
    return 3;
  }

  return 0;
}

function getSorenessAdjustment(soreness: number) {
  if (soreness <= 2) {
    return 4;
  }

  if (soreness <= 4) {
    return 0;
  }

  if (soreness <= 6) {
    return -8;
  }

  if (soreness <= 8) {
    return -16;
  }

  return -24;
}

function getMotivationAdjustment(motivation: number) {
  if (motivation <= 2) {
    return -18;
  }

  if (motivation <= 4) {
    return -10;
  }

  if (motivation <= 6) {
    return 0;
  }

  if (motivation <= 8) {
    return 6;
  }

  return 10;
}

function getMainDrivers(input: PreCheckDetailsLog) {
  const drivers: MainDriver[] = [];
  const previousSessionLoad = getPreviousSessionLoad(input);

  if (input.sleepHours < 6) {
    drivers.push({
      id: MainDriverId.ShortSleep,
      message: "睡眠时间偏短",
      reason: "睡眠少于 6 小时",
    });
  }

  if (input.soreness >= 7) {
    drivers.push({
      id: MainDriverId.HighSoreness,
      message: "肌肉酸痛较高",
      reason: "酸痛达到 7 / 10 或以上",
    });
  }

  if (input.motivation <= 4) {
    drivers.push({
      id: MainDriverId.LowMotivation,
      message: "训练动力较低",
      reason: "训练动力为 4 / 10 或以下",
    });
  }

  if (input.restingHeartRateDelta > 6) {
    drivers.push({
      id: MainDriverId.RestingHeartRateAboveBaseline,
      message: "静息心率高于基线",
      reason: "比基线高出 6 次/分以上",
    });
  }

  if (previousSessionLoad >= 700) {
    drivers.push({
      id: MainDriverId.HardPreviousSessionLoad,
      message: "上次训练负荷较高",
      reason: "上次训练负荷达到 700 或以上",
    });
  }

  if (drivers.length === 0) {
    drivers.push({
      id: MainDriverId.NoMajorIssues,
      message: "没有明显问题",
      reason: "当前状态稳定",
    });
  }

  return drivers;
}

export function calculateReadiness(input: PreCheckDetailsLog): ReadinessResult {
  const previousSessionLoad = getPreviousSessionLoad(input);

  const score = clampScore(
    78
      + getSleepAdjustment(input.sleepHours)
      + getRestingHeartRateAdjustment(input.restingHeartRateDelta)
      + getPreviousSessionLoadAdjustment(previousSessionLoad)
      + getMotivationAdjustment(input.motivation)
      + getSorenessAdjustment(input.soreness),
  );

  if (score >= 80) {
    return {
      score,
      status: ReadinessStatus.Ready,
      statusLabel: "状态较好",
      statusLabelZh: "状态较好",
      badgeStatus: MetricStatus.Good,
      recommendation: "如果热身表现正常，可以按计划推进训练。",
      recommendationZh: "如果热身表现正常，可以按计划推进训练。",
      mainDrivers: getMainDrivers(input),
    };
  }

  if (score >= 65) {
    return {
      score,
      status: ReadinessStatus.Steady,
      statusLabel: "稳定执行",
      statusLabelZh: "稳定执行",
      badgeStatus: MetricStatus.Neutral,
      recommendation: "按计划训练，但不要额外加量。",
      recommendationZh: "按计划训练，但不要额外加量。",
      mainDrivers: getMainDrivers(input),
    };
  }

  if (score >= 50) {
    return {
      score,
      status: ReadinessStatus.Caution,
      statusLabel: "谨慎观察",
      statusLabelZh: "谨慎观察",
      badgeStatus: MetricStatus.Watch,
      recommendation: "降低今天输出，优先保留动作质量。",
      recommendationZh: "降低今天输出，优先保留动作质量。",
      mainDrivers: getMainDrivers(input),
    };
  }

  return {
    score,
    status: ReadinessStatus.Recovery,
    statusLabel: "优先恢复",
    statusLabelZh: "优先恢复",
    badgeStatus: MetricStatus.Risk,
    recommendation: "今天建议以恢复为主，或只做很轻的技术练习。",
    recommendationZh: "今天建议以恢复为主，或只做很轻的技术练习。",
    mainDrivers: getMainDrivers(input),
  };
}
