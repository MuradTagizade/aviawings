/* Applies the saved (or system) theme as early as possible to avoid a flash. */
try {
  var t = localStorage.getItem("aw-theme");
  if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
} catch (e) {}
