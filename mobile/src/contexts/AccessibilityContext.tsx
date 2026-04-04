import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext } from "react";

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
  const [accessibilityMode, setAccessibilityMode] = React.useState(false);
  const isMounted = React.useRef(true);

  React.useEffect(() => {
    isMounted.current = true;
    SecureStore.getItemAsync(ACCESSIBILITY_KEY).then((raw) => {
      if (isMounted.current && raw !== null) {
        setAccessibilityMode(raw === "true");
      }
    });
    return () => {
      isMounted.current = false;
    };
  }, []);

  const updateAccessibilityMode = React.useCallback((enabled: boolean) => {
    setAccessibilityMode(enabled);
    SecureStore.setItemAsync(ACCESSIBILITY_KEY, String(enabled));
  }, []);

  const value = React.useMemo(
    () => ({
      accessibilityMode,
      setAccessibilityMode: updateAccessibilityMode,
    }),
    [accessibilityMode, updateAccessibilityMode],
  );

  return (
    <AccessibilityContext.Provider value={value}>
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
