import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { User, AuthState } from "../lib/types";
import { createClient } from "@supabase/supabase-js";
import { useError } from "../store/error-context";

// Track initialization status and error
let initializationError: Error | null = null;
let supabase: ReturnType<typeof createClient> | null = null;

try {
  // Initialize Supabase client
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and anon key must be defined in environment variables"
    );
  }

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: "supabase-auth",
    },
  });
} catch (error) {
  // Capture any initialization errors
  if (error instanceof Error) {
    initializationError = error;
    console.error("Supabase initialization error:", error);
  } else {
    initializationError = new Error("Unknown error initializing Supabase");
  }
}

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
  logout: () => Promise<void>;
  initError: Error | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { showError } = useError();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: !initializationError, // Don't show loading if we have an initialization error
  });

  // Show initialization error if present
  useEffect(() => {
    if (initializationError) {
      showError(initializationError.message, {
        title: "Supabase Initialization Error",
        isCritical: true,
        action: {
          label: "View Error Demo",
          onClick: () => {
            window.location.href = "/error-demo";
          },
        },
      });
    }
  }, [showError]);

  // Check for existing session on initialization (only if supabase was initialized successfully)
  useEffect(() => {
    if (!supabase || initializationError) return;
    console.log("supabase initialized", supabase);
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("event", event);
        console.log("session", session);
        if (session) {
          // Map Supabase user to your User type
          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata.name || "User",
            role: session.user.user_metadata.role || "user",
            avatar: session.user.user_metadata.avatar || undefined,
          };
          console.log("user obtained", user);

          console.log("user", user);

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log("session", session);
        const user: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata.name || "User",
          role: session.user.user_metadata.role || "user",
          avatar: session.user.user_metadata.avatar || undefined,
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Check if supabase is initialized
    if (!supabase) {
      showError(
        initializationError?.message || "Supabase client is not initialized",
        "Authentication Error"
      );
      throw new Error("Supabase client is not initialized");
    }

    setAuthState({ ...authState, isLoading: true });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // The auth state will be updated by the listener
    } catch (error) {
      setAuthState({
        ...authState,
        isLoading: false,
      });

      if (error instanceof Error) {
        showError(error.message, "Authentication Error");
      } else {
        showError(
          "An unknown error occurred during login",
          "Authentication Error"
        );
      }

      throw error;
    }
  };

  const logout = async () => {
    // Check if supabase is initialized
    if (!supabase) {
      showError(
        initializationError?.message || "Supabase client is not initialized",
        "Logout Error"
      );
      throw new Error("Supabase client is not initialized");
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // The auth state will be updated by the listener
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message, "Logout Error");
      } else {
        showError("An unknown error occurred during logout", "Logout Error");
      }

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ ...authState, login, logout, initError: initializationError }}
    >
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
