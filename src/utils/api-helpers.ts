type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (message: string, status = 400): Response =>
  Response.json({ success: false, error: message }, { status });

export const validateQueryParam = (
  params: URLSearchParams,
  key: string,
  validator?: (value: string) => boolean
): string => {
  const value = params.get(key);
  if (!value) {
    throw new Error(`${key} parameter is required`);
  }
  if (validator && !validator(value)) {
    throw new Error(`Invalid ${key} parameter`);
  }
  return value;
};

export const parseBigInt = (value: string, paramName: string): bigint => {
  try {
    const num = parseInt(value);
    if (isNaN(num) || num <= 0) {
      throw new Error();
    }
    return BigInt(num);
  } catch {
    throw new Error(`Invalid ${paramName}. Must be a positive number`);
  }
};

export const withErrorHandling =
  (handler: (request: Request) => Promise<Response>) =>
  async (request: Request): Promise<Response> => {
    try {
      return await handler(request);
    } catch (e) {
      const error = e as Error;
      return createErrorResponse(error.message, 500);
    }
  };
