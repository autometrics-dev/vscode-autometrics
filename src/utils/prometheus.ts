export function makePrometheusUrl(query: string, base: string) {
  function createValidBaseUrl(url: string) {
    return url.endsWith("/") ? url : `${url}/`;
  }

  return `${createValidBaseUrl(base)}graph?g0.expr=${urlEncodeString(
    query,
  )}&g0.tab=0`;
}

// Utility to ensure that parens and other characters are encoded as well
//
//(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#encoding_for_rfc3986)
function urlEncodeString(str: string) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}
