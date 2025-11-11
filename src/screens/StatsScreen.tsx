// src/screens/StatsScreen.tsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { useStats } from "@/hooks/useStats";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const { width } = Dimensions.get("window");
const CARD_RADIUS = 20;

// Helpers locais
type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  bgColor: string;
};

type RateRowProps = {
  label: string;
  value: number;
  color: string;
  textColor: string;
};

type SummaryItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  bgColor: string;
  textColor: string;
};

function moodScoreToName(score: number): string {
  if (score >= 4.5) return "muito leve e positivo";
  if (score >= 3.8) return "positivo";
  if (score >= 3.0) return "equilibrado";
  if (score >= 2.2) return "sensível";
  if (score > 0) return "mais fragilizado";
  return "indefinido";
}

function climateLabelPt(key: string): string {
  switch (key) {
    case "ensolarado":
      return "dias ensolarados";
    case "nublado":
      return "dias nublados";
    case "chuvoso":
      return "dias chuvosos";
    case "frio":
      return "dias frios";
    case "quente":
      return "dias quentes";
    default:
      return key;
  }
}

function seasonLabelPt(key: string): string {
  switch (key) {
    case "verão":
      return "verão";
    case "outono":
      return "outono";
    case "inverno":
      return "inverno";
    case "primavera":
      return "primavera";
    default:
      return key;
  }
}

function formatDateShort(iso?: string | null) {
  if (!iso) return "Desconhecida";
  try {
    const [y, m, d] = iso.split("T")[0].split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return iso;
  }
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;

  const {
    stats,
    completionRates,
    summary,
    statsDaily,
    statsWeekly,
    statsMonthly,
    climateInsights,
    seasonInsights,
    activityLevels,
  } = useStats();

  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  // -----------------------------------------------------------
  // PDF — relatório delicado e analítico
  // -----------------------------------------------------------
  const handleExportPDF = async () => {
    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const moodAvg = stats?.moodAverage ?? 0;
      const moodNome = moodScoreToName(moodAvg);

      // Atividade diária/semanal/mensal (já normalizada em useStats)
      const dailyPct = activityLevels.relative.daily;
      const weeklyPct = activityLevels.relative.weekly;
      const monthlyPct = activityLevels.relative.monthly;

      // Qual período está com maior ritmo de atividade
      const dominantActivity = (() => {
        const { daily, weekly, monthly } = activityLevels.raw;
        if (daily >= weekly && daily >= monthly) return "diário";
        if (weekly >= daily && weekly >= monthly) return "semanal";
        return "mensal";
      })();

      // Texto de clima
      let climaTexto = "";
      if (!climateInsights || climateInsights.climates.length === 0) {
        climaTexto =
          "Você ainda não registrou o clima com frequência suficiente para uma leitura detalhada. Conforme você for associando seu humor ao clima, o Estabiliza vai te mostrando como esses contextos se cruzam.";
      } else {
        const principais = climateInsights.climates.slice(0, 2);
        const partes: string[] = [];

        const primeira = principais[0];
        const label1 = climateLabelPt(primeira.key);
        const humor1 = moodScoreToName(primeira.avgMood);
        partes.push(
          `A maior parte dos seus registros aconteceu em ${label1}, onde o seu humor tende a se aproximar de um estado mais ${humor1}.`
        );

        if (principais[1]) {
          const segunda = principais[1];
          const label2 = climateLabelPt(segunda.key);
          const humor2 = moodScoreToName(segunda.avgMood);
          partes.push(
            `Logo em seguida aparecem os ${label2}, que costumam trazer para você um tom emocional mais ${humor2}.`
          );
        }

        partes.push(
          "Essas relações não definem você, mas ajudam a entender em quais cenários o seu dia costuma ficar mais leve ou mais sensível."
        );

        climaTexto = partes.join(" ");
      }

      // Texto de estação
      let estacaoTexto = "";
      if (!seasonInsights || seasonInsights.seasons.length === 0) {
        estacaoTexto =
          "Ainda não há registros suficientes distribuídos ao longo das estações para uma leitura sazonal mais profunda.";
      } else {
        const principal = seasonInsights.seasons[0];
        const label = seasonLabelPt(principal.key);
        const humorEstacao = moodScoreToName(principal.avgMood);

        estacaoTexto = `No recorte atual, a estação que mais aparece nos seus registros é o ${label}. Nela, o seu humor médio tende a ser percebido como ${humorEstacao}. Isso não significa que a estação determina como você se sente, mas indica um pano de fundo que influencia o tom dos seus dias.`;
      }

      // Texto sobre ritmo de atividade
      let ritmoTexto = "";
      if (!statsDaily && !statsWeekly && !statsMonthly) {
        ritmoTexto =
          "Ainda não há dados suficientes para comparar o ritmo diário, semanal e mensal das suas ações.";
      } else {
        if (dominantActivity === "diário") {
          ritmoTexto =
            "O ritmo das suas ações está mais concentrado no dia a dia. Isso indica uma presença forte nas pequenas decisões e tarefas cotidianas, mesmo que elas sejam simples.";
        } else if (dominantActivity === "semanal") {
          ritmoTexto =
            "O seu movimento aparece com mais força ao longo da semana. Isso sugere que, ao olhar o conjunto dos dias, você consegue manter um fluxo de ação mesmo quando algum dia individual é mais leve ou mais pesado.";
        } else {
          ritmoTexto =
            "O retrato mensal mostra um ritmo mais forte em períodos longos. Mesmo que alguns dias pareçam mais instáveis, no conjunto você vai conseguindo retomar o eixo e acumular avanços.";
        }
      }

      // Cores do tema aplicadas no PDF
      const primary = colors.primary || "#4C6FFF";
      const accent = colors.secondary || "#7C3AED";
      const textColor = "#1F2933";
      const softBg = "#F9FAFB";
      const borderSoft = "#E5E7EB";

      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <style>
    @page {
      margin: 0;
      size: A4;
    }

    body {
      margin: 40px 42px;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text",
        system-ui, -system-ui, sans-serif;
      background: #FFFFFF;
      color: ${textColor};
      line-height: 1.6;
      font-size: 12px;
    }

    h1, h2, h3 {
      margin: 0;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid ${borderSoft};
      padding-bottom: 10px;
      margin-bottom: 22px;
    }

    .brand {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .brand-title {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: ${primary};
    }

    .brand-subtitle {
      font-size: 11px;
      color: #6B7280;
    }

    .header-meta {
      text-align: right;
      font-size: 11px;
      color: #6B7280;
    }

    .header-meta-title {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 600;
      margin-bottom: 4px;
      color: #374151;
    }

    .section {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-weight: 600;
      color: #4B5563;
      margin-bottom: 8px;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid ${borderSoft};
      padding: 3px 10px;
      font-size: 10px;
      color: #6B7280;
      gap: 6px;
    }

    .pill-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: ${primary};
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .card {
      border-radius: 12px;
      border: 1px solid ${borderSoft};
      background: ${softBg};
      padding: 10px 12px;
    }

    .card-title {
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #374151;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2px;
    }

    .metric-label {
      font-size: 11px;
      color: #6B7280;
    }

    .metric-value {
      font-size: 13px;
      font-weight: 600;
      color: #111827;
    }

    .metric-small {
      font-size: 10px;
      color: #6B7280;
    }

    .paragraph {
      font-size: 11px;
      color: #374151;
    }

    .muted {
      color: #6B7280;
    }

    .bar-group {
      margin-top: 6px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .bar-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      color: #4B5563;
    }

    .bar-label {
      width: 52px;
      text-align: right;
    }

    .bar-track {
      flex: 1;
      height: 7px;
      border-radius: 999px;
      background: #E5E7EB;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, ${primary}, ${accent});
    }

    .bar-value {
      width: 40px;
      text-align: left;
      font-weight: 600;
      color: #374151;
    }

    .chip-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .chip {
      border-radius: 999px;
      border: 1px solid ${borderSoft};
      padding: 2px 8px;
      font-size: 10px;
      color: #4B5563;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .chip-emoji {
      font-size: 11px;
    }

    footer {
      margin-top: 22px;
      padding-top: 8px;
      border-top: 1px solid ${borderSoft};
      font-size: 10px;
      color: #9CA3AF;
      text-align: center;
    }

    .page-break {
      page-break-before: always;
      margin-top: 24px;
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-title">Estabiliza</div>
      <div class="brand-subtitle">
        Relatório interpretativo de humor e hábitos
      </div>
    </div>
    <div class="header-meta">
      <div class="header-meta-title">Relatório de acompanhamento</div>
      <div>${dateStr}</div>
      <div>${timeStr}</div>
    </div>
  </header>

  <!-- Seção 1: Visão geral -->
  <section class="section">
    <div class="section-title">Visão geral do período</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-title">Movimento e organização</div>
        <div class="metric-row">
          <span class="metric-label">Lembretes criados</span>
          <span class="metric-value">${stats?.totalReminders ?? 0}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Lembretes concluídos</span>
          <span class="metric-value">${stats?.completedReminders ?? 0}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Tarefas concluídas</span>
          <span class="metric-value">${stats?.completedTasks ?? 0}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Hábitos ativos</span>
          <span class="metric-value">${stats?.activeHabits ?? 0}</span>
        </div>
        <div class="metric-row">
          <span class="metric-label">Maior sequência</span>
          <span class="metric-value">${stats?.streakLongest ?? 0} dias</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Tom emocional predominante</div>
        <p class="paragraph">
          Ao longo deste período, o seu humor médio foi interpretado como
          <strong>${moodNome}</strong>. Isso significa que, mesmo com oscilações naturais,
          há um fio condutor emocional que vai se repetindo entre os dias.
        </p>
        <p class="paragraph muted" style="margin-top: 6px;">
          Esta leitura não é um rótulo, mas um ponto de apoio para entender em que
          direção o seu cotidiano emocional vem caminhando.
        </p>
      </div>
    </div>
  </section>

  <!-- Seção 2: Ritmo diário, semanal e mensal -->
  <section class="section">
    <div class="section-title">Ritmo diário, semanal e mensal</div>
    <div class="card">
      <div class="metric-row" style="margin-bottom: 4px;">
        <span class="metric-label">
          Abaixo você vê, em forma de barras, o quanto o seu movimento aparece
          no dia a dia, ao longo da semana e no recorte mensal.
        </span>
      </div>
      <div class="bar-group">
        <div class="bar-row">
          <span class="bar-label">Diário</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${dailyPct}%;"></div>
          </div>
          <span class="bar-value">${dailyPct}%</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Semanal</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${weeklyPct}%;"></div>
          </div>
          <span class="bar-value">${weeklyPct}%</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">Mensal</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${monthlyPct}%;"></div>
          </div>
          <span class="bar-value">${monthlyPct}%</span>
        </div>
      </div>

      <p class="paragraph" style="margin-top: 8px;">
        ${ritmoTexto}
      </p>
    </div>
  </section>

  <!-- Quebra de página para a parte de clima -->
  <div class="page-break"></div>

  <!-- Seção 3: Clima e humor -->
  <section class="section">
    <div class="section-title">Clima e o tom dos seus dias</div>
    <div class="card">
      <div class="metric-row">
        <span class="metric-label">
          Aqui o foco não é o “tempo lá fora”, mas como você se sente por dentro
          em diferentes tipos de dia.
        </span>
      </div>

      <div class="chip-row">
        <div class="chip">
          <span class="chip-emoji">☀️</span>
          <span>Ensolarado</span>
        </div>
        <div class="chip">
          <span class="chip-emoji">☁️</span>
          <span>Nublado</span>
        </div>
        <div class="chip">
          <span class="chip-emoji">🌧️</span>
          <span>Chuvoso</span>
        </div>
        <div class="chip">
          <span class="chip-emoji">❄️</span>
          <span>Frio</span>
        </div>
        <div class="chip">
          <span class="chip-emoji">🔥</span>
          <span>Quente</span>
        </div>
      </div>

      <p class="paragraph" style="margin-top: 8px;">
        ${climaTexto}
      </p>
    </div>
  </section>

  <!-- Seção 4: Estação do ano -->
  <section class="section">
    <div class="section-title">Estação do ano como pano de fundo</div>
    <div class="card">
      <p class="paragraph">
        Cada estação traz um contexto diferente para o corpo e para a mente:
        variação de luz, temperatura, rotina e expectativas. 
      </p>
      <p class="paragraph" style="margin-top: 6px;">
        ${estacaoTexto}
      </p>
      <p class="paragraph muted" style="margin-top: 6px;">
        A ideia não é encaixar você em um padrão, mas oferecer um espelho mais
        cuidadoso, onde clima, estação e humor possam ser observados juntos.
      </p>
    </div>
  </section>

  <!-- Seção 5: Resumo integrativo -->
  <section class="section">
    <div class="section-title">Resumo integrado</div>
    <div class="card">
      <p class="paragraph">
        <strong>Desempenho:</strong> ${summary.performance}
      </p>
      <p class="paragraph">
        <strong>Consistência:</strong> ${summary.consistency}
      </p>
      <p class="paragraph">
        <strong>Humor:</strong> ${summary.mood}
      </p>
      <p class="paragraph muted" style="margin-top: 6px;">
        Estes dados não falam sobre valor pessoal, mas sobre ritmo, contexto e
        movimento. Você pode usar este relatório como um mapa de observação:
        reler em outro momento, comparar períodos e perceber, aos poucos, o que
        te faz bem, o que te sobrecarrega e o que te ajuda a se estabilizar.
      </p>
    </div>
  </section>

  <footer>
    Relatório gerado pelo aplicativo Estabiliza — ${dateStr} • ${timeStr}
  </footer>
</body>
</html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar relatório de humor e hábitos",
        });
        Alert.alert("✅ Sucesso", "Relatório exportado com sucesso.");
      } else {
        Alert.alert("Sucesso", `PDF salvo em: ${uri}`);
      }
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      Alert.alert("Erro", "Falha ao exportar o relatório.");
    }
  };

  // -----------------------------------------------------------
  // UI principal (a parte visual do app, que você já tinha)
  // -----------------------------------------------------------
  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <Animated.View style={[styles.container, { opacity: fade }]}>
        <LinearGradient
          colors={[colors.background, colors.surface]}
          style={StyleSheet.absoluteFill}
        />

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Estatísticas gerais
            </Text>
            <Text style={[styles.sub, { color: colors.textSecondary }]}>
              Um retrato leve do seu progresso e do tom dos seus dias
            </Text>
          </View>

          {/* Cards principais */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="notifications-outline"
              label="Lembretes"
              value={stats?.totalReminders ?? 0}
              color={colors.primary}
              bgColor={colors.surface}
            />
            <StatCard
              icon="checkmark-circle-outline"
              label="Concluídos"
              value={stats?.completedReminders ?? 0}
              color={colors.success}
              bgColor={colors.surface}
            />
            <StatCard
              icon="repeat-outline"
              label="Hábitos ativos"
              value={stats?.activeHabits ?? 0}
              color={colors.secondary}
              bgColor={colors.surface}
            />
            <StatCard
              icon="checkbox-outline"
              label="Tarefas concluídas"
              value={stats?.completedTasks ?? 0}
              color={colors.success}
              bgColor={colors.surface}
            />
            <StatCard
              icon="happy-outline"
              label="Humor predominante"
              value={moodScoreToName(stats?.moodAverage ?? 0)}
              color={colors.warning}
              bgColor={colors.surface}
            />
            <StatCard
              icon="flame-outline"
              label="Maior sequência"
              value={`${stats?.streakLongest ?? 0} dias`}
              color={colors.danger}
              bgColor={colors.surface}
            />
          </View>

          {/* Card: Taxas */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="bar-chart-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Taxas de conclusão
              </Text>
            </View>

            <View style={styles.ratesContainer}>
              <RateRow
                label="Lembretes"
                value={completionRates.reminderRate}
                color={colors.primary}
                textColor={colors.textSecondary}
              />
              <RateRow
                label="Tarefas"
                value={completionRates.taskRate}
                color={colors.success}
                textColor={colors.textSecondary}
              />
              <RateRow
                label="Consistência em hábitos"
                value={completionRates.habitConsistency}
                color={colors.secondary}
                textColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Card: Resumo textual (curto) */}
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="analytics-outline"
                size={22}
                color={colors.primary}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Leitura rápida do período
              </Text>
            </View>

            <View style={styles.summaryContainer}>
              <SummaryItem
                icon="trending-up-outline"
                label="Desempenho"
                value={summary.performance}
                color={colors.primary}
                bgColor={colors.background}
                textColor={colors.textSecondary}
              />
              <SummaryItem
                icon="sync-outline"
                label="Consistência"
                value={summary.consistency}
                color={colors.success}
                bgColor={colors.background}
                textColor={colors.textSecondary}
              />
              <SummaryItem
                icon="heart-outline"
                label="Humor"
                value={summary.mood}
                color={colors.warning}
                bgColor={colors.background}
                textColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Botão PDF */}
          <TouchableOpacity
            onPress={handleExportPDF}
            style={[styles.exportButton, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="download-outline" size={18} color="#FFF" />
            <Text style={styles.exportText}>Exportar relatório em PDF</Text>
          </TouchableOpacity>

          {/* Última atualização */}
          <View
            style={[styles.footerNote, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.footerText, { color: colors.textSecondary }]}
            >
              Última atualização:{" "}
              {stats?.generatedAt
                ? formatDateShort(stats.generatedAt)
                : "Desconhecida"}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

// -----------------------------------------------------------
// Componentes auxiliares
// -----------------------------------------------------------
const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  bgColor,
}) => (
  <View style={[styles.statCard, { backgroundColor: bgColor }]}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={[styles.statLabel, { color }]}>{label}</Text>
  </View>
);

const RateRow: React.FC<RateRowProps> = ({
  label,
  value,
  color,
  textColor,
}) => (
  <View style={styles.rateRow}>
    <View style={styles.rateLeft}>
      <View style={[styles.rateDot, { backgroundColor: color }]} />
      <Text style={[styles.rateLabel, { color: textColor }]}>{label}</Text>
    </View>
    <View style={styles.rateRight}>
      <View style={[styles.rateBar, { backgroundColor: color + "20" }]}>
        <View
          style={[
            styles.rateBarFill,
            { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color },
          ]}
        />
      </View>
      <Text style={[styles.rateValue, { color }]}>
        {value.toFixed(1)}%
      </Text>
    </View>
  </View>
);

const SummaryItem: React.FC<SummaryItemProps> = ({
  icon,
  label,
  value,
  color,
  bgColor,
  textColor,
}) => (
  <View style={[styles.summaryItem, { backgroundColor: bgColor }]}>
    <View style={[styles.summaryIconBox, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.summaryContent}>
      <Text style={[styles.summaryLabel, { color: textColor }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
  </View>
);

// -----------------------------------------------------------
// Styles
// -----------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
  },
  header: {
    marginTop: 8,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
  },
  sub: {
    marginTop: 4,
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    width: (width - 40 - 12) / 2,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  card: {
    borderRadius: CARD_RADIUS,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  ratesContainer: {
    gap: 12,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  rateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  rateLabel: {
    fontSize: 13,
  },
  rateRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rateBar: {
    width: 80,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  rateBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  rateValue: {
    fontSize: 13,
    fontWeight: "700",
    minWidth: 45,
    textAlign: "right",
  },
  summaryContainer: {
    gap: 12,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  summaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  exportText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: CARD_RADIUS,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
  },
});
