export function ok<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

export function fail(message: string, data: Record<string, unknown> = {}) {
  return {
    success: false,
    message,
    data,
  };
}
