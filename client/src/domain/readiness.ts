import type { MainDriver, ReadinessResult, TrainingInput } from "../types/appTypes";

function clampScore(score: number) {
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getPreviousSessionLoad(input: TrainingInput) {
  return input.previousSessionRpe * input.previousSessionDurationMinutes;
}

function getSleepAdjustment(sleepHours: number) {
  if (sleepHours < 5) {
    return -30;
  }

  if (sleepHours < 6) {
    return -22;
  }

  if (sleepHours < 7) {
    return -12;
  }

  if (sleepHours > 8.5) {
    return 4;
  }

  return 0;
}

function getRestingHeartRateAdjustment(restingHeartRateDelta: number) {
  if (restingHeartRateDelta <= 0) {
    return 1;
  }

  if (restingHeartRateDelta <= 5) {
    return -2;
  }

  if (restingHeartRateDelta <= 10) {
    return -6;
  }

  return -10;
}

function getPreviousSessionLoadAdjustment(previousSessionLoad: number) {
  if (previousSessionLoad >= 800) {
    return -16;
  }

  if (previousSessionLoad >= 600) {
    return -10;
  }

  if (previousSessionLoad <= 300) {
    return 4;
  }

  return 0;
}

function getMainDrivers(input: TrainingInput) {
  const drivers: MainDriver[] = [];
  const previousSessionLoad = getPreviousSessionLoad(input);

  if (input.sleepHours < 7) {
    drivers.push({
      id: "shortSleep",
      message: "Short sleep",
      reason: "sleep hours < 7",
    });
  }

  if (input.soreness >= 4) {
    drivers.push({
      id: "highSoreness",
      message: "High soreness",
      reason: "soreness >= 4",
    });
  }

  if (input.motivation <= 2) {
    drivers.push({
      id: "lowMotivation",
      message: "Low motivation",
      reason: "motivation <= 2",
    });
  }

  if (input.restingHeartRateDelta > 5) {
    drivers.push({
      id: "restingHeartRateAboveBaseline",
      message: "Resting HR above baseline",
      reason: "resting heart rate delta > 5",
    });
  }

  if (previousSessionLoad >= 600) {
    drivers.push({
      id: "hardPreviousSessionLoad",
      message: "Hard previous session load",
      reason: "previous session load >= 600 AU",
    });
  }

  if (drivers.length === 0) {
    drivers.push({
      id: "noMajorIssues",
      message: "No major issues",
      reason: "none",
    });
  }

  return drivers;
}

export function calculateReadiness(input: TrainingInput): ReadinessResult {
  const sorenessPenalty = (input.soreness - 1) * 8;
  const motivationAdjustment = (input.motivation - 3) * 6;
  const previousSessionLoad = getPreviousSessionLoad(input);

  const score = clampScore(
    76
      + getSleepAdjustment(input.sleepHours)
      + getRestingHeartRateAdjustment(input.restingHeartRateDelta)
      + getPreviousSessionLoadAdjustment(previousSessionLoad)
      + motivationAdjustment
      - sorenessPenalty,
  );

  if (score >= 80) {
    return {
      score,
      status: "ready",
      statusLabel: "Ready",
      statusLabelZh: "状态较好",
      badgeStatus: "good",
      recommendation: "Push the planned session if warm-ups feel normal.",
      recommendationZh: "如果热身表现正常，可以按计划推进训练。",
      mainDrivers: getMainDrivers(input),
    };
  }

  if (score >= 65) {
    return {
      score,
      status: "steady",
      statusLabel: "Steady",
      statusLabelZh: "稳定执行",
      badgeStatus: "neutral",
      recommendation: "Train as planned, but avoid adding extra volume.",
      recommendationZh: "按计划训练，但不要额外加量。",
      mainDrivers: getMainDrivers(input),
    };
  }

  if (score >= 50) {
    return {
      score,
      status: "caution",
      statusLabel: "Caution",
      statusLabelZh: "谨慎观察",
      badgeStatus: "watch",
      recommendation: "Keep the session lighter and protect movement quality.",
      recommendationZh: "降低今天输出，优先保留动作质量。",
      mainDrivers: getMainDrivers(input),
    };
  }

  return {
    score,
    status: "recovery",
    statusLabel: "Recovery Priority",
    statusLabelZh: "优先恢复",
    badgeStatus: "risk",
    recommendation: "Make today recovery-focused or use a very light technical session.",
    recommendationZh: "今天建议以恢复为主，或只做很轻的技术练习。",
    mainDrivers: getMainDrivers(input),
  };
}
