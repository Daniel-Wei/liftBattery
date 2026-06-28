import type {
  AuthResultDto,
  LoginRequestDto,
  RegisterRequestDto,
  UpdateProfileRequestDto,
} from "./dtos";
import { requestJson } from "./httpClient";

export function register(request: RegisterRequestDto) {
  return requestJson<AuthResultDto>("/auth/register", {
    method: "POST",
    body: request,
  });
}

export function login(request: LoginRequestDto) {
  return requestJson<AuthResultDto>("/auth/login", {
    method: "POST",
    body: request,
  });
}

export function logout() {
  return requestJson<void>("/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return requestJson<AuthResultDto>("/auth/me");
}

export function updateProfile(request: UpdateProfileRequestDto) {
  return requestJson<AuthResultDto>("/users/me", {
    method: "PUT",
    body: request,
  });
}
