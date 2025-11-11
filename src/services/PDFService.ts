// src/services/PDFService.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Theme } from "@/hooks/useTheme";

export type ReportData = {
  mood: {
    average: number;
    goodDays: number;
    badDays: number;
    streak: number;
  };
  habits: {
    total: number;
    completed: number;
    consistency: number;
    bestHabit: string;
  };
  reminders: {
    total: number;
    done: number;
    pending: number;
  };
  summary: {
    performance: string;
    consistency: string;
    mood: string;
  };
};

export type ReportOptions = {
  stats: ReportData;
  periodLabel?: string;
  username?: string;
  theme?: Theme;
};

export async function generatePDFReport(options: ReportOptions): Promise<string> {
  const {
    stats,
    periodLabel = "Relatório Semanal",
    username = "Usuário",
    theme,
  } = options;

  const colors = theme?.colors || {
    primary: "#6C5CE7",
    secondary: "#00BCD4",
    success: "#10b981",
    text: "#1f2937",
    textSecondary: "#6b7280",
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      margin: 0;
      size: A4;
    }

    body {
      font-family: -apple-system, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #1a202c;
      background: white;
      font-size: 14px;
      line-height: 1.6;
    }

    .page {
      padding: 48px 56px;
      max-width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
    }

    /* HEADER */
    .header {
      text-align: center;
      padding-bottom: 32px;
      border-bottom: 3px solid ${colors.primary};
      margin-bottom: 40px;
    }

    .logo-container {
      margin-bottom: 16px;
    }

    .logo {
      width: 72px;
      height: 72px;
      margin: 0 auto;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(108, 92, 231, 0.25);
    }

    .logo svg {
      width: 40px;
      height: 40px;
    }

    .app-name {
      font-size: 32px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }

    .app-tagline {
      font-size: 14px;
      color: #718096;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }

    .report-title {
      font-size: 24px;
      font-weight: 700;
      color: ${colors.primary};
      margin: 24px 0 8px;
    }

    .report-subtitle {
      font-size: 14px;
      color: #718096;
    }

    .meta-info {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .meta-label {
      font-size: 11px;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 13px;
      color: #2d3748;
      font-weight: 600;
    }

    /* SECTIONS */
    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      flex-shrink: 0;
    }

    /* CARDS GRID */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-radius: 12px;
      padding: 20px 16px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    .stat-label {
      font-size: 11px;
      color: #718096;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: ${colors.primary};
      line-height: 1;
      margin-bottom: 4px;
    }

    .stat-unit {
      font-size: 12px;
      color: #a0aec0;
      font-weight: 500;
    }

    /* TABLE */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 16px;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .data-table thead {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
    }

    .data-table th {
      text-align: left;
      padding: 16px;
      font-size: 12px;
      font-weight: 700;
      color: #4a5568;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }

    .data-table td {
      padding: 16px;
      font-size: 14px;
      color: #2d3748;
      border-bottom: 1px solid #f7fafc;
    }

    .data-table tbody tr:last-child td {
      border-bottom: none;
    }

    .data-table tbody tr:hover {
      background: #f7fafc;
    }

    .data-table .highlight {
      font-weight: 700;
      color: ${colors.primary};
      font-size: 16px;
    }

    /* INSIGHT BOX */
    .insight-box {
      background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
      border-left: 4px solid ${colors.primary};
      border-radius: 8px;
      padding: 20px 24px;
      margin-top: 20px;
    }

    .insight-title {
      font-size: 13px;
      font-weight: 700;
      color: #6b46c1;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .insight-text {
      font-size: 14px;
      color: #4a5568;
      line-height: 1.7;
    }

    /* PROGRESS BAR */
    .progress-container {
      margin-top: 12px;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #718096;
      margin-bottom: 6px;
    }

    .progress-bar {
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    /* FOOTER */
    .footer {
      margin-top: 60px;
      padding-top: 24px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
    }

    .footer-text {
      font-size: 11px;
      color: #a0aec0;
      line-height: 1.6;
    }

    .footer-brand {
      font-weight: 700;
      color: ${colors.primary};
    }

    /* BADGE */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-success {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    /* WATERMARK */
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(108, 92, 231, 0.03);
      letter-spacing: 20px;
      z-index: -1;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="watermark">ESTABILIZA</div>
  
  <div class="page">
    <!-- HEADER -->
    <div class="header">
      <div class="logo-container">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      
      <div class="app-name">ESTABILIZA</div>
      <div class="app-tagline">Centro de Bem-Estar Digital</div>
      
      <div class="report-title">${periodLabel}</div>
      <div class="report-subtitle">Relatório de Progresso Pessoal</div>
      
      <div class="meta-info">
        <div class="meta-item">
          <div class="meta-label">Paciente</div>
          <div class="meta-value">${username}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Data</div>
          <div class="meta-value">${dateStr}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Período</div>
          <div class="meta-value">${periodLabel}</div>
        </div>
      </div>
    </div>

    <!-- SEÇÃO 1: HUMOR -->
    <div class="section">
      <div class="section-title">
        <div class="section-icon">😊</div>
        Análise de Humor
      </div>
      
      <div class="cards-grid">
        <div class="stat-card">
          <div class="stat-label">Média</div>
          <div class="stat-value">${stats.mood.average.toFixed(1)}</div>
          <div class="stat-unit">de 5.0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Dias Bons</div>
          <div class="stat-value">${stats.mood.goodDays}</div>
          <div class="stat-unit">dias</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Dias Ruins</div>
          <div class="stat-value">${stats.mood.badDays}</div>
          <div class="stat-unit">dias</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Sequência</div>
          <div class="stat-value">${stats.mood.streak}</div>
          <div class="stat-unit">dias</div>
        </div>
      </div>

      <div class="insight-box">
        <div class="insight-title">💡 Análise</div>
        <div class="insight-text">
          Sua média de humor está em ${stats.mood.average.toFixed(1)}/5.0, 
          ${stats.mood.average >= 4 ? 'indicando excelente estabilidade emocional' : 
            stats.mood.average >= 3 ? 'mostrando um estado emocional equilibrado' : 
            'sugerindo atenção ao bem-estar emocional'}. 
          Você mantém uma sequência de ${stats.mood.streak} dias, demonstrando 
          ${stats.mood.streak >= 5 ? 'consistência admirável' : 'progresso contínuo'}.
        </div>
      </div>
    </div>

    <!-- SEÇÃO 2: HÁBITOS -->
    <div class="section">
      <div class="section-title">
        <div class="section-icon">✓</div>
        Gestão de Hábitos
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hábitos Monitorados</td>
            <td class="highlight">${stats.habits.total}</td>
            <td><span class="badge badge-info">Ativo</span></td>
          </tr>
          <tr>
            <td>Hábitos Completados</td>
            <td class="highlight">${stats.habits.completed}</td>
            <td>
              <span class="badge ${stats.habits.completed >= stats.habits.total * 0.8 ? 'badge-success' : 'badge-info'}">
                ${stats.habits.completed >= stats.habits.total * 0.8 ? 'Excelente' : 'Bom'}
              </span>
            </td>
          </tr>
          <tr>
            <td>Taxa de Consistência</td>
            <td class="highlight">${stats.habits.consistency}%</td>
            <td>
              <span class="badge ${stats.habits.consistency >= 80 ? 'badge-success' : stats.habits.consistency >= 60 ? 'badge-info' : 'badge-warning'}">
                ${stats.habits.consistency >= 80 ? 'Ótimo' : stats.habits.consistency >= 60 ? 'Bom' : 'Regular'}
              </span>
            </td>
          </tr>
          <tr>
            <td>Hábito Destaque</td>
            <td class="highlight">${stats.habits.bestHabit}</td>
            <td><span class="badge badge-success">⭐ Top</span></td>
          </tr>
        </tbody>
      </table>

      <div class="progress-container">
        <div class="progress-label">
          <span>Progresso Geral</span>
          <span><strong>${stats.habits.consistency}%</strong></span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${stats.habits.consistency}%"></div>
        </div>
      </div>
    </div>

    <!-- SEÇÃO 3: LEMBRETES -->
    <div class="section">
      <div class="section-title">
        <div class="section-icon">🔔</div>
        Lembretes e Tarefas
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Quantidade</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total de Lembretes</td>
            <td class="highlight">${stats.reminders.total}</td>
            <td>100%</td>
          </tr>
          <tr>
            <td>Concluídos</td>
            <td class="highlight">${stats.reminders.done}</td>
            <td>${((stats.reminders.done / stats.reminders.total) * 100).toFixed(0)}%</td>
          </tr>
          <tr>
            <td>Pendentes</td>
            <td class="highlight">${stats.reminders.pending}</td>
            <td>${((stats.reminders.pending / stats.reminders.total) * 100).toFixed(0)}%</td>
          </tr>
        </tbody>
      </table>

      <div class="progress-container">
        <div class="progress-label">
          <span>Taxa de Conclusão</span>
          <span><strong>${((stats.reminders.done / stats.reminders.total) * 100).toFixed(0)}%</strong></span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(stats.reminders.done / stats.reminders.total) * 100}%"></div>
        </div>
      </div>
    </div>

    <!-- SEÇÃO 4: RESUMO -->
    <div class="section">
      <div class="section-title">
        <div class="section-icon">📊</div>
        Resumo Geral
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Dimensão</th>
            <th>Avaliação</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Desempenho</td>
            <td class="highlight">${stats.summary.performance}</td>
          </tr>
          <tr>
            <td>Consistência</td>
            <td class="highlight">${stats.summary.consistency}</td>
          </tr>
          <tr>
            <td>Estado de Humor</td>
            <td class="highlight">${stats.summary.mood}</td>
          </tr>
        </tbody>
      </table>

      <div class="insight-box">
        <div class="insight-title">🎯 Conclusão</div>
        <div class="insight-text">
          Com base na análise do período, você demonstra 
          ${stats.habits.consistency >= 70 ? 'um desempenho sólido e consistente' : 'oportunidades valiosas de crescimento'}. 
          Continue ${stats.mood.average >= 4 ? 'mantendo esse excelente ritmo' : 'trabalhando em seus objetivos'} 
          para alcançar resultados ainda melhores.
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-text">
        Relatório gerado automaticamente pelo <span class="footer-brand">Estabiliza</span><br>
        ${dateStr} • Documento confidencial<br>
        © ${now.getFullYear()} Estabiliza - Todos os direitos reservados
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
}

export async function sharePDF(uri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error("Compartilhamento não disponível neste dispositivo.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Compartilhar relatório Estabiliza",
  });
}