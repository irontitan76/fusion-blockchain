import { useState } from 'react';
import { IntlProvider } from 'react-intl'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { createMuiTheme, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';

import Header from 'components/Header';
import theme from 'config/theme';
import lang from 'lang';
import Home from 'views/Home';
import Learn from 'views/Learn';
import Ledger from 'views/Ledger';
import 'config/icons';

export default function App() {
  const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [contrast, setContrast] = useState(darkMode ? 'dark' : 'light');
  const [locale, setLocale] = useState('en');

  const handleThemeChange = () => {
    setContrast(contrast === 'light' ? 'dark' : 'light');
  };

  const handleLocaleChange = (event) => {
    const { value } = event.target;
    setLocale(value);
  };

  const t = {
    ...theme[contrast],
    palette: {
      ...theme[contrast].palette,
      type: contrast,
    },
  };

  return (
    <IntlProvider
      defaultLocale='en'
      locale={locale}
      messages={lang[locale][1]}
    >
      <ThemeProvider theme={createMuiTheme(t)}>
        <CssBaseline />
        <Router>
          <Header
            contrast={contrast}
            locale={locale}
            locales={lang}
            onLocaleChange={handleLocaleChange}
            onThemeChange={handleThemeChange}
          />
          <Switch>
            <Route component={Home} exact path='/' />
            <Route component={Learn} exact path='/learn' />
            <Route component={Ledger} exact path='/ledger' />
          </Switch>
        </Router>
      </ThemeProvider>
    </IntlProvider>
  );
};
