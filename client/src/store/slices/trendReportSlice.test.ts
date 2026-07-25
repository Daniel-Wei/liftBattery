import { describe, expect, it } from "vitest";
import {
  dismissTrendReportError,
  trendReportSliceReducer,
} from "./trendReportSlice";

describe("trendReportSlice error dialog", () => {
  it("opens the dialog for a create failure", () => {
    const state = trendReportSliceReducer(undefined, {
      type: "trendReport/create/rejected",
      payload: "A user-facing create error.",
    });

    expect(state.error).toBe("A user-facing create error.");
    expect(state.isErrorDialogOpen).toBe(true);
  });

  it("opens the dialog for a cancel failure", () => {
    const state = trendReportSliceReducer(undefined, {
      type: "trendReport/cancel/rejected",
      payload: "A user-facing cancel error.",
    });

    expect(state.error).toBe("A user-facing cancel error.");
    expect(state.isErrorDialogOpen).toBe(true);
  });

  it("dismisses the dialog without losing the inline error", () => {
    const failedState = trendReportSliceReducer(undefined, {
      type: "trendReport/create/rejected",
      payload: "A user-facing create error.",
    });
    const dismissedState = trendReportSliceReducer(
      failedState,
      dismissTrendReportError(),
    );

    expect(dismissedState.error).toBe("A user-facing create error.");
    expect(dismissedState.isErrorDialogOpen).toBe(false);
  });

  it("does not repeatedly open the dialog for polling failures", () => {
    const state = trendReportSliceReducer(undefined, {
      type: "trendReport/fetchJob/rejected",
      payload: "A polling error.",
    });

    expect(state.error).toBe("A polling error.");
    expect(state.isErrorDialogOpen).toBe(false);
  });
});
