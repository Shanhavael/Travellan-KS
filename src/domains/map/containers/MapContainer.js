import Geolocation from '@react-native-community/geolocation';
import MapboxGL from '@react-native-mapbox-gl/maps';
import React, { useEffect, useState, useCallback } from 'react';
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
import fetchMapRoute from 'services/fetchMapRoute';
import Colors from 'constants/Colors';
import {
  Searchbar,
  FloatingDeleteButton,
  FloatingActionButton,
  FloatingRouteButton,
  FloatingChangeButton,
} from 'utils';
import { acc } from 'react-native-reanimated';

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
  const accommodation = useSelector(
    (state) =>
      state.trips.trips.find((item) => item.id === tripId).accommodation,
  );
  const startDate = new Date(selectedTrip.startDate);
  const endDate = new Date(selectedTrip.endDate);

  const [addingMarkerActive, setAddingMarkerActive] = useState(false);
  const [deletingMarkerActive, setDeletingMarkerActive] = useState(false);
  const [searchingActive, setSearchingActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [markerTitle, setMarkerTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRoute, setIsRoute] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isAcc, setIsAcc] = useState(false);
  const [error, setError] = useState(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState([]);
  const [mapCategory, setMapCategory] = useState('Entire trip');
  const [routeLine, setRouteLine] = useState([]);
  const [changingActive, setChangingActive] = useState(false);
  const [fileteredMarkers, setFilteredMarkers] = useState(markers);
  const [isMoving, setIsMoving] = useState(false);

  const extractRegion = () =>
    selectedTrip.map
      ? selectedTrip.map.region
        ? selectedTrip.map.region
        : selectedTrip.region
      : selectedTrip.region;

  const renderMarkers = () =>
    !!fileteredMarkers &&
    fileteredMarkers.map((marker) => (
      <MapboxGL.PointAnnotation
        id={`marker-${marker.id}`}
        coordinate={[marker.lat, marker.lon]}
        onDeselected={(event) => handleDeselectMarker(event, marker.title)}
        onSelected={(event) => handleSelectMarker(event, marker.title)}
      >
        <MapboxGL.Callout title={marker.title} />
      </MapboxGL.PointAnnotation>
    ));

  const filterMarkers = () => {
    if (mapCategory !== 'Entire trip') {
      setFilteredMarkers(
        markers.filter((item) => item.category === mapCategory),
      );
    } else {
      setFilteredMarkers(markers);
    }
  };

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
          console.log(startDate.getMonth() + 1, endDate.getDate());
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

  const handleSelectMarker = (event, title) => {
    setIsSelected(true);
    setSelectedEvent(event);
    setSelectedTitle(title);
  };

  const handleDeselectMarker = () => {
    setIsSelected(false);
    setSelectedEvent('');
    setSelectedTitle('');
  };

  const changingHandler = () => {
    setChangingActive(!changingActive);
    filterMarkers();
    console.log(mapCategory, fileteredMarkers);
  };

  const categoryHandler = async (category) => {
    setMapCategory(category);
    addAccommodation();
    filterMarkers();
    setIsRoute(false);
    changingHandler();
  };

  const categories = [
    { id: '1', title: 'Entire trip' },
    { id: '2', title: 'Day 1' },
    { id: '3', title: 'Day 2' },
    { id: '4', title: 'Day 3' },
    { id: '5', title: 'Day 4' },
    { id: '6', title: 'Day 5' },
    { id: '7', title: 'Day 6' },
    { id: '8', title: 'Day 7' },
  ];

  const handleDeleteMarker = (event, title) => {
    Alert.alert(
      `Delete ${title}`,
      'Are you sure?',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => markerOnPressHandler(event),
          text: 'OK',
        },
      ],
      { cancelable: true },
    );
  };

  const handleMovingMarker = (event, title, category) => {
    Alert.alert(
      `Move ${title} to ${category}`,
      'Are you sure?',
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          onPress: () => markerOnPressHandler(event),
          text: 'OK',
        },
      ],
      { cancelable: true },
    );
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

  const moveCategory = async (category) => {
    handleMovingMarker(selectedEvent, selectedTitle, category);
    const [latitude, longitude] = selectedEvent.geometry.coordinates;
    console.log('creating');
    createMarker(longitude, latitude, selectedTitle, category);
    setIsMoving(false);
    setIsRoute(false);
    handleDeselectMarker();
  };

  const markerOnPressHandler = async (coords) => {
    const [latitude, longitude] = coords.geometry.coordinates;
    const marker = markers.filter(
      (item) => item.lat === latitude && item.lon === longitude,
    )[0];
    setMarkers(markers.filter((item) => item.id !== marker.id));
    handleDeselectMarker();
    filterMarkers();
  };

  const mapOnPressHandler = async (event) => {
    const [latitude, longitude] = event.geometry.coordinates;
    if (addingMarkerActive) {
      if (markerTitle !== '') {
        const title = markerTitle;
        createMarker(longitude, latitude, title, mapCategory);
        setMarkerTitle('');
        setAddingMarkerActive(false);
        filterMarkers();
      } else {
        setError('Enter the title');
      }
    }
  };

  const createMarker = (longitude, latitude, title, category) => {
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
              category,
            ),
          ]
        : [
            new PointOfInterest(
              new Date().getTime().toString(),
              new Date().toString(),
              latitude,
              longitude,
              title,
              category,
            ),
          ],
    );
  };

  const addAccommodation = () => {
    if (!isAcc) {
      for (const key in accommodation) {
        createMarker(
          accommodation[key].location.latitude,
          accommodation[key].location.longitude,
          accommodation[key].name,
          mapCategory,
        );
      }
      setIsAcc(true);
    }
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
    createMarker(longitude, latitude, title, mapCategory);
    currentRegion.longitude = latitude;
    currentRegion.latitude = longitude;
    setSearchQuery('');
    setIsChoosing(false);
    setSearchAnswer([]);
  };

  const showRouteHandler = async () => {
    if (!isRoute) {
      let cords = '';
      !!fileteredMarkers &&
        fileteredMarkers.map(
          (marker) => (cords += ';' + marker.lat + ',' + marker.lon),
        );
      cords = cords.substring(1);
      const [line] = await fetchMapRoute(cords);
      setRouteLine(line.geometry);
    }
    setIsRoute(!isRoute);
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
          centerCoordinate={[currentRegion.longitude, currentRegion.latitude]}
        />
        {addAccommodation()}
        {renderMarkers()}
        <MapboxGL.UserLocation />
        {isRoute && (
          <MapboxGL.ShapeSource id="line1" shape={routeLine}>
            <MapboxGL.LineLayer id="linelayer1" style={{ lineColor: 'red' }} />
          </MapboxGL.ShapeSource>
        )}
      </MapboxGL.MapView>
      <FloatingActionButton
        loading={isLoading}
        disabled={isLoading}
        onPress={() => activityHandler('adding')}
      />
      <FloatingRouteButton
        loading={isLoading}
        disabled={isLoading}
        onPress={() => showRouteHandler()}
      />

      {isSelected && (
        <FloatingDeleteButton
          loading={isLoading}
          disabled={isLoading}
          onPress={() => handleDeleteMarker(selectedEvent, selectedTitle)}
        />
      )}
      {isSelected && (
        <FloatingChangeButton
          loading={isLoading}
          disabled={isLoading}
          onPress={() => setIsMoving(true)}
        />
      )}

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
        changingActive={changingActive}
        changingHandler={() => changingHandler()}
        categories={categories}
        categoryHandler={(text) => categoryHandler(text)}
        mapCategory={mapCategory}
        isMoving={isMoving}
        moveCategory={(text) => moveCategory(text)}
      />
    </View>
  );
};

export default MapContainer;
