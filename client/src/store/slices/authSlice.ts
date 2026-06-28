import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  LoginRequestDto,
  RegisterRequestDto,
  UpdateProfileRequestDto,
} from "../../api/dtos";
import {
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from "../../api/authApi";
import type { AuthUser } from "../../types/appTypes";

type AuthStatus = "checking" | "idle" | "submitting" | "error";

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  hydrated: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "checking",
  hydrated: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk<AuthUser | null>(
  "auth/fetchCurrentUser",
  async () => {
    try {
      const result = await getMe();
      return result.user;
    } catch {
      return null;
    }
  },
);

export const registerUser = createAsyncThunk<
  AuthUser,
  RegisterRequestDto,
  { rejectValue: string }
>(
  "auth/register",
  async (request, thunkApi) => {
    try {
      const result = await register(request);
      return result.user;
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "注册失败。");
    }
  },
);

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginRequestDto,
  { rejectValue: string }
>(
  "auth/login",
  async (request, thunkApi) => {
    try {
      const result = await login(request);
      return result.user;
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "登录失败。");
    }
  },
);

export const updateCurrentUser = createAsyncThunk<
  AuthUser,
  UpdateProfileRequestDto,
  { rejectValue: string }
>(
  "auth/updateCurrentUser",
  async (request, thunkApi) => {
    try {
      const result = await updateProfile(request);
      return result.user;
    } catch (error) {
      return thunkApi.rejectWithValue(error instanceof Error ? error.message : "保存 Profile 失败。");
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await logout();
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "checking";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
        state.hydrated = true;
        state.error = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
        state.hydrated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "注册失败。";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
        state.hydrated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "登录失败。";
      })
      .addCase(updateCurrentUser.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(updateCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
        state.error = null;
      })
      .addCase(updateCurrentUser.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "保存 Profile 失败。";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        state.hydrated = true;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export const authSliceReducer = authSlice.reducer;
