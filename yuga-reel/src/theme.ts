import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/300-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/500.css';
import '@fontsource/shippori-mincho/400.css';
import '@fontsource/shippori-mincho/600.css';
import {Easing} from 'remotion';

export const C = {
  ink: '#050906',
  forest: '#0C1A11',
  moss: '#1F3A26',
  matcha: '#7FA23A',
  jade: '#A9C95A',
  froth: '#C8DB7E',
  cream: '#F1ECE0',
  paper: '#E9E2D2',
  gold: '#C9A86A',
  seal: '#B3342A',
};

export const F = {
  serif: '"Cormorant Garamond", serif',
  sans: 'Inter, sans-serif',
  jp: '"Shippori Mincho", serif',
};

// Cinematic ease curves
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_SOFT = Easing.bezier(0.33, 0, 0.2, 1);

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const FONT_SPECS = [
  '300 100px "Cormorant Garamond"',
  'italic 300 100px "Cormorant Garamond"',
  '500 100px "Cormorant Garamond"',
  '300 100px Inter',
  '500 100px Inter',
];
export const JP_TEXT = '悠雅抹茶';
export const JP_SPECS = ['400 100px "Shippori Mincho"', '600 100px "Shippori Mincho"'];

export const loadFonts = () =>
  Promise.all([
    ...FONT_SPECS.map((f) => document.fonts.load(f, 'YUGA abc')),
    ...JP_SPECS.map((f) => document.fonts.load(f, JP_TEXT)),
  ]);
