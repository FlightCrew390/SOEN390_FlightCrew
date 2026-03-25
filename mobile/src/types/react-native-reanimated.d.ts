/**
 * Minimal ambient declaration for react-native-reanimated.
 * The package is listed in package.json but not yet installed in this environment.
 * Remove this file once the package is properly installed.
 */
declare module "react-native-reanimated" {
  import { ComponentType, ReactNode } from "react";
  import { ViewStyle } from "react-native";

  export interface SharedValue<T> {
    value: T;
  }

  export function useSharedValue<T>(value: T): SharedValue<T>;
  export function useAnimatedStyle(fn: () => ViewStyle): ViewStyle;
  export function withTiming(value: number, options?: object): number;
  export function withSpring(value: number, options?: object): number;
  export function runOnJS<T extends (...args: any[]) => any>(fn: T): T;

  const Animated: {
    View: ComponentType<{ style?: any; children?: ReactNode }>;
    Text: ComponentType<{ style?: any; children?: ReactNode }>;
    createAnimatedComponent: <T>(
      component: ComponentType<T>,
    ) => ComponentType<T>;
  };

  export default Animated;
}
