import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface TooltipProps {
  readonly text: string;
  readonly align?: "left" | "center" | "right";
}

export default function Tooltip({ text, align = "center" }: TooltipProps) {
  const extraStyle = text.length > 15 ? { minWidth: 100 } : { minWidth: 80 };

  let alignStyle: ViewStyle;
  if (align === "left") {
    alignStyle = { left: 0, alignSelf: "flex-start" };
  } else if (align === "right") {
    alignStyle = { right: 0, alignSelf: "flex-end" };
  } else {
    alignStyle = { alignSelf: "center" };
  }

  return (
    <View style={[styles.tooltip, extraStyle, alignStyle]}>
      <Text
        style={[styles.tooltipText, { flexWrap: "wrap" }]}
        numberOfLines={2}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltip: {
    position: "absolute",
    bottom: -35,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 100,
    alignSelf: "center",
  },
  tooltipText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
});
