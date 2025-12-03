import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define your dark theme colors
        background: {
          DEFAULT: "#0f0f0f", // Very dark background
          secondary: "#1a1a1a", // Slightly lighter background for contrast
          card: "#1e1e1e",     // Card background
        },
        foreground: "#f0f0f0", // Light text color
        card: {
          DEFAULT: "#1e1e1e",
          foreground: "#f0f0f0",
        },
        popover: {
          DEFAULT: "#1e1e1e",
          foreground: "#f0f0f0",
        },
        primary: {
          DEFAULT: "#FFD700", // Golden yellow
          foreground: "#0f0f0f", // Dark text on golden background
        },
        secondary: {
          DEFAULT: "#2a2a2a", // Dark gray for secondary elements
          foreground: "#f0f0f0",
        },
        muted: {
          DEFAULT: "#3a3a3a", // Muted gray
          foreground: "#a0a0a0", // Muted text
        },
        accent: {
          DEFAULT: "#FFD700", // Golden yellow accent
          foreground: "#0f0f0f",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#f0f0f0",
        },
        border: "#3a3a3a", // Border color matching muted
        input: "#3a3a3a",
        ring: "#FFD700", // Ring color for focus, using golden yellow
      },
      // Define your gradient
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)', // Dark gradient
        'gradient-gold': 'linear-gradient(90deg, #FFD700, #FFA500, #FFD700)', // Horizontal gold gradient for accents
      },
      // Optional: Add subtle animations for decorations (only if tw-animate-css is installed and compatible)
      // animation: {
      //   'pulse-gentle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      // }
    },
  },
  plugins: [
    require("tailwindcss-animate"), // Add this plugin
    // require("tw-animate-css"), // Remove if not compatible or not using
  ], // Ensure tailwindcss-animate is added
};
export default config;