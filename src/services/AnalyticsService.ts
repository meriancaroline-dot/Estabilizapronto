// src/services/AnalyticsService.ts
import { db } from "@/services/firebaseConfig"; // ✅ caminho corrigido
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface AnalyticsEvent {
  type: string;      // exemplo: "habit_completed", "mission_completed"
  userId?: string;   // opcional: id do usuário autenticado
  metadata?: any;    // dados extras opcionais
  createdAt?: any;   // timestamp gerado automaticamente
}

/**
 * Registra um evento no Firestore.
 * Remove automaticamente qualquer campo undefined (ex: userId ausente).
 */
export async function logEvent(data: AnalyticsEvent) {
  try {
    const ref = collection(db, "analytics");

    // 🔧 Remove campos undefined pra evitar erro "Unsupported field value"
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    await addDoc(ref, {
      ...cleanData,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Evento registrado:", cleanData.type);
  } catch (err) {
    console.error("❌ Erro ao registrar evento:", err);
  }
}
