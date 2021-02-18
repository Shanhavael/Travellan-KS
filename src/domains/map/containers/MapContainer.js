import Geolocation from '@react-native-community/geolocation';
import MapboxGL from '@react-native-mapbox-gl/maps';
import React, { useEffect, useState } from 'react';
import { MAPBOX_API_KEY } from 'react-native-dotenv';
import {
  FlatList,
  Alert,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import PointOfInterest from 'models/PointOfInterest';
import { Toolbar } from '../components';
import { fetchMapRequest, patchMapRequest } from 'actions/mapActions';
import { styles } from './MapContainerStyle';
import fetchMapSearch from 'services/fetchMapSearch';
import Colors from 'constants/Colors';
import { Searchbar, FloatingActionButton } from 'utils';

MapboxGL.setAccessToken(MAPBOX_API_KEY);
MapboxGL.setConnected(true);

const MapContainer = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const tripId = route.params.tripId;
  const selectedTrip = useSelector((state) =>
    state.trips.trips.find((item) => item.id === tripId),
  );

  const [currentPosition, setCurrentPosition] = useState(selectedTrip.region);
  const [currentRegion, setCurrentRegion] = useState(selectedTrip.region);
  const [markers, setMarkers] = useState(
    selectedTrip.map ? selectedTrip.map.nodes : [],
  );
  const [addingMarkerActive, setAddingMarkerActive] = useState(false);
  const [deletingMarkerActive, setDeletingMarkerActive] = useState(false);
  const [searchingActive, setSearchingActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [markerTitle, setMarkerTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [error, setError] = useState(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState([]);

  const extractRegion = () =>
    selectedTrip.map
      ? selectedTrip.map.region
        ? selectedTrip.map.region
        : selectedTrip.region
      : selectedTrip.region;

  const renderMarkers = () =>
    !!markers &&
    markers.map((marker) => (
      <MapboxGL.PointAnnotation
        id={`marker-${marker.id}`}
        coordinate={[marker.lat, marker.lon]}
        onDeselected={(event) => handleDeleteMarker(event, marker.title)}
        selected={isSelected}
      >
        <MapboxGL.Callout title={marker.title} />
      </MapboxGL.PointAnnotation>
    ));

  const currentRegionHandler = (region) => {
    currentRegion.longitude = region.geometry.coordinates[0];
    currentRegion.latitude = region.geometry.coordinates[1];
  };

  const activityHandler = (type) => {
    switch (type) {
      case 'adding':
        if (!addingMarkerActive) {
          setDeletingMarkerActive(false);
          setSearchingActive(false);
          console.log(markers);
        } else {
          setMarkerTitle('');
        }
        setAddingMarkerActive(!addingMarkerActive);
        break;
      case 'deleting':
        if (!deletingMarkerActive) {
          setAddingMarkerActive(false);
          setSearchingActive(false);
          setMarkerTitle('');
        }
        setDeletingMarkerActive(!deletingMarkerActive);
        break;
      case 'searching':
        if (!searchingActive) {
          setDeletingMarkerActive(false);
          setAddingMarkerActive(false);
        } else {
          setSearchQuery('');
          setSearchAnswer([]);
        }
        setSearchingActive(!searchingActive);
        break;
    }
  };

  const handleDeleteMarker = (event, title) => {
    if (deletingMarkerActive) {
      setIsSelected(false);
      Alert.alert(
        `Delete ${title}`,
        'Are you sure?',
        [
          {
            onPress: () => setIsSelected(false),
            style: 'cancel',
            text: 'Cancel',
          },
          {
            onPress: () => markerOnPressHandler(event),
            text: 'OK',
          },
        ],
        { cancelable: true, onDismiss: () => setIsSelected(false) },
      );
    }
  };

  const onExitHandler = async () => {
    setIsLoading(true);
    try {
      await dispatch(patchMapRequest(tripId, markers, currentRegion)).then(
        () => {
          setIsLoading(false);
          navigation.goBack();
        },
      );
    } catch {
      setError('Something went wrong. Check your internet connection!');
    }
  };

  const markerOnPressHandler = async (coords) => {
    const [latitude, longitude] = coords.geometry.coordinates;
    const marker = markers.filter(
      (item) => item.lat === latitude && item.lon === longitude,
    )[0];
    deletingMarkerActive &&
      setMarkers(markers.filter((item) => item.id !== marker.id));
  };

  const mapOnPressHandler = async (event) => {
    const [latitude, longitude] = event.geometry.coordinates;
    if (addingMarkerActive) {
      if (markerTitle !== '') {
        const title = markerTitle;
        createMarker(longitude, latitude, title);
        setMarkerTitle('');
      } else {
        setError('Enter the title');
      }
    }
  };

  const createMarker = (longitude, latitude, title) => {
    setMarkers(
      markers
        ? [
            ...markers,
            new PointOfInterest(
              new Date().getTime().toString(),
              new Date().toString(),
              latitude,
              longitude,
              title,
            ),
          ]
        : [
            new PointOfInterest(
              new Date().getTime().toString(),
              new Date().toString(),
              latitude,
              longitude,
              title,
            ),
          ],
    );
  };

  const searchHandler = async () => {
    if (searchQuery.length > 3) {
      const longitude = currentRegion.longitude;
      const latitude = currentRegion.latitude;

      setIsSearching(true);
      const answer = await fetchMapSearch(searchQuery, longitude, latitude);
      setSearchAnswer(answer);
      setIsSearching(false);
    } else {
      setSearchAnswer([]);
    }
  };

  const addSearchMarker = (longitude, latitude, title) => {
    createMarker(longitude, latitude, title);
    currentRegion.longitude = latitude;
    currentRegion.latitude = longitude;
    setSearchQuery('');
    setIsChoosing(false);
    setSearchAnswer([]);
    // this._map.flyTo([longitude, latitude]);
  };

  renderFooter = () => {
    if (!isSearching) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: '#CED0CE',
        }}
      >
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  useEffect(() => {
    try {
      // dispatch(fetchMapRequest());
    } catch {
      setError('Something went wrong!');
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setCurrentPosition({
          ...currentPosition,
          latitude,
          longitude,
        });
      },
      (err) => setError(err.message),
      { maximumAge: 1000, timeout: 20000 },
    );
  }, [currentPosition, dispatch]);

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        ref={(c) => (this._map = c)}
        style={styles.map}
        styleURL="mapbox://styles/travellan/ckju6y3ae119l19o6od0j9wi5"
        onLongPress={(event) => mapOnPressHandler(event)}
        onRegionDidChange={(region) => currentRegionHandler(region)}
      >
        <MapboxGL.Camera
          zoomLevel={10}
          centerCoordinate={
            // extractRegion().geometry.coordinates - left for further debugging
            [currentRegion.longitude, currentRegion.latitude]
          }
        />
        {renderMarkers()}
        <MapboxGL.UserLocation />
      </MapboxGL.MapView>
      <FloatingActionButton
        loading={isLoading}
        disabled={isLoading}
        onPress={() => activityHandler('adding')}
      />
      <Toolbar
        styles={styles}
        navigation={navigation}
        addingMarkerActive={addingMarkerActive}
        addingActivityHandler={() => activityHandler('adding')}
        markerTitle={markerTitle}
        setMarkerTitle={(text) => setMarkerTitle(text)}
        deletingMarkerActive={deletingMarkerActive}
        deletingActivityHandler={() => activityHandler('deleting')}
        searchingActive={searchingActive}
        searchingActivityHandler={() => activityHandler('searching')}
        setSearchQuery={(text) => setSearchQuery(text)}
        searchQuery={searchQuery}
        error={error}
        setError={setError}
        isLoading={isLoading}
        onExitHandler={onExitHandler}
        searchHandler={(event) => searchHandler(event)}
        isChoosing={isChoosing}
        setIsChoosing={setIsChoosing}
        searchAnswer={searchAnswer}
        addSearchMarker={(longitude, latitude, title) =>
          addSearchMarker(longitude, latitude, title)
        }
      />
    </View>
  );
};

export default MapContainer;
