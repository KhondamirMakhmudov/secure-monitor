/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "10px",
        sm: "15px",
        md: "20px",
        lg: "25px",
        xl: "30px",
        "2xl": "2240px",
      },
    },
    extend: {
      fontFamily: {
        "mono-cyber": ['"Share Tech Mono"', "monospace"],
        "display-cyber": ["Rajdhani", "sans-serif"],
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
    },
  },
  plugins: [],
};
