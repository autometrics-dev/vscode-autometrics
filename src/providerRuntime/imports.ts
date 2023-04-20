import fetch, { Headers } from "node-fetch";

import type {
  HttpRequest,
  HttpRequestError,
  HttpResponse,
  Result,
} from "./types";
import type { Imports } from ".";

export const imports: Imports = {
  log,
  makeHttpRequest,
  now,
  random,
};

function log(message: string) {
  console.info(`Provider log: ${message}`);
}

async function makeHttpRequest(
  request: HttpRequest,
): Promise<Result<HttpResponse, HttpRequestError>> {
  try {
    const headers = new Headers();
    if (request.headers) {
      for (const [key, value] of Object.entries(request.headers)) {
        headers.append(key, value);
      }
    }

    const response = await fetch(request.url, {
      body: request.body ? Buffer.from(request.body) : undefined,
      headers,
      method: request.method,
    });

    if (response.ok) {
      const headers: Record<string, string> = {};
      for (const [key, value] of response.headers) {
        headers[key] = value;
      }

      return ok({
        body: new Uint8Array(await response.arrayBuffer()),
        statusCode: response.status,
        headers,
      });
    } else {
      return err({
        type: "server_error",
        statusCode: response.status,
        response: new Uint8Array(await response.arrayBuffer()),
      });
    }
  } catch (error: unknown) {
    return err({
      type: "other",
      reason:
        (error instanceof Object && error.toString()) || "no error details",
    });
  }
}

function now(): string {
  return new Date().toISOString();
}

function random(length: number): Array<number> {
  const array = [];
  for (let i = 0; i < length; i++) {
    array.push(Math.ceil(Math.random() * 256));
  }

  return array;
}

function ok<T, E>(result: T): Result<T, E> {
  return { Ok: result };
}

function err<T, E>(error: E): Result<T, E> {
  return { Err: error };
}
