import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(({ palette, spacing }) => {
  return {
    block: {
      backgroundColor: palette.background.paper,
      border: '1px solid #ccc',
      padding: spacing(2),
      wordWrap: 'break-word',
      '& > p > b > span': {
        textTransform: 'capitalize',
      },
    },
  };
});

export default function App() {
  const classes = useStyles();
  const [blocks, setBlocks] = useState([]);
  
  useEffect(() => {
    const getBlocks = async () => {
      const res = await fetch('/api/blocks');
      const json = await res.json();

      setBlocks(json);
    };

    getBlocks();
  }, []);

  const Block = ({ block }) => {
    const items = Object.entries(block).map(([key, value]) => {
      return (
        <p key={key}>
          <b><span>{key}:&nbsp;</span></b>
          <span>{JSON.stringify(value)}</span>
        </p>
      );
    })

    return (
      <Typography className={classes.block} component='div' key={block.hash}>
        {items}
      </Typography>
    );
  };

  const renderedBlocks = blocks.map((block) => (
    <Block block={block} key={block.hash} />
  ));

  return (
    <main>
      <Typography component='h2' variant='h4'>
        <FormattedMessage id='blockchain.title' />
      </Typography>
      <div>
        {renderedBlocks}
      </div>
    </main>
  );
};
