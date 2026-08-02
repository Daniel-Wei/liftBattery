import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "./httpClient";

describe("resolveApiBaseUrl", () => {
  it.each([
    [undefined, "/api"],
    ["", "/api"],
    ["   ", "/api"],
    ["/api", "/api"],
    ["/api/", "/api"],
    ["https://example.azurewebsites.net/api/", "https://example.azurewebsites.net/api"],
  ])("resolves %j to %s", (configuredBaseUrl, expected) => {
    expect(resolveApiBaseUrl(configuredBaseUrl)).toBe(expected);
  });
});
