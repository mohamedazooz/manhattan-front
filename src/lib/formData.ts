export function omitKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
): Partial<T> {
  const next = { ...obj };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

export function appendFormField(fd: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) return;
  if (typeof value === 'boolean') {
    fd.append(key, value ? 'true' : 'false');
    return;
  }
  if (typeof value === 'number' && !Number.isNaN(value)) {
    fd.append(key, String(value));
    return;
  }
  if (value === '') return;
  fd.append(key, String(value));
}

export function buildFormData(
  data: Record<string, unknown>,
  options?: { exclude?: string[] },
): FormData {
  const fd = new FormData();
  const exclude = new Set(options?.exclude ?? []);
  for (const [key, value] of Object.entries(data)) {
    if (exclude.has(key)) continue;
    appendFormField(fd, key, value);
  }
  return fd;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return fallback;
}
