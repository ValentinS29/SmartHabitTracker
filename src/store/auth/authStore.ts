import { create } from "zustand";
import { User } from "../../types";
import * as authService from "../../services/auth/authService";
import * as storageService from "../../services/storage/storageService";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  register: async (email: string, password: string) => {
    try {
      console.log("🏪 [AUTH STORE] Registering user");
      set({ isLoading: true, error: null });
      const user = await authService.registerUser(email, password);
      await storageService.saveUser(user);
      set({ user, isLoading: false });
      console.log("✅ [AUTH STORE] User registered and saved");
    } catch (error: any) {
      console.error("❌ [AUTH STORE] Register error:", error.message);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log("🏪 [AUTH STORE] Logging in user");
      set({ isLoading: true, error: null });
      const user = await authService.loginUser(email, password);
      await storageService.saveUser(user);
      set({ user, isLoading: false });
      console.log("✅ [AUTH STORE] User logged in and saved");
    } catch (error: any) {
      console.error("❌ [AUTH STORE] Login error:", error.message);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("🏪 [AUTH STORE] Logging out");
      set({ isLoading: true, error: null });
      await authService.logoutUser();
      await storageService.saveUser(null);
      set({ user: null, isLoading: false });
      console.log("✅ [AUTH STORE] User logged out");
    } catch (error: any) {
      console.error("❌ [AUTH STORE] Logout error:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },

  initialize: async () => {
    try {
      console.log("🏪 [AUTH STORE] Initializing auth");

      // Load saved user from storage
      const savedUser = await storageService.loadUser();
      console.log(
        "📂 [AUTH STORE] Loaded saved user:",
        savedUser ? savedUser.email : "None"
      );

      // Subscribe to auth state changes
      authService.subscribeToAuthChanges((user) => {
        console.log(
          "🔄 [AUTH STORE] Auth state changed:",
          user ? user.email : "logged out"
        );
        set({ user });
        storageService.saveUser(user);
      });

      // Set initial user (Firebase auth will override if logged in)
      set({ user: savedUser, isLoading: false });
      console.log("✅ [AUTH STORE] Auth initialized");
    } catch (error: any) {
      console.error("❌ [AUTH STORE] Initialize error:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },
}));
