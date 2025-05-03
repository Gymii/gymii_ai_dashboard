import { mockFetch } from "../mocks/mockApi";

const API_URL = "http://127.0.0.1:5500/api";

// Use mock fetch in development mode
const fetchImplementation = window.fetch;

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetchImplementation(`${API_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  try {
    const data = await response.json();
    console.log("data", data);
    return data;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw error;
  }
}

export async function postData<T>(endpoint: string, data?: any): Promise<T> {
  const response = await fetchImplementation(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
