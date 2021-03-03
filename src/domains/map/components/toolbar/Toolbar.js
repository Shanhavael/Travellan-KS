import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';

import ToolbarButton from './toolbarButton/ToolbarButton';
import { Searchbar } from 'utils';
import { styles } from './ToolbarStyle';

const Toolbar = ({
  addingActivityHandler,
  addingMarkerActive,
  searchingActive,
  searchingActivityHandler,
  deletingActivityHandler,
  deletingMarkerActive,
  isLoading,
  markerTitle,
  onExitHandler,
  setMarkerTitle,
  searchQuery,
  isChoosing,
  setSearchQuery,
  searchHandler,
  setIsChoosing,
  searchAnswer,
  addSearchMarker,
}) => (
  <View style={styles.overlay}>
    <View style={styles.actionBar}>
      <ToolbarButton
        icon="arrow-left"
        isLoading={isLoading}
        loader={true}
        handler={false}
        onPress={onExitHandler}
      />
      {/* <ToolbarButton
        icon="map-marker-plus"
        isLoading={isLoading}
        loader={false}
        handler={addingMarkerActive}
        onPress={addingActivityHandler}
      /> */}
      <ToolbarButton
        icon="map-marker-minus"
        isLoading={isLoading}
        loader={false}
        handler={deletingMarkerActive}
        onPress={deletingActivityHandler}
      />
      <ToolbarButton
        icon="map-search"
        isLoading={isLoading}
        loader={false}
        handler={searchingActive}
        onPress={searchingActivityHandler}
      />
    </View>

    {addingMarkerActive && (
      <Searchbar
        icon="map-marker-question"
        placeholder={addingMarkerActive && 'Enter marker title'}
        value={markerTitle}
        onChangeText={(text) => setMarkerTitle(text)}
      />
    )}

    {searchingActive && (
      <View>
        <Searchbar
          icon="map-marker-question"
          placeholder={searchingActive && 'Search by name/adress'}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchHandler();
            setIsChoosing(true);
          }}
        />
        {isChoosing && (
          <View>
            <FlatList
              data={(searchAnswear = searchAnswer)}
              ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              ListFooterComponent={renderFooter()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.searchResult}
                  onPress={() => {
                    const [latitude, longitude] = item.geometry.coordinates;
                    addSearchMarker(longitude, latitude, item.place_name);
                  }}
                >
                  <Text style={styles.text}>{item.place_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>
    )}
  </View>
);

export default Toolbar;
