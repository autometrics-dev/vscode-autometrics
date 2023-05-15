import { FORM_ENCODED_MIME_TYPE } from "./constants";

const MIME_TYPE_PREFIX = `${FORM_ENCODED_MIME_TYPE},`;

/**
 * Encodes an object with arbitrary string keys and values into a query data
 * string.
 * Skips serialization of null values.
 */
export function encodeQueryData(queryData: Record<string, string>): string {
  const fields = [];
  for (const [fieldName, value] of Object.entries(queryData)) {
    fields.push(
      `${encodeFormComponent(fieldName)}=${encodeFormComponent(value)}`,
    );
  }

  return `${MIME_TYPE_PREFIX}${fields.join("&")}`;
}

/**
 * Decodes a query data string into an object with arbitrary string keys and values.
 */
export function decodeQueryData(queryData: string): Record<string, string> {
  if (!queryData?.startsWith(MIME_TYPE_PREFIX)) {
    return {};
  }

  const queryObject: Record<string, string> = {};
  for (const field of queryData.slice(MIME_TYPE_PREFIX.length).split("&")) {
    const equalSignIndex = field.indexOf("=");
    if (equalSignIndex === -1) {
      continue;
    }

    const key = decodeFormComponent(field.slice(0, equalSignIndex));
    const value = decodeFormComponent(field.slice(equalSignIndex + 1));
    queryObject[key] = value;
  }

  return queryObject;
}

/**
 * Returns the value of a field in the query data.
 *
 * Returns an empty string if the field has no value.
 */
export function getQueryField(
  queryData: string | undefined,
  fieldName: string,
) {
  if (!queryData?.startsWith(MIME_TYPE_PREFIX)) {
    return "";
  }

  for (const field of queryData.slice(MIME_TYPE_PREFIX.length).split("&")) {
    const equalSignIndex = field.indexOf("=");
    if (equalSignIndex === -1) {
      continue;
    }

    const key = decodeFormComponent(field.slice(0, equalSignIndex));
    if (key === fieldName) {
      return decodeFormComponent(field.slice(equalSignIndex + 1));
    }
  }

  return "";
}

/**
 * Returns whether the query data string contains any query data that we
 * understand.
 */
export function hasQueryData(queryData: string | undefined): boolean {
  return queryData?.startsWith(MIME_TYPE_PREFIX)
    ? queryData.length > MIME_TYPE_PREFIX.length
    : false;
}

/**
 * Sets the value of a field in the query data.
 *
 * Returns the new query data.
 */
export function setQueryField(
  queryData: string | undefined,
  fieldName: string,
  value: string,
): string {
  if (!queryData?.startsWith(MIME_TYPE_PREFIX)) {
    return `${MIME_TYPE_PREFIX}${encodeFormComponent(
      fieldName,
    )}=${encodeFormComponent(value)}`;
  }

  const fields = queryData.slice(MIME_TYPE_PREFIX.length).split("&");
  let inserted = false;
  for (let i = 0; i < fields.length; i++) {
    // rome-ignore lint/style/noNonNullAssertion: we need to manipulate `i` in this loop.
    const field = fields[i]!;
    const equalSignIndex = field.indexOf("=");
    const key = decodeFormComponent(
      equalSignIndex > -1 ? field.slice(0, equalSignIndex) : field,
    );
    if (!inserted && key >= fieldName) {
      fields.splice(
        i,
        0,
        `${encodeFormComponent(fieldName)}=${encodeFormComponent(value)}`,
      );
      inserted = true;
      i++;
    }

    if (key === fieldName) {
      fields.splice(i, 1);
      i--;
    }
  }

  if (!inserted) {
    fields.push(
      `${encodeFormComponent(fieldName)}=${encodeFormComponent(value)}`,
    );
  }

  return `${MIME_TYPE_PREFIX}${fields.join("&")}`;
}

/**
 * Removes a field from the query data.
 *
 * Returns the new query data.
 */
export function unsetQueryField(
  queryData: string | undefined,
  fieldName: string,
): string | undefined {
  const encodedFieldName = encodeFormComponent(fieldName);

  if (!queryData?.startsWith(MIME_TYPE_PREFIX)) {
    return MIME_TYPE_PREFIX;
  }

  const prefix = `${encodedFieldName}=`;
  const fields = queryData.slice(MIME_TYPE_PREFIX.length).split("&");
  for (let i = 0; i < fields.length; i++) {
    if (fields[i]?.startsWith(prefix)) {
      fields.splice(i, 1);
      i--;
    }
  }

  return `${MIME_TYPE_PREFIX}${fields.join("&")}`;
}

function decodeFormComponent(string: string): string {
  return decodeURIComponent(string.replace(/\+/g, " "));
}

function encodeFormComponent(string: string): string {
  return encodeURIComponent(string)
    .replace(/%20/g, "+")
    .replace(
      /[!'()~]/g,
      (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
    );
}
