const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

type HttpMethod = 'GET' | 'POST';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
};

const request = async <T = void>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> => {
  const headers: Record<string, string> = { 'x-api-key': API_KEY };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
};

export { request };
