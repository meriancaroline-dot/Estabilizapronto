import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_INTAKE = "@water:intake";
const STORAGE_GOAL = "@water:goal";
const STORAGE_DATE = "@water:date";
const STORAGE_HISTORY = "@water:history"; // histórico de 7 dias

type WaterHistory = {
  date: string;   // formato YYYY-MM-DD
  amount: number; // ml consumidos no dia
};

export function useWaterTracker() {
  const [intake, setIntake] = useState(0);
  const [goal, setGoalState] = useState(2000);
  const [history, setHistory] = useState<WaterHistory[]>([]);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    (async () => {
      const savedDate = await AsyncStorage.getItem(STORAGE_DATE);
      const savedIntake = await AsyncStorage.getItem(STORAGE_INTAKE);
      const savedGoal = await AsyncStorage.getItem(STORAGE_GOAL);
      const savedHistory = await AsyncStorage.getItem(STORAGE_HISTORY);

      if (savedGoal) setGoalState(parseInt(savedGoal));
      if (savedHistory) setHistory(JSON.parse(savedHistory));

      // Se a data for a mesma, recupera intake.
      // Senão, inicia dia zerado e registra histórico.
      if (savedDate === today && savedIntake) {
        setIntake(parseInt(savedIntake));
      } else {
        await startNewDay();
      }
    })();
  }, []);

  // inicia novo dia, salva histórico anterior
  const startNewDay = async () => {
    const previousIntake = await AsyncStorage.getItem(STORAGE_INTAKE);
    const savedDate = await AsyncStorage.getItem(STORAGE_DATE);

    if (previousIntake && savedDate) {
      const amount = parseInt(previousIntake);
      if (amount > 0) {
        const newHistory: WaterHistory[] = [
          ...history.filter((h) => h.date !== savedDate),
          { date: savedDate, amount },
        ].slice(-7); // mantém só últimos 7 dias

        setHistory(newHistory);
        await AsyncStorage.setItem(STORAGE_HISTORY, JSON.stringify(newHistory));
      }
    }

    // Novo dia
    setIntake(0);
    await AsyncStorage.setItem(STORAGE_INTAKE, "0");
    await AsyncStorage.setItem(STORAGE_DATE, today);
  };

  // salva ingestão atual
  const saveIntake = async (value: number) => {
    setIntake(value);
    await AsyncStorage.setItem(STORAGE_INTAKE, value.toString());
    await AsyncStorage.setItem(STORAGE_DATE, today);
  };

  // salvar meta
  const saveGoal = async (value: number) => {
    const clean = Math.max(200, value); // meta mínima
    setGoalState(clean);
    await AsyncStorage.setItem(STORAGE_GOAL, clean.toString());
  };

  const addWater = (ml: number) => saveIntake(intake + ml);
  const removeWater = (ml: number) => saveIntake(Math.max(0, intake - ml));
  const resetToday = () => saveIntake(0);

  // porcentagem real (pode passar de 100 sem travar gráfico)
  const percent = Math.round((intake / goal) * 100);

  return {
    intake,
    goal,
    percent,
    history,        // histórico disponível para gráfico
    addWater,
    removeWater,
    resetToday,
    setGoal: saveGoal,
  };
}
