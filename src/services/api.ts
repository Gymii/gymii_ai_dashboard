const isProduction = import.meta.env.MODE === "production";
const API_URL = isProduction
  ? "https://staging.gymii.ai/dashboard/api"
  : "http://localhost:5500/api";

// Use mock fetch in development mode
const fetchImplementation = window.fetch;

// Get the supabase client or create a new one
const getAuthHeaders = async (): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  try {
    // Get session from local storage
    const storageKey = "supabase-auth";
    const sessionStr = localStorage.getItem(storageKey);
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }

  return headers;
};

export async function fetchData<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetchImplementation(`${API_URL}${endpoint}`, {
    headers,
  });

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
  const headers = await getAuthHeaders();

  const response = await fetchImplementation(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function putData<T>(endpoint: string, data?: any): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchImplementation(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteData<T>(endpoint: string): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetchImplementation(`${API_URL}${endpoint}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
