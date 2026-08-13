import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const message = error.response?.data?.message;
  if (typeof message === 'string' && message.trim()) {
    return message;
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.filter((item) => typeof item === 'string').join(', ');
  }

  return fallback;
}
