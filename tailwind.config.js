/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    // Performance metrics color classes
    'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-indigo-600', 'bg-pink-600',
    'text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600', 'text-indigo-600', 'text-pink-600',
    'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-indigo-100', 'bg-pink-100',
    'text-blue-800', 'text-green-800', 'text-purple-800', 'text-orange-800', 'text-indigo-800', 'text-pink-800',
    // Emotion color classes
    'bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-gray-500',
    'bg-red-100', 'bg-yellow-100', 'bg-gray-100',
    'text-red-800', 'text-yellow-800', 'text-gray-800',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
