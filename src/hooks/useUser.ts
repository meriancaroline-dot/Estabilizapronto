// -------------------------------------------------------------
// src/hooks/useUser.ts
// -------------------------------------------------------------
// 🔐 Integra UserContext + AsyncStorage (patch + persistência)
// -------------------------------------------------------------
import { useCallback, useEffect } from "react";
import { useUser as useUserContext } from "@/contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserPreferences } from "@/types/models";

const STORAGE_KEY = "@estabiliza:user";

export function useUser() {
  const { user, updateUser, logout, refreshUser, isLoggedIn } =
    useUserContext();

  const patchUser = useCallback(
    async (data: Partial<User>) => {
      try {
        const safePreferences: UserPreferences = {
          themeMode:
            data.preferences?.themeMode ??
            user?.preferences?.themeMode ??
            "system",
          notificationsEnabled:
            data.preferences?.notificationsEnabled ??
            user?.preferences?.notificationsEnabled ??
            true,
          dailyReminderTime:
            data.preferences?.dailyReminderTime ??
            user?.preferences?.dailyReminderTime ??
            undefined,
        };

        const newUser: User = {
          id: user?.id ?? Date.now().toString(),
          name: data.name ?? user?.name ?? "",
          email: data.email ?? user?.email ?? "",
          avatar: data.avatar ?? user?.avatar ?? "",
          preferences: safePreferences,
          createdAt: user?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),

          // 🔥 novos campos de perfil
          gender: data.gender ?? user?.gender,
          emergencyContactName:
            data.emergencyContactName ?? user?.emergencyContactName,
          emergencyContactPhone:
            data.emergencyContactPhone ?? user?.emergencyContactPhone,
          emergencyContactRelation:
            data.emergencyContactRelation ?? user?.emergencyContactRelation,
        };

        await updateUser(newUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
        console.log("✅ Usuário salvo:", newUser.name || "(sem nome)");
      } catch (e) {
        console.error("Erro ao atualizar usuário:", e);
      }
    },
    [user, updateUser]
  );

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: User = JSON.parse(stored);
          await updateUser(parsed);
          console.log("👤 Usuário carregado do armazenamento:", parsed.name);
        }
      } catch (e) {
        console.error("Erro ao carregar usuário salvo:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearUser = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await logout();
      console.log("🚪 Sessão encerrada e dados locais removidos.");
    } catch (e) {
      console.error("Erro ao limpar dados do usuário:", e);
    }
  }, [logout]);

  return {
    user,
    isLoggedIn,
    patchUser,
    clearUser,
    refreshUser,
  };
}
