/**
 * Simple wrapper around fetch for JSON API calls.
 * Returns a Promise that resolves to the parsed JSON response.
 * Throws an error object containing status and body on non‑2xx responses.
 */
export async function apiRequest(method, url, data = null) {
  const options = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };
  if (data !== null) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await response.json() : await response.text();
  if (!response.ok) {
    const err = new Error('API error');
    err.status = response.status;
    err.body = body;
    throw err;
  }
  return body;
}

export function apiGet(url) {
  return apiRequest('GET', url);
}

export function apiPost(url, data) {
  return apiRequest('POST', url, data);
}

// Expose functions globally for pages that rely on the classic script loading.
if (typeof window !== 'undefined') {
  window.apiRequest = apiRequest;
  window.apiGet = apiGet;
  window.apiPost = apiPost;
}
