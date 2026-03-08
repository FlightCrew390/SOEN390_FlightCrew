import React, { createContext, useContext } from "react";
import { useCalendarData } from "../hooks/useCalendarData";

type CalendarContextValue = ReturnType<typeof useCalendarData>;

const CalendarContext = createContext<CalendarContextValue | null>(null);

export function CalendarProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const calendarData = useCalendarData();
  return (
    <CalendarContext.Provider value={calendarData}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  const ctx = useContext(CalendarContext);
  if (!ctx) throw new Error("useCalendar must be inside CalendarProvider");
  return ctx;
}
