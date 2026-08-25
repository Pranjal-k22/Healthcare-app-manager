(function () {
  var STORAGE_KEY = 'healthpulse_theme';
  var DARK_COLOR = '#08111F';
  var LIGHT_COLOR = '#2563EB';
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    var resolved = saved === 'dark'
      ? 'dark'
      : saved === 'light'
      ? 'light'
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    document.documentElement.dataset.theme = resolved;
    var metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) metaTheme.setAttribute('content', resolved === 'dark' ? DARK_COLOR : LIGHT_COLOR);
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
