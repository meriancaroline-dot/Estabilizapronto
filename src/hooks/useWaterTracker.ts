import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_INTAKE = "@water:intake";
const STORAGE_GOAL = "@water:goal";

export function useWaterTracker() {
  const [intake, setIntake] = useState(0);
  const [goal, setGoalState] = useState(2000); // padrão = 2000ml

  // carregar dados salvos
  useEffect(() => {
    (async () => {
      const savedIntake = await AsyncStorage.getItem(STORAGE_INTAKE);
      const savedGoal = await AsyncStorage.getItem(STORAGE_GOAL);

      if (savedIntake) setIntake(parseInt(savedIntake));
      if (savedGoal) setGoalState(parseInt(savedGoal));
    })();
  }, []);

  // salvar ingestão
  const saveIntake = async (value: number) => {
    setIntake(value);
    await AsyncStorage.setItem(STORAGE_INTAKE, value.toString());
  };

  // salvar meta
  const saveGoal = async (value: number) => {
    const clean = Math.max(200, value); // meta mínima
    setGoalState(clean);
    await AsyncStorage.setItem(STORAGE_GOAL, clean.toString());
  };

  // porcentagem calculada
  const percent = Math.min(100, Math.round((intake / goal) * 100));

  return {
    intake,
    goal,
    percent,

    // ações
    addWater: (ml: number) => saveIntake(intake + ml),

    removeWater: (ml: number) =>
      saveIntake(Math.max(0, intake - ml)),

    resetToday: () => saveIntake(0),

    setGoal: saveGoal, // ← AGORA FUNCIONA COM A TELA NOVA
  };
}
