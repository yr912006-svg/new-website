import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: { ink: '#24201D', ivory: '#F8F2E7', gold: '#B08A45', clay: '#8B5542', mist: '#E9E0D3' }, fontFamily: { serif: ['Georgia', 'serif'] } } },
  plugins: []
};
export default config;
