import { useError } from "../store/error-context";
import {
  triggerPromiseError,
  triggerRuntimeError,
  triggerAsyncError,
} from "../utils/test-error";
import { useApiErrorHandler, withErrorHandling } from "../lib/error-utils";

export default function ErrorDemo() {
  const { showError } = useError();
  const handleApiError = useApiErrorHandler();

  // Example of manual error triggering
  const handleManualError = () => {
    showError("This is a manually triggered error", "Manual Error Example");
  };

  // Example of critical error triggering
  const handleCriticalError = () => {
    showError(
      "This is a critical system error that requires attention.\nMultiple line error messages are supported.",
      {
        title: "Critical System Error",
        isCritical: true,
        action: {
          label: "Reload Application",
          onClick: () => window.location.reload(),
        },
      }
    );
  };

  // Example of error with action button
  const handleErrorWithAction = () => {
    showError("This error has an action button to help resolve the issue.", {
      title: "Action Required",
      action: {
        label: "Go to Dashboard",
        onClick: () => (window.location.href = "/dashboard"),
      },
    });
  };

  // Example of unhandled promise rejection
  const handlePromiseError = () => {
    triggerPromiseError();
  };

  // Example of runtime error
  const handleRuntimeError = () => {
    triggerRuntimeError();
  };

  // Example of using withErrorHandling for async operations
  const handleAsyncError = async () => {
    await withErrorHandling(
      async () => {
        await triggerAsyncError();
      },
      handleApiError,
      "Async Operation Error"
    );
  };

  // Example of fake API call
  const handleApiCall = async () => {
    try {
      const response = await fetch("https://non-existent-api.example/data");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      // This will be caught by our global API error handling
      // But we can also handle it locally if needed
      console.log("Error caught locally:", error);
    }
  };

  // Simulate the Supabase URL initialization error
  const handleSupabaseUrlError = () => {
    const errorEvent = new ErrorEvent("error", {
      message: "Failed to construct 'URL': Invalid URL",
      filename: "SupabaseClient.ts",
      lineno: 86,
    });
    window.dispatchEvent(errorEvent);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-lg font-medium text-gray-900">Error Handling Demo</h2>
      <p className="text-gray-500 mt-2 mb-4">
        Click the buttons below to test different error scenarios
      </p>

      <div className="space-y-3">
        <h3 className="font-medium text-gray-700 mt-4">Manual Errors</h3>
        <button
          onClick={handleManualError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Show Manual Error
        </button>

        <button
          onClick={handleCriticalError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
        >
          Show Critical Error
        </button>

        <button
          onClick={handleErrorWithAction}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Show Error With Action
        </button>

        <h3 className="font-medium text-gray-700 mt-4">Unhandled Errors</h3>
        <button
          onClick={handlePromiseError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
        >
          Trigger Unhandled Promise Rejection
        </button>

        <button
          onClick={handleRuntimeError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Trigger Runtime Error
        </button>

        <h3 className="font-medium text-gray-700 mt-4">API Errors</h3>
        <button
          onClick={handleAsyncError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
        >
          Handle Async Error
        </button>

        <button
          onClick={handleApiCall}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Test API Error Handling
        </button>

        <h3 className="font-medium text-gray-700 mt-4">Supabase Errors</h3>
        <button
          onClick={handleSupabaseUrlError}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
        >
          Simulate Supabase URL Error
        </button>
      </div>
    </div>
  );
}
