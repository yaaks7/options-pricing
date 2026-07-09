// src/styles/plotlyTheme.js
//
// Shared Plotly styling so every chart in the app (heatmap, option
// sensitivity, Greeks sensitivity) reads as one system: transparent panels
// that sit inside the surrounding card, a quiet neutral grid, and a small
// restrained categorical palette instead of Plotly's rainbow default.
// Values mirror the CSS custom properties in App.css - kept as plain
// strings here since Plotly's layout/config objects can't read CSS vars.

export const TEXT_SECONDARY = '#8B94A3';
export const TEXT_PRIMARY = '#E6E9EE';
export const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';
export const ACCENT = '#5EB1BF';
export const POSITIVE = '#3FB950';
export const NEGATIVE = '#E5534B';

// One line per pricing model - four desaturated, distinguishable hues so no
// single line dominates the others.
export const MODEL_COLORWAY = ['#5EB1BF', '#D8A657', '#6E93C9', '#C9738A'];

// Diverging P&L scale: red (loss) -> neutral graphite (breakeven) -> green
// (gain). The muted midpoint keeps the ends - the only informative part -
// as the visual focus.
export const PNL_COLORSCALE = [
  [0, NEGATIVE],
  [0.5, '#2A2E37'],
  [1, POSITIVE],
];

export const axisStyle = (titleText) => ({
  title: { text: titleText, font: { color: TEXT_SECONDARY, family: 'IBM Plex Mono' } },
  color: TEXT_SECONDARY,
  gridcolor: GRID_COLOR,
  zerolinecolor: GRID_COLOR,
  linecolor: GRID_COLOR,
});

export const titleStyle = (titleText) => ({
  text: titleText,
  font: { color: TEXT_PRIMARY, family: 'IBM Plex Sans', size: 16 },
});

export const baseLayout = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: TEXT_SECONDARY, family: 'IBM Plex Sans' },
  colorway: MODEL_COLORWAY,
  legend: {
    font: { color: TEXT_SECONDARY },
    bgcolor: 'rgba(255, 255, 255, 0.03)',
    bordercolor: GRID_COLOR,
    borderwidth: 1,
  },
};
