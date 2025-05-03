import { Component, ErrorInfo, ReactNode } from "react";
import { useError } from "../store/error-context";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryClass extends Component<
  { children: ReactNode; showError: (message: string, title?: string) => void },
  ErrorBoundaryState
> {
  constructor(props: {
    children: ReactNode;
    showError: (message: string, title?: string) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Display error in UI
    this.props.showError(
      `${error.message}\n\nComponent Stack: ${errorInfo.componentStack}`,
      "React Component Error"
    );

    // Log error to console
    console.error("Uncaught error in component:", error, errorInfo);
  }

  render(): ReactNode {
    return this.props.children;
  }
}

// This is a function component that wraps our class component
const ErrorBoundaryWrapper = ({ children }: ErrorBoundaryProps) => {
  const { showError } = useError();

  return (
    <ErrorBoundaryClass showError={showError}>{children}</ErrorBoundaryClass>
  );
};

export { ErrorBoundaryWrapper as ErrorBoundary };
