import { createContext, useContext, useState, ReactNode } from "react";
import { User, AuthState } from "../lib/types";

// Mock admin user for demo purposes
const mockAdmin: User = {
  id: "1",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  avatar:
    "https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff",
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (email: string, password: string) => {
    setAuthState({ ...authState, isLoading: true });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple validation for demo
    if (email === "admin@example.com" && password === "password") {
      setAuthState({
        user: mockAdmin,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
