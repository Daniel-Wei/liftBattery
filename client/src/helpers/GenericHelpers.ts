export function getTodayDate() {
  return getLocalDateString();
}

export function getLocalDateString() {
  return new Date().toISOString().slice(0, 10);
}

// Seeded drafts use small negative IDs (-1, -2, ...). Keep generated IDs in a
// separate range so React keys and reducer lookups can never collide with them.
let nextLocalId = -1_000_000_000;

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
