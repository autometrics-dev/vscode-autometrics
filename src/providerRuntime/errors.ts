import { Error as ProviderError, HttpRequestError } from "./types";

export function isProviderError(error: unknown): error is ProviderError {
  return (
    error !== null &&
    typeof error === "object" &&
    "type" in error &&
    typeof error.type === "string"
  );
}

export function formatProviderError(
  error: unknown,
  { showDetails = false } = {},
): string {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error !== "object" || error == null) {
    return "Unknown error";
  }

  if (!isProviderError(error)) {
    return `An unknown error occurred: ${JSON.stringify(error)}`;
  }

  switch (error.type) {
    case "config":
      return `A config error occurred: ${error.message}`;
    case "data":
      return `A data error occurred: ${error.message}`;
    case "deserialization":
      return `A deserialization error occurred: ${error.message}`;
    case "http":
      return formatHttpErrorMessage(error.error, { showDetails });
    case "invocation":
      return `Error invoking provider: ${error.message}`;
    case "not_found":
      return "Provider not found";
    case "other":
      return error.message;
    case "proxy_disconnected":
      return "FPD disconnected";
    case "unsupported_request":
      return "Unsupported request";
    case "validation_error":
      return `A validation error occurred: ${
        "errors" in error && Array.isArray(error.errors)
          ? error.errors.map(formatValidationError).join(", ")
          : JSON.stringify(error)
      }`;
  }
}

function formatHttpErrorMessage(
  error: HttpRequestError,
  { showDetails = false } = {},
): string {
  switch (error.type) {
    case "connection_refused":
      return "Connection refused";
    case "no_route":
      return "No Route to Host";
    case "offline":
      return "You are offline";
    case "response_too_big":
      return "Returned response was too big";
    case "server_error":
      return `server returned an error (status code: ${error.statusCode}${
        showDetails ? `, response: ${error.response}` : ""
      }) `;
    case "other":
      if (error.reason === "TypeError: Failed to fetch") {
        return "Request failed (typically due to a CORS issue or because you are offline)";
      }

      return error.reason;
    case "timeout":
      return "A timeout occurred";
  }
}

function formatValidationError(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }

  if (typeof error !== "object" || error == null) {
    return "Unknown validation error";
  }

  const message = getErrorMessage(error);
  return "fieldName" in error && typeof error.fieldName === "string"
    ? `Invalid ${error.fieldName}: ${message}`
    : message;
}

function getErrorMessage(error: object): string {
  return "message" in error && typeof error.message === "string"
    ? error.message
    : JSON.stringify(error);
}
