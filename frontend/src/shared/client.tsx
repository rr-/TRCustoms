import { AuthService } from "src/services/auth.service";

interface IFetchJSONOptions {
  method: string;
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  data?: any;
}

interface IFetchMultipartOptions {
  method: string;
  headers?: { [key: string]: string };
  query?: { [key: string]: string };
  data?: FormData;
}

class FetchError<Result> extends Error {
  response: Response;
  data: Result;

  constructor(message: string, response: Response, data: Result) {
    super(message);
    this.name = this.constructor.name;
    this.response = response;
    this.data = data;
  }
}

async function fetchJSONWithoutRetry<Result>(
  url: string,
  options: IFetchJSONOptions
): Promise<Result> {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const accessToken = AuthService.getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (options.query) {
    url += "?" + new URLSearchParams(options.query).toString();
  }
  const response = await fetch(url, {
    method: options.method,
    headers: headers,
    body: JSON.stringify(options.data),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new FetchError(data.detail, response, data);
  }
  return data;
}

async function fetchJSON<Result>(
  url: string,
  options: IFetchJSONOptions
): Promise<Result> {
  try {
    return await fetchJSONWithoutRetry<Result>(url, options);
  } catch (error) {
    if (error instanceof FetchError && error.data?.code === "user_not_found") {
      AuthService.logout();
      throw error;
    }
    if (error instanceof FetchError && error.data?.code === "token_not_valid") {
      // access token expired
      try {
        await AuthService.getNewAccessToken();
      } catch (error) {
        // refresh token expired, too
        AuthService.logout();
        throw error;
      }
      return await fetchJSONWithoutRetry<Result>(url, options);
    }
    throw error;
  }
}

async function fetchMultipart<Result>(
  url: string,
  options: IFetchMultipartOptions
): Promise<Result> {
  const headers = { ...options.headers };
  const accessToken = AuthService.getAccessToken();
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  if (options.query) {
    url += "?" + new URLSearchParams(options.query).toString();
  }
  const response = await fetch(url, {
    method: options.method,
    headers: headers,
    body: options.data,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new FetchError(data.detail, response, data);
  }
  return data;
}

export { fetchJSON, fetchJSONWithoutRetry, fetchMultipart, FetchError };
