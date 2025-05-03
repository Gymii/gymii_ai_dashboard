import { mockRetentionData } from "./mockRetentionData";

/**
 * This is a simple mock API handler for development purposes.
 * It can be used to simulate API responses when the backend is not available.
 *
 * Usage:
 * 1. Import this file in your code
 * 2. In your API calls, add a conditional to use mockFetch instead of fetch:
 *
 *    // In your API service:
 *    const fetch = process.env.NODE_ENV === 'development' ? mockFetch : window.fetch;
 */

// Mock implementation of the fetch API
export async function mockFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const urlObj = new URL(url, window.location.origin);
  const path = urlObj.pathname;

  // Wait to simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Handle different endpoints
  if (path === "/api/analytics/retention") {
    return createMockResponse(200, mockRetentionData);
  }

  if (path === "/api/analytics/refresh") {
    return createMockResponse(200, {
      message: "Queries refreshed successfully",
    });
  }

  // Default response for unhandled routes
  return createMockResponse(404, { error: "Endpoint not found" });
}

// Helper to create a mock Response object
function createMockResponse(status: number, body: any): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
