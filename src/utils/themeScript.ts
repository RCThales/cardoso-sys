
export const initializeTheme = () => {
  // This function will check localStorage and system preferences to set initial theme
  const script = document.createElement('script');
  script.innerHTML = `
    (function() {
      // Check if theme is stored in localStorage
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference if no stored preference
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    })();
  `;
  
  document.head.appendChild(script);
};
