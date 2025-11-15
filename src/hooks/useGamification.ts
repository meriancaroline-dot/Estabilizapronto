// -------------------------------------------------------------
// src/hooks/useGamification.ts (versão corrigida – opção B)
// -------------------------------------------------------------
import { useEffect, useState, useCallback } from "react";
import { gamification } from "@/gamification/GamificationEngine";

export function useGamification() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1); // level básico sem getLevel
  const [stats, setStats] = useState(gamification.stats);

  // Inicializa quando o app abre
  useEffect(() => {
    (async () => {
      await gamification.init();
      setXP(gamification.xp);
      
      // ❗ Removido: gamification.getLevel()
      setLevel(1); 

      setStats({ ...gamification.stats });
    })();
  }, []);

  // Adicionar XP
  const addXP = useCallback(async (amount: number) => {
    await gamification.addXP(amount);
    setXP(gamification.xp);

    // ❗ Removido: gamification.getLevel()
    setLevel(1);
  }, []);

  // Registrar evento (humor, hábito, nota…)
  const registerEvent = useCallback(async (type: any) => {
    await gamification.registerEvent(type);
    setStats({ ...gamification.stats });
  }, []);

  return {
    xp,
    level,   // 1 fixo por enquanto
    stats,
    addXP,
    registerEvent,
  };
}
