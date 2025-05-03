import { useError } from "../store/error-context";

// Custom error handler hook for APIs
export function useApiErrorHandler() {
  const { showError } = useError();

  const handleApiError = (error: unknown, title = "Error") => {
    if (error instanceof Error) {
      showError(error.message, title);
    } else if (typeof error === "string") {
      showError(error, title);
    } else {
      showError("An unknown error occurred", title);
    }
  };

  return handleApiError;
}

// Function to handle errors in async operations
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler: (error: unknown) => void,
  errorTitle?: string
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    errorHandler(error);
    return undefined;
  }
}

// Global API error interceptor setup
// Use this in your API client setup (e.g., axios, fetch wrapper)
export function setupGlobalApiErrorHandling(
  errorHandler: (error: unknown, title?: string) => void
) {
  // Example for fetch API
  const originalFetch = window.fetch;

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    try {
      const response = await originalFetch.call(
        this,
        input as RequestInfo,
        init
      );

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage: string;
        try {
          const errorData = await response.clone().json();
          errorMessage =
            errorData.message ||
            errorData.error ||
            `HTTP Error ${response.status}`;
        } catch (jsonError) {
          errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        }

        const error = new Error(errorMessage);
        errorHandler(error, `API Error (${response.status})`);

        // Still return the response so the calling code can handle it
      }

      return response;
    } catch (error) {
      // Network errors
      errorHandler(error, "Network Error");
      throw error; // Re-throw to allow local handling if needed
    }
  };

  // Here you can add similar interceptors for other API clients
  // Example: if you use axios, add interceptors like axios.interceptors.response.use()
}

// Initialize global API error handling (call this once in your app bootstrap)
export function initializeGlobalErrorHandling() {
  // Create a simple error handler that doesn't depend on React hooks
  // This is used outside of React components
  const globalErrorHandler = (error: unknown, title?: string) => {
    // We need to access the window object to trigger the error event
    const errorEvent = new ErrorEvent("error", {
      error,
      message: error instanceof Error ? error.message : String(error),
      lineno: 0,
      colno: 0,
      filename: "api-call",
    });

    // Dispatching this event will be caught by our global error handler in error-context.tsx
    window.dispatchEvent(errorEvent);
  };

  // Setup global API error handling
  setupGlobalApiErrorHandling(globalErrorHandler);
}
