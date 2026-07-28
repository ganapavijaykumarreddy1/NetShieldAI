/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#05070c',        // Blackish-blue deep space bg
          card: '#0c101b',      // Card component bg
          border: '#172237',    // Sleek border lines
          accent: '#00f0ff',    // Electric neon cyan glow
          dim: '#8f9fb8',       // Muted gray-blue
          danger: '#ff3b30',    // Threat hazard alert red
          warning: '#ffcc00',   // Warn yellow
          success: '#34c759',   // Secure green
          input: '#121824',     // Dark text inputs
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(0, 240, 255, 0.25)',
        'glow-cyan-strong': '0 0 25px rgba(0, 240, 255, 0.5)',
        'glow-red': '0 0 15px rgba(255, 59, 48, 0.25)',
      }
    },
  },
  plugins: [],
}
