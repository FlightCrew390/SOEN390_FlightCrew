import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ACCESSIBILITY_KEY = "accessibility_mode";

interface AccessibilityContextValue {
  accessibilityMode: boolean;
  setAccessibilityMode: (enabled: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

export function AccessibilityProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [accessibilityMode, setAccessibilityModeState] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    SecureStore.getItemAsync(ACCESSIBILITY_KEY).then((raw) => {
      if (isMounted.current && raw !== null) {
        setAccessibilityModeState(raw === "true");
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const setAccessibilityMode = useCallback((enabled: boolean) => {
    setAccessibilityModeState(enabled);
    SecureStore.setItemAsync(ACCESSIBILITY_KEY, String(enabled));
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{ accessibilityMode, setAccessibilityMode }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error("useAccessibility must be inside AccessibilityProvider");
  return ctx;
}
