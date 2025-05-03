import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import ErrorDialog from "../components/ErrorDialog";

interface ErrorAction {
  label: string;
  onClick: () => void;
}

interface ErrorOptions {
  title?: string;
  isCritical?: boolean;
  action?: ErrorAction;
}

interface ErrorContextType {
  showError: (message: string, titleOrOptions?: string | ErrorOptions) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<{
    message: string;
    title?: string;
    isCritical?: boolean;
    action?: ErrorAction;
  } | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const showError = (
    message: string,
    titleOrOptions?: string | ErrorOptions
  ) => {
    if (typeof titleOrOptions === "string") {
      // Simple case: just a title
      setError({ message, title: titleOrOptions });
    } else if (titleOrOptions) {
      // Advanced case: options object
      setError({
        message,
        title: titleOrOptions.title,
        isCritical: titleOrOptions.isCritical,
        action: titleOrOptions.action,
      });
    } else {
      // Default case
      setError({ message });
    }
    setShowDialog(true);
  };

  const clearError = () => {
    if (error?.isCritical) return; // Don't clear critical errors

    setShowDialog(false);
    // Clear the error message after the dialog animation is done
    setTimeout(() => setError(null), 300);
  };

  // Setup global error handlers
  useEffect(() => {
    // Handler for uncaught exceptions
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      showError(
        `${event.message || "Unknown error"}\nLocation: ${event.filename}:${
          event.lineno
        }`,
        {
          title: "Unhandled Exception",
          isCritical: event.filename === "api-call" ? false : true, // Critical for non-API errors
        }
      );
      console.error("Global error:", event);
    };

    // Handler for unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      let errorMessage = "Unknown promise error";

      if (event.reason instanceof Error) {
        errorMessage = event.reason.message;
      } else if (typeof event.reason === "string") {
        errorMessage = event.reason;
      } else if (event.reason && typeof event.reason === "object") {
        errorMessage = JSON.stringify(event.reason);
      }

      // Determine if this is a system-critical error
      let isCritical = false;
      if (
        errorMessage.includes("Failed to construct 'URL'") ||
        errorMessage.includes("Supabase") ||
        errorMessage.includes("Authentication")
      ) {
        isCritical = true;
      }

      showError(errorMessage, {
        title: "Unhandled Promise Rejection",
        isCritical,
        action: isCritical
          ? {
              label: "Go to Error Demo",
              onClick: () => {
                window.location.href = "/error-demo";
              },
            }
          : undefined,
      });
      console.error("Unhandled rejection:", event.reason);
    };

    // Add global event listeners
    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Remove listeners on cleanup
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      {error && (
        <ErrorDialog
          open={showDialog}
          onClose={clearError}
          title={error.title}
          message={error.message}
          isCritical={error.isCritical}
          actionButton={error.action}
        />
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
