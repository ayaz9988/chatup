import { create } from "zustand";

export const useThemeStore = create(
  (set: {
    (partial: unknown, replace?: false | undefined): void;
    (state: unknown, replace: true): void;
  }) => ({
    theme: localStorage.getItem("chat-theme") || "sunset",
    setTheme: (theme: string) => {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
    },
  })
);
