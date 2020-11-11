import { FormattedMessage } from 'react-intl';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AppBar, IconButton, InputAdornment, MenuItem, TextField, Toolbar,
  Tooltip, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(({ palette, spacing }) => {
  return {
    activeItem: {
      backgroundColor: palette.primary.dark,
    },
    appBar: {
      color: palette.common.white,
      '& button': {
        color: palette.common.white,
      },
    },
    item: {
      '&:hover': {
        backgroundColor: palette.primary.dark,
      },
      height: 48,
      minHeight: '100%',
      padding: spacing(3),
    },
    logo: {
      alignItems: 'baseline',
      color: palette.common.white,
      display: 'flex',
      fontWeight: 700,
      letterSpacing: 2,
      textDecoration: 'none',
      textTransform: 'uppercase',
      '& > span': {
        color: palette.getContrastText(palette.primary.main),
        letterSpacing: 0,
        fontSize: 10,
        fontWeight: 400,
      },
    },
    select: {
      '& *': {
        color: palette.common.white,
      },
      minWidth: 150,
    },
    settings: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
      width: 200,
    },
    toolbar: {
      '& > *': {
        display: 'flex',
      },
      display: 'flex',
      justifyContent: 'space-between',
      padding: 0,
      margin: '0 auto',
      maxWidth: 1440,
      width: '100%',
    },
  };
});

export default function Header({ contrast, locale, locales, onLocaleChange, onThemeChange }) {
  const classes = useStyles();

  const nav = [
    { name: 'balances', to: '/' },
    { name: 'ledger', to: '/ledger' },
    { name: 'exchange', to: '/exchange' },
    { name: 'trade', to: '/trade' },
    { name: 'learn', to: '/learn' },
  ].map(({ name, to }, i) => (
    <Tooltip
      arrow
      key={name}
      title={<FormattedMessage id={`nav.item.${i}.tooltip`} />}
    >
      <MenuItem
        activeClassName={classes.activeItem}
        className={classes.item}
        component={NavLink}
        exact
        name={name}
        to={to}
      >
        <FormattedMessage id={`nav.item.${i}.label`} />
      </MenuItem>
    </Tooltip>
  ));

  const tip = `Switch to ${contrast === 'dark' ? 'light' : 'dark'} mode`;

  return (
    <>
      <AppBar className={classes.appBar} component='header'>
        <Toolbar className={classes.toolbar} variant='dense'>
          <Typography
            className={classes.logo}
            component={Link}
            to='/'
            variant='h6'
          >
            Fusion<span>Crypto</span>
          </Typography>
          <nav>{nav}</nav>
          <div className={classes.settings}>
            <TextField
              className={classes.select}
              onChange={onLocaleChange}
              select
              SelectProps={{
                disableUnderline: true,
                MenuProps: {
                  anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                  getContentAnchorEl: null,
                  transformOrigin: { horizontal: 'right', vertical: 'top' },
                },
                startAdornment: (
                  <InputAdornment position='start'>
                    <FontAwesomeIcon icon={['fal', 'globe-americas']} />
                  </InputAdornment>
                )
              }}
              size='small'
              value={locale}
              variant='standard'
            >
              {Object.entries(locales).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value[0]}
                </MenuItem>
              ))}
            </TextField>
            <Tooltip arrow title={tip}>
              <IconButton edge='end' onClick={onThemeChange}>
                <FontAwesomeIcon icon={['fal', 'swatchbook']} />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar variant='dense' />
    </>
  );
};