import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  Alert,
  TouchableHighlight,
  FlatList,
  Platform,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {HeaderButtons, Item} from 'react-navigation-header-buttons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from 'react-native-splash-screen';

import {ItemlessFrame, LoadingFrame} from 'components/frames';
import {TripItem} from 'domains/trips/components';
import HeaderButton from 'components/headerButton/HeaderButton';
import * as tripsActions from 'actions/tripsActions';
import {styles} from './TripsContainerStyle';
import Colors from 'constants/Colors';

const TripsContainer = (props) => {
  const dispatch = useDispatch();
  const trips = useSelector((state) => state.trips.availableTrips);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState();

  const loadTrips = useCallback(() => {
    tripsActions.fetchTripsRequest();
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadTrips();
    SplashScreen.hide();
  }, [loadTrips]);

  const handleSelectItem = (id, destination) => {
    props.navigation.navigate('Details', {
      tripId: id,
      tripDestination: destination,
    });
  };

  const deleteItem = (id) => {
    setIsLoading(true);
    dispatch(tripsActions.deleteTripRequest(id));
    setIsLoading(false);
  };

  /* KNOWN ISSUE: user can click on the card and immediately after on the trip,
  which navigates him to trip details and still shows an alert to delete the trip;
  afterwards application crashes */
  const handleDeleteItem = (item) => {
    Alert.alert(
      `Delete a trip to ${item.destination}`,
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => deleteItem(item.id),
        },
      ],
      {cancelable: true},
    );
  };

  if (isLoading) {
    return <LoadingFrame />;
  }

  if (error) {
    return (
      <View style={[styles.centered, {backgroundColor: Colors.background}]}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  if (trips.length === 0 || trips === undefined) {
    return <ItemlessFrame message={'You have no trips saved!'} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={(itemData) => (
          <TripItem
            image={itemData.item.image}
            destination={itemData.item.destination}
            startDate={itemData.item.startDate.split(' ').slice(1, 4).join(' ')}
            endDate={itemData.item.endDate.split(' ').slice(1, 4).join(' ')}
            onSelect={() => {
              handleSelectItem(itemData.item.id, itemData.item.destination);
            }}>
            <TouchableHighlight
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(itemData.item)}>
              <Icon name="delete" style={styles.deleteIcon} />
            </TouchableHighlight>
          </TripItem>
        )}
      />
    </View>
  );
};

/** we export screenOptions to use in our Stack.Navigator
 * @param {*} navData: lets us use "navigation" prop from within this function */
export const tripsOptions = (navData) => {
  return {
    headerLeft: null,
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add trip"
          style={{marginRight: 3}}
          iconName={Platform.OS === 'android' ? 'md-add' : 'ios-add'}
          onPress={() => {
            navData.navigation.navigate('Add trip');
          }}
        />
      </HeaderButtons>
    ),
  };
};

export default TripsContainer;