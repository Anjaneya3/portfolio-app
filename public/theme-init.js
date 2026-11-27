// Runs before the page paints, so the saved theme applies with no flash. Dark is the default.
// It lives in its own file because the server's Content Security Policy blocks inline scripts.
(function () {
  try {
    if (localStorage.getItem("portfolio-theme") !== "light") {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {
    document.documentElement.classList.add("dark");
  }
})();
