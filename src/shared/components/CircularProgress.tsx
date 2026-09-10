import { View, StyleSheet, ViewStyle } from "react-native";
import { ReactNode } from "react";

interface CircularProgressProps {
  /** Diameter of the ring in dp. */
  size: number;
  /** Thickness of the ring stroke in dp. */
  strokeWidth: number;
  /** 0–100. Values outside that range are clamped. */
  progress: number;
  /** Color of the unfilled track. */
  trackColor: string;
  /** Color of the filled portion. */
  progressColor: string;
  /** Centered content — the "15d" / "DAYS CLEAN" text block. */
  children?: ReactNode;
  style?: ViewStyle;
}

/**
 * Pure View-based circular progress indicator (no react-native-svg, per the
 * "View/Text/Image/Pressable/StyleSheet only" constraint on this task).
 *
 * Technique: a full circle drawn with border-radius = size/2 can be turned
 * into an arc by making two of its borders transparent and rotating it,
 * then clipping it to the right or left half of the square with an
 * overflow:hidden container. 0–50% progress only needs the right half;
 * 50–100% also reveals the left half. The whole arc is drawn rotated -90deg
 * so 0% starts at 12 o'clock (matching the reference) instead of 3 o'clock.
 */
export default function CircularProgress({
  size,
  strokeWidth,
  progress,
  trackColor,
  progressColor,
  children,
  style,
}: CircularProgressProps) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  const rotation = (clamped / 100) * 360;
  const halfSize = size / 2;
  const isMoreThanHalf = rotation > 180;

  const baseCircle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: halfSize,
    borderWidth: strokeWidth,
  };

  return (
    <View style={[{ width: size, height: size }, style]}>
      {/* Rotated wrapper: rotating a square about its own center doesn't
          change its bounding box, so the un-rotated center content below
          still lines up correctly. */}
      <View
        style={[StyleSheet.absoluteFill, styles.rotatedWrapper]}
      >
        {/* Track (unfilled base ring) */}
        <View
          style={[baseCircle, { borderColor: trackColor }, styles.absoluteFill]}
        />

        {/* Right half: covers 0-50% */}
        <View style={[styles.absoluteFill, { width: halfSize, overflow: "hidden" }]}>
          <View
            style={[
              baseCircle,
              styles.transparentBorder,
              {
                borderTopColor: progressColor,
                borderRightColor: progressColor,
                transform: [{ rotate: `${isMoreThanHalf ? 180 : rotation}deg` }],
              },
            ]}
          />
        </View>

        {/* Left half: only needed once we've passed 50% */}
        {isMoreThanHalf && (
          <View
            style={[
              styles.absoluteFill,
              { left: halfSize, width: halfSize, overflow: "hidden" },
            ]}
          >
            <View
              style={[
                baseCircle,
                styles.transparentBorder,
                {
                  marginLeft: -halfSize,
                  borderTopColor: progressColor,
                  borderLeftColor: progressColor,
                  transform: [{ rotate: `${rotation - 180}deg` }],
                },
              ]}
            />
          </View>
        )}
      </View>

      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: "absolute",
  },
  rotatedWrapper: {
    transform: [{ rotate: "-90deg" }],
  },
  transparentBorder: {
    borderColor: "transparent",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
});