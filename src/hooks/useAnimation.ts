import { useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';

// -------------------------------------------------------------
// Tipos e opções
// -------------------------------------------------------------
interface UseAnimationOptions {
  type?: 'timing' | 'spring';
  duration?: number;
  damping?: number;
  stiffness?: number;
}

// -------------------------------------------------------------
// Retorno do hook
// -------------------------------------------------------------
interface UseAnimationReturn {
  value: SharedValue<number>;
  animateTo: (toValue: number) => void;
  reset: () => void;
  animatedStyle: (transform?: (val: number) => any) => ReturnType<typeof useAnimatedStyle>;
}

// -------------------------------------------------------------
// Hook principal
// -------------------------------------------------------------
export function useAnimation(
  initialValue = 0,
  {
    type = 'timing',
    duration = 500,
    damping = 12,
    stiffness = 120,
  }: UseAnimationOptions = {},
): UseAnimationReturn {
  const value = useSharedValue(initialValue);

  const animateTo = useCallback(
    (toValue: number) => {
      if (type === 'spring') {
        value.value = withSpring(toValue, {
          damping,
          stiffness,
        });
      } else {
        value.value = withTiming(toValue, { duration });
      }
    },
    [type, duration, damping, stiffness, value],
  );

  const reset = useCallback(() => {
    value.value = initialValue;
  }, [value, initialValue]);

  const animatedStyle = useCallback(
    (transform?: (val: number) => any) =>
      useAnimatedStyle(() => {
        return transform ? transform(value.value) : {};
      }),
    [value],
  );

  return {
    value,
    animateTo,
    reset,
    animatedStyle,
  };
}
