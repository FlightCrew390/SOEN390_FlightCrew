import React, { createContext, useContext } from "react";
import { useUserData } from "../hooks/useUserData";

type UserContextValue = ReturnType<typeof useUserData>;

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const userData = useUserData();
  return (
    <UserContext.Provider value={userData}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside UserProvider");
  return ctx;
}
