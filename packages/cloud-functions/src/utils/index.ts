/**
 * Create a standardized Cloud Function response
 */
export function createResponse(
  statusCode: number,
  body: unknown
): { statusCode: number; body: string } {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
}

/**
 * Error handler for Cloud Functions
 */
export function handleError(error: unknown): { statusCode: number; body: string } {
  console.error('Cloud Function error:', error);

  const message = error instanceof Error ? error.message : 'Internal server error';

  return createResponse(500, {
    success: false,
    error: message,
  });
}

/**
 * Validate required environment variables
 */
export function validateEnvVars(vars: string[]): void {
  const missing = vars.filter((v) => !process.env[v]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
