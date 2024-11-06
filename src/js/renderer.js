function applyTheme(theme) {
  const themeStylesheet = document.getElementById("themeStyleSheet");
  themeStylesheet.href =
    theme === "dark" ? "../css/dark.css" : "../css/light.css";
}

// Load the saved theme on startup
window.api.loadConfig().then((config) => {
  applyTheme(config.theme || "light");
});