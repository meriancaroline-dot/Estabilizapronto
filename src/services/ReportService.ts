// -------------------------------------------------------------
// src/services/ReportService.ts
// -------------------------------------------------------------
// Geração de PDF editorial, técnico e neutro, com barras comparativas.
// Comparativo: diário (24h), semanal (7 dias), mensal (30 dias).
// Humor sempre em forma textual, não numérica.
// -------------------------------------------------------------

import * as Print from "expo-print";

export interface TimeframeSnapshot {
  label: string;              // "Últimas 24h", "Últimos 7 dias", "Últimos 30 dias"
  tasksCompleted: number;
  remindersCompleted: number;
  habitsActive: number;
  moodLabel: string;          // Ex: "humor estável", "humor positivo", etc.
}

export interface ConsolidatedReportPayload {
  generatedAt: string;        // ISO
  dateLabel: string;          // Ex: "14 de março de 2025, 10:32"
  sections: TimeframeSnapshot[];
}

// Helper: evita divisão por zero
function safeMax(values: number[]): number {
  const max = Math.max(...values);
  return max <= 0 ? 1 : max;
}

// Pequena interpretação automática a partir dos dados
function buildInterpretation(payload: ConsolidatedReportPayload) {
  const [daily, weekly, monthly] = payload.sections;

  const hasData =
    daily.tasksCompleted +
      weekly.tasksCompleted +
      monthly.tasksCompleted +
      daily.remindersCompleted +
      weekly.remindersCompleted +
      monthly.remindersCompleted >
    0;

  let performanceText = "Ainda não há dados suficientes para avaliar o desempenho.";
  let consistencyText = "A consistência em hábitos será construída ao longo do uso.";
  let moodText = "Sem registros suficientes de humor para uma análise clara.";

  if (hasData) {
    // Desempenho: compara tarefas concluídas
    if (monthly.tasksCompleted > weekly.tasksCompleted) {
      performanceText =
        "O volume de tarefas concluídas está levemente mais alto na visão mensal do que na semanal, sugerindo um crescimento gradual de produtividade.";
    } else if (monthly.tasksCompleted < weekly.tasksCompleted) {
      performanceText =
        "A quantidade de tarefas concluídas na última semana supera a visão mensal, indicando um esforço mais concentrado recentemente.";
    } else {
      performanceText =
        "O volume de tarefas concluídas se mantém equilibrado entre as janelas semanal e mensal.";
    }

    // Consistência: hábitos ativos
    if (monthly.habitsActive > 0 || weekly.habitsActive > 0) {
      if (weekly.habitsActive >= monthly.habitsActive) {
        consistencyText =
          "Os hábitos ativos na última semana estão em linha ou acima da visão mensal, sugerindo boa consistência recente.";
      } else {
        consistencyText =
          "Os hábitos ativos ao longo do mês superam levemente a visão semanal, o que pode indicar períodos de maior foco intercalados com pausas.";
      }
    }

    // Humor: usa o período mais longo como referência
    if (monthly.moodLabel) {
      moodText = `Na visão mensal, o ${monthly.moodLabel}.`;
    } else if (weekly.moodLabel) {
      moodText = `Na visão semanal, o ${weekly.moodLabel}.`;
    } else if (daily.moodLabel) {
      moodText = `Nas últimas 24h, o ${daily.moodLabel}.`;
    }
  }

  return { performanceText, consistencyText, moodText };
}

export async function generateConsolidatedReportPdf(
  payload: ConsolidatedReportPayload
): Promise<string> {
  const { sections, dateLabel } = payload;
  const [daily, weekly, monthly] = sections;

  const maxTasks = safeMax(sections.map((s) => s.tasksCompleted));
  const maxReminders = safeMax(sections.map((s) => s.remindersCompleted));
  const maxHabits = safeMax(sections.map((s) => s.habitsActive));

  const { performanceText, consistencyText, moodText } =
    buildInterpretation(payload);

  const toBarWidth = (value: number, max: number) =>
    `${Math.round((value / max) * 100)}%`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Relatório Consolidado de Bem-Estar</title>
  <style>
    @page {
      margin: 0;
      size: A4;
    }

    body {
      margin: 40px 46px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: #f4f5f7;
      color: #111827;
      line-height: 1.5;
      font-size: 12px;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 1px solid #d1d5db;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .brand-subtitle {
      font-size: 11px;
      color: #6b7280;
    }

    .meta {
      text-align: right;
      font-size: 11px;
      color: #4b5563;
    }

    .meta-label {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 10px;
      color: #9ca3af;
    }

    h2 {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-top: 22px;
      margin-bottom: 8px;
      color: #111827;
    }

    .section {
      background: #ffffff;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 14px;
      border: 1px solid #e5e7eb;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 8px;
    }

    .section-title {
      font-weight: 600;
      font-size: 12px;
    }

    .section-caption {
      font-size: 11px;
      color: #6b7280;
    }

    table.metrics {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }

    table.metrics th,
    table.metrics td {
      padding: 4px 4px;
      font-size: 11px;
      text-align: left;
    }

    table.metrics th {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 10px;
      color: #6b7280;
    }

    .metric-label {
      color: #374151;
      font-weight: 500;
      white-space: nowrap;
    }

    .metric-value {
      font-variant-numeric: tabular-nums;
      color: #111827;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 2px;
    }

    .bar-label {
      width: 90px;
      font-size: 10px;
      color: #6b7280;
      white-space: nowrap;
    }

    .bar-track {
      flex: 1;
      height: 6px;
      border-radius: 999px;
      background: #e5e7eb;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
    }

    .bar-fill.tasks {
      background: linear-gradient(90deg, #3b82f6, #2563eb);
    }

    .bar-fill.reminders {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .bar-fill.habits {
      background: linear-gradient(90deg, #6366f1, #4f46e5);
    }

    .bar-value {
      width: 30px;
      text-align: right;
      font-size: 10px;
      color: #374151;
      font-variant-numeric: tabular-nums;
    }

    .tf-label {
      font-size: 11px;
      font-weight: 500;
      color: #111827;
      margin-bottom: 2px;
    }

    .mood-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      border: 1px solid #e5e7eb;
      color: #4b5563;
      background: #f9fafb;
      margin-top: 4px;
    }

    .mood-dot {
      width: 6px;
      height: 6px;
      border-radius: 999px;
      margin-right: 4px;
    }

    .mood-dot.positivo {
      background: #22c55e;
    }
    .mood-dot.estavel {
      background: #fbbf24;
    }
    .mood-dot.baixo {
      background: #ef4444;
    }

    .interp-text {
      font-size: 11px;
      color: #374151;
      margin-top: 2px;
    }

    .interp-text strong {
      font-weight: 600;
    }

    footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e5e7eb;
      font-size: 10px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-title">Estabiliza</div>
      <div class="brand-subtitle">Relatório consolidado de bem-estar</div>
    </div>
    <div class="meta">
      <div class="meta-label">Gerado em</div>
      <div>${dateLabel}</div>
    </div>
  </header>

  <div class="section">
    <div class="section-header">
      <div class="section-title">Resumo geral</div>
      <div class="section-caption">Visão consolidada do período recente</div>
    </div>
    <table class="metrics">
      <thead>
        <tr>
          <th></th>
          <th>Últimas 24h</th>
          <th>Últimos 7 dias</th>
          <th>Últimos 30 dias</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="metric-label">Tarefas concluídas</td>
          <td class="metric-value">${daily.tasksCompleted}</td>
          <td class="metric-value">${weekly.tasksCompleted}</td>
          <td class="metric-value">${monthly.tasksCompleted}</td>
        </tr>
        <tr>
          <td class="metric-label">Lembretes concluídos</td>
          <td class="metric-value">${daily.remindersCompleted}</td>
          <td class="metric-value">${weekly.remindersCompleted}</td>
          <td class="metric-value">${monthly.remindersCompleted}</td>
        </tr>
        <tr>
          <td class="metric-label">Hábitos ativos</td>
          <td class="metric-value">${daily.habitsActive}</td>
          <td class="metric-value">${weekly.habitsActive}</td>
          <td class="metric-value">${monthly.habitsActive}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-title">Barras comparativas</div>
      <div class="section-caption">Distribuição relativa por janela de tempo</div>
    </div>

    <div class="tf-label">${daily.label}</div>
    <div class="bar-row">
      <div class="bar-label">Tarefas</div>
      <div class="bar-track">
        <div class="bar-fill tasks" style="width:${toBarWidth(
          daily.tasksCompleted,
          maxTasks
        )};"></div>
      </div>
      <div class="bar-value">${daily.tasksCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Lembretes</div>
      <div class="bar-track">
        <div class="bar-fill reminders" style="width:${toBarWidth(
          daily.remindersCompleted,
          maxReminders
        )};"></div>
      </div>
      <div class="bar-value">${daily.remindersCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Hábitos</div>
      <div class="bar-track">
        <div class="bar-fill habits" style="width:${toBarWidth(
          daily.habitsActive,
          maxHabits
        )};"></div>
      </div>
      <div class="bar-value">${daily.habitsActive}</div>
    </div>
    <div class="mood-tag">
      <span class="mood-dot ${
        daily.moodLabel.includes("positivo")
          ? "positivo"
          : daily.moodLabel.includes("estável")
          ? "estavel"
          : "baixo"
      }"></span>
      ${daily.moodLabel || "sem dados de humor registrados"}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-title">Semanal</div>
      <div class="section-caption">Acúmulo dos últimos 7 dias</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Tarefas</div>
      <div class="bar-track">
        <div class="bar-fill tasks" style="width:${toBarWidth(
          weekly.tasksCompleted,
          maxTasks
        )};"></div>
      </div>
      <div class="bar-value">${weekly.tasksCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Lembretes</div>
      <div class="bar-track">
        <div class="bar-fill reminders" style="width:${toBarWidth(
          weekly.remindersCompleted,
          maxReminders
        )};"></div>
      </div>
      <div class="bar-value">${weekly.remindersCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Hábitos</div>
      <div class="bar-track">
        <div class="bar-fill habits" style="width:${toBarWidth(
          weekly.habitsActive,
          maxHabits
        )};"></div>
      </div>
      <div class="bar-value">${weekly.habitsActive}</div>
    </div>
    <div class="mood-tag">
      <span class="mood-dot ${
        weekly.moodLabel.includes("positivo")
          ? "positivo"
          : weekly.moodLabel.includes("estável")
          ? "estavel"
          : "baixo"
      }"></span>
      ${weekly.moodLabel || "sem dados de humor registrados"}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-title">Mensal</div>
      <div class="section-caption">Acúmulo dos últimos 30 dias</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Tarefas</div>
      <div class="bar-track">
        <div class="bar-fill tasks" style="width:${toBarWidth(
          monthly.tasksCompleted,
          maxTasks
        )};"></div>
      </div>
      <div class="bar-value">${monthly.tasksCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Lembretes</div>
      <div class="bar-track">
        <div class="bar-fill reminders" style="width:${toBarWidth(
          monthly.remindersCompleted,
          maxReminders
        )};"></div>
      </div>
      <div class="bar-value">${monthly.remindersCompleted}</div>
    </div>
    <div class="bar-row">
      <div class="bar-label">Hábitos</div>
      <div class="bar-track">
        <div class="bar-fill habits" style="width:${toBarWidth(
          monthly.habitsActive,
          maxHabits
        )};"></div>
      </div>
      <div class="bar-value">${monthly.habitsActive}</div>
    </div>
    <div class="mood-tag">
      <span class="mood-dot ${
        monthly.moodLabel.includes("positivo")
          ? "positivo"
          : monthly.moodLabel.includes("estável")
          ? "estavel"
          : "baixo"
      }"></span>
      ${monthly.moodLabel || "sem dados de humor registrados"}
    </div>
  </div>

  <div class="section">
    <div class="section-header">
      <div class="section-title">Leitura técnica</div>
      <div class="section-caption">Interpretação neutra dos dados</div>
    </div>
    <p class="interp-text"><strong>Desempenho:</strong> ${performanceText}</p>
    <p class="interp-text"><strong>Consistência:</strong> ${consistencyText}</p>
    <p class="interp-text"><strong>Humor:</strong> ${moodText}</p>
  </div>

  <footer>
    Relatório gerado automaticamente pelo aplicativo Estabiliza. Este documento não substitui avaliação clínica profissional.
  </footer>
</body>
</html>
`;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}
