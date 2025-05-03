/**
 * Utility functions to test the error handling system
 */

// Test function to trigger unhandled promise rejection
export function triggerPromiseError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("Test unhandled promise rejection"));
    }, 100);
  });
}

// Test function to trigger a runtime error
export function triggerRuntimeError(): void {
  // This will throw a runtime error
  const obj: any = null;
  obj.nonExistentMethod();
}

// Test function to trigger an async error
export async function triggerAsyncError(): Promise<void> {
  throw new Error("Test async error");
}

// Example of how to use these test functions:
/*
  import { triggerPromiseError, triggerRuntimeError, triggerAsyncError } from '../utils/test-error';

  // In a component:
  const handleTestError = () => {
    // Test unhandled promise rejection
    triggerPromiseError();
    
    // OR test runtime error
    // triggerRuntimeError();
    
    // OR test async error without try/catch
    // const runAsync = async () => {
    //   await triggerAsyncError();
    // };
    // runAsync();
  };
*/
