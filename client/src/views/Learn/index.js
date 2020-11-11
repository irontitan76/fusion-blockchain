import { Box, Grid } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(({ palette }) => {
  return {
    hero: { 
      backgroundColor: palette.background.paper,
      '& > div': {
        height: 750,
        margin: '0 auto',
        // maxWidth: 1440,
        width: '100%',
      }
    },
  };
});

export default function Learn() {
  const classes = useStyles();

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
        
      </Box>
    </main>
  )
};