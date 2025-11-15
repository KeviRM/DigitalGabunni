/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Escaneará todos los archivos .html, .js, .jsx, .ts y .tsx en src/
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { backgroundOpacity: ['active'],},
  },
  plugins: [],
}