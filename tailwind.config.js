/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "#212121",
        accent: "#5C7A8B",
        graysoft: "#979590",
        light: "#D8D8D8",
        beige: "#D7BFA8",
      },
    },
  },
  plugins: [],
};
