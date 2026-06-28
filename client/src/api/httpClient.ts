const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type HttpRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

function buildHeaders(hasBody: boolean) {
  const headers = new Headers();

  if (hasBody) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function readErrorMessage(response: Response) {
  const fallbackMessage = `Request failed with status ${response.status}`;

  try {
    const errorBody: unknown = await response.json();

    if (
      typeof errorBody === "object"
      && errorBody !== null
      && "message" in errorBody
      && typeof errorBody.message === "string"
    ) {
      return errorBody.message;
    }

    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export async function requestJson<TResponse>(
  path: string,
  options: HttpRequestOptions = {},
): Promise<TResponse> {
  const hasBody = options.body !== undefined;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: buildHeaders(hasBody),
    body: hasBody ? JSON.stringify(options.body) : undefined,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
