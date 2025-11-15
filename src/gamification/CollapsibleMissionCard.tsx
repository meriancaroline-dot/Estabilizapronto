import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  title: string;
  description: string;
  hint?: string;
}

export function CollapsibleMissionCard({ title, description, hint }: Props) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [open, setOpen] = useState(false);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={styles.header}
        activeOpacity={0.8}
      >
        <View style={styles.titleRow}>
          <Ionicons
            name="flag-outline"
            size={18}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.content}>
          <Text style={[styles.desc, { color: colors.textSecondary }]}>
            {description}
          </Text>

          {hint && (
            <Text style={[styles.hint, { color: colors.primary }]}>
              {hint}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    marginTop: 10,
    paddingLeft: 2,
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: "italic",
    fontWeight: "500",
  },
});
