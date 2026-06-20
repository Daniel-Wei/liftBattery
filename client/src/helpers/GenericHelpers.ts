export function getTodayDate() {
  return getLocalDateString();
}

export function getLocalDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function createId(prefix: string) {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 100000)}`;
}

export function getOptionalNumber(value: string) {
  if (value.trim() === "") {
    return undefined;
  }

  return Number(value);
}

export function formatWholeNumber(value: number) {
  return Math.round(value).toLocaleString("zh-CN");
}

export function formatDecimal(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
