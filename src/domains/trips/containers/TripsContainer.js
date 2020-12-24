import Icon from 'react-native-vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import { Alert, FlatList, Text, TouchableHighlight, View } from 'react-native';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { useDispatch, useSelector } from 'react-redux';

import * as tripsActions from 'actions/tripsActions';
import Colors from 'constants/Colors';
import {
  View as Container,
  HeaderButton,
  ItemlessFrame,
  LoadingFrame,
} from 'utils';
import { TripItem } from '../components';
import { styles } from './TripsContainerStyle';

const TripsContainer = (props) => {
  const dispatch = useDispatch();
  const trips = useSelector((state) => state.trips.trips);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const loadTrips = useCallback(() => {
    try {
      dispatch(tripsActions.fetchTripsRequest());
    } catch {
      setError('Something went wrong!');
    }
    setIsLoading(false);
  }, [dispatch]);

  const deleteTrip = useCallback(
    (id) => {
      setIsLoading(true);
      try {
        dispatch(tripsActions.deleteTripRequest(id));
      } catch {
        setError('Something went wrong!');
      }
      setIsLoading(false);
      setIsDeleting(false);
    },
    [dispatch],
  );

  const handleDeleteTrip = (item) => {
    setIsDeleting(true);
    Alert.alert(
      `Delete a trip to ${item.destination}`,
      'Are you sure?',
      [
        {
          onPress: () => setIsDeleting(false),
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => deleteTrip(item.id),
          text: 'OK',
        },
      ],
      { cancelable: true, onDismiss: () => setIsDeleting(false) },
    );
  };

  const handleSelectItem = (id, destination) => {
    !isDeleting &&
      props.navigation.navigate('Details', {
        destination,
        tripId: id,
      });
  };

  useEffect(() => {
    loadTrips();
    SplashScreen.hide();
  }, [loadTrips]);

  if (isLoading) {
    return <LoadingFrame />;
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Colors.background }]}>
        <Text style={styles.text}>{error}</Text>
      </View>
    );
  }

  if (Array.isArray(trips) && trips.length < 1) {
    return <ItemlessFrame message="You have no trips saved!" />;
  }

  return (
    <Container>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={(data) => (
          <TripItem
            image={data.item.image}
            destination={data.item.destination}
            startDate={data.item.startDate.split(' ').slice(1, 4).join(' ')}
            endDate={data.item.endDate.split(' ').slice(1, 4).join(' ')}
            onSelect={() => {
              handleSelectItem(data.item.id, data.item.destination);
            }}
          >
            <TouchableHighlight
              style={styles.deleteButton}
              onPress={() => handleDeleteTrip(data.item)}
            >
              <Icon name="delete" style={styles.deleteIcon} />
            </TouchableHighlight>
          </TripItem>
        )}
      />
    </Container>
  );
};

export const tripsOptions = (navData) => {
  return {
    headerLeft: null,
    headerRight: () => (
      <HeaderButtons HeaderButtonComponent={HeaderButton}>
        <Item
          title="Add trip"
          iconName="plus"
          onPress={() => navData.navigation.navigate('Add trip')}
        />
      </HeaderButtons>
    ),
  };
};

export default TripsContainer;
