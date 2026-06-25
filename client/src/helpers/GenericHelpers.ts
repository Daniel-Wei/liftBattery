export function getTodayDate() {
  return getLocalDateString();
}

export function getLocalDateString() {
  return new Date().toISOString().slice(0, 10);
}

let nextLocalId = -1;

export function createId(_prefix: string) {
  return nextLocalId--;
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
