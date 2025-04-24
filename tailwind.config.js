/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,mdx}",
    "./components/**/*.{js,jsx,mdx}",
    "./app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      // You can still define custom colors if needed
      colors: {
        // Custom colors can be defined here, but are optional for this approach
      },
    },
  },
  plugins: [],
};
