import React, { useState, useContext, useEffect } from 'react';
import { FirebaseContext } from '../../firebase';
import { Grocery } from '../../firebase/models';

import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, makeStyles } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import NewGrocery from './NewGrocery';

const useStyles = makeStyles((theme) => ({
  group: {
    width: theme.spacing(1),
    height: '100%',
    position: 'absolute',
    left: 0,
  },

  categoryCyan: {
    backgroundColor: '#26B0C7',
  },

  categoryGreen: {
    backgroundColor: '#75B35A',
  },

  categoryOrange: {
    backgroundColor: '#E57542',
  },

  listItemText: {
    display: 'flex',
    alignItems: 'center',
    '& > *:first-child': {
      flex: '0 0 66%',
    },
  },
}));

const GroceryList: React.FC = () => {
  const [state, setState] = useState({ loading: false, groceries: [] as Grocery[][] });
  const firebase = useContext(FirebaseContext);

  useEffect(() => {
    setState({ ...state, loading: true });
    firebase.groceryList().on('value', (snapshot) => {
      const groceriesObject = snapshot.val();
      const groceryList = groceriesObject
        ? Object.keys(groceriesObject).map(
            (key) =>
              ({
                ...groceriesObject[key],
                category: groceriesObject[key].category == null ? 'undefined' : groceriesObject[key].category,
                uid: key,
              } as Grocery)
          )
        : [];

      console.log({ groceryList });

      const groupGroceries = groceryList.reduce((acc, value) => {
        if (!acc[value.category]) {
          acc[value.category] = [];
        }

        acc[value.category].push(value);

        return acc;
      }, {} as { [index: string]: Grocery[] });

      console.log(groupGroceries);

      setState({
        ...state,
        groceries: Object.values(groupGroceries),
        loading: false,
      });
    });

    return () => {
      firebase.groceryList().off();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGroceryDelete = (uid: string) => {
    firebase.groceryList().child(uid).remove();
  };

  const classes = useStyles();

  const renderGroup = (group: Grocery[]) => {
    const getCategoryClass = (category: Grocery['category']) => {
      switch (category) {
        case 'cyan':
          return classes.categoryCyan;
        case 'green':
          return classes.categoryGreen;
        case 'orange':
          return classes.categoryOrange;
        default:
          return '';
      }
    };

    return group.map((grocery) => {
      return (
        <ListItem key={grocery.uid} divider>
          <div className={`${classes.group} ${getCategoryClass(grocery.category)}`}></div>
          <ListItemText className={classes.listItemText} primary={grocery.name} secondary={grocery.amount} />
          <ListItemSecondaryAction>
            <IconButton edge="end" onClick={() => handleGroceryDelete(grocery.uid)}>
              <Delete />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    });
  };

  const { loading, groceries } = state;
  return (
    <div>
      <span>Grocery List</span>
      {loading && <div>Loading...</div>}
      <NewGrocery />
      <List>{groceries.map((groceryGroup) => renderGroup(groceryGroup))}</List>
    </div>
  );
};

export default GroceryList;