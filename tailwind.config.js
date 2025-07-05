/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // ... seu tema existente ...
  },
  // ATUALIZE A SEÇÃO DE PLUGINS AQUI
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'), // <-- ADICIONE ESTA LINHA
  ],
}