// -------------------------------------------------------------
// src/contexts/UserContext.tsx
// -------------------------------------------------------------
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/services/firebaseConfig";
import { logEvent } from "@/services/AnalyticsService"; // ✅ novo

// -----------------------------
// Tipos
// -----------------------------
export interface UserPreferences {
  themeMode: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  dailyReminderTime?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
}

interface UserContextData {
  user: User | null;
  loading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  isLoggedIn: boolean;
  refreshUser: () => Promise<void>;
}

const STORAGE_KEY = "@estabiliza:user";
const UserContext = createContext<UserContextData | undefined>(undefined);

// -----------------------------
// Provider
// -----------------------------
export const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Persiste usuário local
  // -----------------------------
  const persistUser = useCallback(async (data: User | null) => {
    try {
      if (data) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      else await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Erro ao persistir usuário:", e);
    }
  }, []);

  // -----------------------------
  // Recupera usuário local ao abrir app
  // -----------------------------
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: User = JSON.parse(stored);
          setUser(parsed);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário do AsyncStorage:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -----------------------------
  // Sincroniza Firebase → Contexto
  // -----------------------------
  const syncUserWithFirebase = useCallback(
    async (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setUser(null);
        await persistUser(null);
        return;
      }

      const newUser: User = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split("@")[0] || "Usuário",
        email: fbUser.email || "sem_email",
        avatar: fbUser.photoURL || undefined,
        preferences: { themeMode: "system" as const, notificationsEnabled: true },
        createdAt: fbUser.metadata.creationTime || new Date().toISOString(),
      };

      setUser(newUser);
      await persistUser(newUser);
      await logEvent({ type: "user_synced", userId: newUser.id });
    },
    [persistUser]
  );

  // -----------------------------
  // Escuta Firebase Auth
  // -----------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      await syncUserWithFirebase(fbUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [syncUserWithFirebase]);

  // -----------------------------
  // Login
  // -----------------------------
  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      try {
        setLoading(true);
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserWithFirebase(result.user);

        const loggedUser: User = {
          id: result.user.uid,
          name: result.user.displayName || email.split("@")[0],
          email: result.user.email || "",
          preferences: { themeMode: "system" as const, notificationsEnabled: true },
          createdAt:
            result.user.metadata.creationTime || new Date().toISOString(),
        };

        // ✅ Log analytics
        await logEvent({
          type: "user_login",
          userId: loggedUser.id,
          metadata: { email: loggedUser.email },
        });

        return loggedUser;
      } catch (e: any) {
        console.error("Erro no login:", e);
        let msg = "Falha ao realizar login.";
        if (e.code === "auth/invalid-credential" || e.code === "auth/wrong-password")
          msg = "Senha incorreta.";
        if (e.code === "auth/user-not-found") msg = "Usuário não encontrado.";
        setError(msg);
        Alert.alert("Erro", msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [syncUserWithFirebase]
  );

  // -----------------------------
  // Registro
  // -----------------------------
  const register = useCallback(
    async (name: string, email: string, password: string): Promise<User> => {
      try {
        setLoading(true);
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser)
          await updateProfile(auth.currentUser, { displayName: name });
        await syncUserWithFirebase(result.user);

        const newUser: User = {
          id: result.user.uid,
          name,
          email,
          preferences: { themeMode: "system" as const, notificationsEnabled: true },
          createdAt: new Date().toISOString(),
        };

        // ✅ Log analytics
        await logEvent({
          type: "user_registered",
          userId: newUser.id,
          metadata: { email: newUser.email },
        });

        return newUser;
      } catch (e: any) {
        console.error("Erro no registro:", e);
        let msg = "Falha ao criar conta.";
        if (e.code === "auth/email-already-in-use")
          msg = "E-mail já cadastrado.";
        setError(msg);
        Alert.alert("Erro", msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [syncUserWithFirebase]
  );

  // -----------------------------
  // Logout
  // -----------------------------
  const logout = useCallback(async () => {
    try {
      const id = user?.id;
      await signOut(auth);
      await persistUser(null);
      setUser(null);

      // ✅ Log analytics
      if (id) {
        await logEvent({ type: "user_logout", userId: id });
      }
    } catch (e) {
      console.error("Erro ao sair:", e);
      Alert.alert("Erro", "Não foi possível sair da conta.");
    }
  }, [persistUser, user]);

  // -----------------------------
  // Atualiza usuário e preferências
  // -----------------------------
  const updateUser = useCallback(
    async (data: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...data };
      setUser(updated);
      await persistUser(updated);

      // ✅ Log analytics
      await logEvent({
        type: "user_updated",
        userId: user.id,
        metadata: { updatedFields: Object.keys(data) },
      });
    },
    [user, persistUser]
  );

  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!user) return;
      const updated = {
        ...user,
        preferences: { ...user.preferences, ...prefs },
      };
      setUser(updated);
      await persistUser(updated);

      // ✅ Log analytics
      await logEvent({
        type: "preferences_updated",
        userId: user.id,
        metadata: prefs,
      });
    },
    [user, persistUser]
  );

  // -----------------------------
  // Refresh manual
  // -----------------------------
  const refreshUser = useCallback(async () => {
    const fbUser = auth.currentUser;
    await syncUserWithFirebase(fbUser);
  }, [syncUserWithFirebase]);

  // -----------------------------
  // Valor do contexto
  // -----------------------------
  const value = useMemo<UserContextData>(
    () => ({
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateUser,
      updatePreferences,
      isLoggedIn: !!user,
      refreshUser,
    }),
    [
      user,
      loading,
      error,
      login,
      register,
      logout,
      updateUser,
      updatePreferences,
      refreshUser,
    ]
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------
export function useUser(): UserContextData {
  const ctx = useContext(UserContext);
  if (!ctx)
    throw new Error("useUser deve ser usado dentro de UserProvider");
  return ctx;
}
