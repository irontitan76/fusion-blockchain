import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Box, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

import { ReactComponent as FinanceData } from 'assets/cryptocurrency.svg';

const useStyles = makeStyles(({ palette, spacing }) => {
  return {
    hero: { 
      backgroundColor: palette.background.paper,
      '& > div': {
        height: 500,
        margin: '0 auto',
        maxWidth: 1440,
        width: '100%',
      }
    },
    subtitle: {
      marginBottom: spacing(2),
    },
    title: {
      fontWeight: 'bold',
    },
  };
});

export default function App() {
  const classes = useStyles();
  const [walletInfo, setWalletInfo] = useState({});
  const { address, balance } = walletInfo;
  
  useEffect(() => {
    const getWalletInfo = async () => {
      const res = await fetch('/api/wallet-info');
      const json = await res.json();

      setWalletInfo(json);
    };

    getWalletInfo();
  }, []);

  return (
    <main>
      <Box
        className={classes.hero}
        component='section'
        left='50%'
        marginLeft='-50vw'
        marginRight='-50vw'
        position='relative'
        right='50%'
        width='100vw'
      >
        <Grid
          alignContent='center'
          alignItems='center'
          container
          justify='space-between'
        >
          <Grid item md={6}>
            <Typography className={classes.title} gutterBottom variant='h3'>
              <FormattedMessage id='home.hero.title' />
            </Typography>
            <Typography className={classes.subtitle} gutterBottom>
              <FormattedMessage id='home.hero.subtitle' />
            </Typography>
            <Button color='primary' component={Link} to='/learn' variant='contained'>
              <FormattedMessage id='home.hero.button' />
            </Button>
          </Grid>
          <Grid item md={6}>
            <FinanceData height='75%' width='75%' />
          </Grid>
        </Grid>
      </Box>
      <section>
        <Typography component='h2' variant='h4'>
          <FormattedMessage id='home.wallet.title' />
        </Typography>
        {address && <Typography>
          <b><FormattedMessage id='home.wallet.field.0.label' /></b> {address}
        </Typography>}
        {balance && <Typography>
          <b><FormattedMessage id='home.wallet.field.1.label' /></b> {balance}
        </Typography>}
      </section>
    </main>
  );
};
