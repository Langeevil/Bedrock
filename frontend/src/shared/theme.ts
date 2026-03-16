export type AppTheme = "bedrocklight" | "bedrockdark";
export type ThemePreference = AppTheme | "system";

export const THEME_STORAGE_KEY = "bedrock_theme_preference";

const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

export function resolveTheme(preference: ThemePreference): AppTheme {
  if (preference === "system") {
    return darkModeQuery.matches ? "bedrockdark" : "bedrocklight";
  }

  return preference;
}

export function getStoredThemePreference(): ThemePreference {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (
    stored === "bedrocklight" ||
    stored === "bedrockdark" ||
    stored === "system"
  ) {
    return stored;
  }

  return "system";
}

export function applyTheme(preference: ThemePreference) {
  const resolvedTheme = resolveTheme(preference);
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.style.colorScheme =
    resolvedTheme === "bedrockdark" ? "dark" : "light";
}

export function setThemePreference(preference: ThemePreference) {
  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  applyTheme(preference);
  window.dispatchEvent(new CustomEvent("bedrock-theme-change", { detail: preference }));
}

export function subscribeToSystemThemeChanges(onChange: () => void) {
  const listener = () => onChange();
  darkModeQuery.addEventListener("change", listener);
  return () => darkModeQuery.removeEventListener("change", listener);
}
