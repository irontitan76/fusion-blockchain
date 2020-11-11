export const base = {
  palette: {
    error: {
      main: '#ff0000',
    },
    primary: {
      dark: '#389754',
      light: '#6BCA87',
      main: '#47bd69',
    },
    secondary: {
      light: '#2F2E41',
      main: '#003366',
    },
  },
  overrides: {},
  shape: {
    borderRadius: 0,
  },
};

export const dark = {
  ...base,
  palette: {
    ...base.palette,
    background: {
      default: '#111',
      paper: '#212121',
    },
    type: 'dark'
  },
};

export const light = {
  ...base,
  palette: {
    ...base.palette,
    background: {
      default: '#eee',
      paper: '#dedede',
    },
    type: 'light'
  },
};

export default {
  dark,
  light
};