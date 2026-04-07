import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS, MAP_CONFIG } from "../../constants";

interface BaseMarkerIconProps {
  /** Fill colour for the inner circle. */
  readonly color: string;
  /** Scale multiplier relative to `MAP_CONFIG.markerSize` (default 1). */
  readonly scale?: number;
  /** Category / building icon paths rendered inside the circle. */
  readonly children?: React.ReactNode;
}

/** Maximum scale applied to a marker (selected state). */
const MAX_SCALE = 1.3;

/**
 * Shared pure-SVG marker icon used by both BuildingMarker and PoiMarker.
 *
 * Renders the three-circle base (drop-shadow, white stroke ring, coloured fill)
 * and passes through any SVG children (icon paths) to be drawn on top.
 *
 * The outer View is always sized at MAX_SCALE so the Android native marker
 * frame is allocated once and never clips the icon when scale increases on
 * selection.
 */
export default function BaseMarkerIcon({
  color,
  scale = 1,
  children,
}: BaseMarkerIconProps) {
  const { width, height } = MAP_CONFIG.markerSize;
  const frameSize = { width: width * MAX_SCALE, height: height * MAX_SCALE };
  const svgSize = { width: width * scale, height: height * scale };

  return (
    <View
      testID="marker-frame"
      style={{
        width: frameSize.width,
        height: frameSize.height,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <Svg width={svgSize.width} height={svgSize.height} viewBox="0 0 40 40">
        <Circle cx="20" cy="20" r="14" fill={COLORS.shadowBlack} />
        <Circle cx="20" cy="16" r="14" stroke={COLORS.white} strokeWidth="4" />
        <Circle cx="20" cy="16" r="12" fill={color} />
        {children}
      </Svg>
    </View>
  );
}
