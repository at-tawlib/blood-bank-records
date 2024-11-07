function applyTheme(theme) {
  const themeStylesheet = document.getElementById("themeStyleSheet");
  themeStylesheet.href =
    theme === "dark" ? "../css/dark.css" : "../css/light.css";
}

// Listen for theme changes
window.theme.onApplyTheme((theme) => {
  applyTheme(theme);
});

// Load the saved theme on startup
window.api.loadConfig().then((config) => {
  applyTheme(config.theme || "light");
});
