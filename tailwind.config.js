const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'bruno': ['"Bruno Ace"', ...defaultTheme.fontFamily.sans],
        'reem': ['"Reem Kufi"', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}
