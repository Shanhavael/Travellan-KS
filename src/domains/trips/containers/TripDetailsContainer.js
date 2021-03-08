import React, { memo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSelector } from 'react-redux';

import { DetailsHeader, NavigationButton } from '../components';
import { addEventToCalendar } from 'services';
import { styles } from './TripDetailsContainerStyle.js';

const TripDetailsContainer = ({ route, navigation }) => {
  const tripId = route.params.tripId;
  const selectedTrip = useSelector((state) =>
    state.trips.trips.find((item) => item.id === tripId),
  );
  const { destination, startDate, endDate, image, cityCode } = selectedTrip;
  const { author, username, imageUrl } = image;
  const CalendarEventChandler = addEventToCalendar;

  const addTripToCalendar = () =>
    CalendarEventChandler.addToCalendar(
      'Trip to ' + destination,
      Date.parse(startDate),
      Date.parse(endDate),
      destination,
      'Remember to pack everything and check weather forecast!',
    );

  return (
    <ScrollView style={styles.container}>
      <DetailsHeader
        image={imageUrl}
        startDate={startDate}
        endDate={endDate}
        author={author}
        username={username}
        addTripToCalendar={addTripToCalendar}
      />

      <View style={styles.tiles}>
        <NavigationButton
          navigation={navigation}
          to="Transport"
          tripId={selectedTrip.id}
          icon="flight"
        />
        <NavigationButton
          navigation={navigation}
          to="Accommodation"
          tripId={selectedTrip.id}
          cityCode={cityCode}
          startDate={startDate}
          endDate={endDate}
          icon="hotel"
        />

        <NavigationButton
          navigation={navigation}
          to="Map"
          tripId={selectedTrip.id}
          icon="map"
        />

        <NavigationButton
          navigation={navigation}
          to="Weather"
          tripId={selectedTrip.id}
          icon="cloud"
        />
        <NavigationButton
          navigation={navigation}
          to="Budget"
          tripId={selectedTrip.id}
          icon="account-balance-wallet"
        />
        <NavigationButton
          navigation={navigation}
          to="Notes"
          tripId={selectedTrip.id}
          icon="note"
        />
      </View>
    </ScrollView>
  );
};

export const tripDetailsOptions = (navigation) => ({
  headerTitle: navigation.route.params.destination,
});

export default memo(TripDetailsContainer);
