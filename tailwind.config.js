// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
  safelist: [
    {
      pattern:
        /(col|grid|gap|p|m|w|h|text|bg|border|rounded|shadow|justify|items|content|leading|tracking)-.*/,
    },
    { pattern: /grid-cols-(1|2|3|4|5|6|12)/ },
  ],
  theme: { extend: {} },
  plugins: [],
  // If preflight fights legacy CSS, we will toggle this to false later:
  // corePlugins: { preflight: false },
};
