import React from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';

import ToolbarButton from './toolbarButton/ToolbarButton';
import { Searchbar } from 'utils';
import { styles } from './ToolbarStyle';

const Toolbar = ({
  addingMarkerActive,
  searchingActive,
  searchingActivityHandler,
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
  changingActive,
  changingHandler,
  categories,
  categoryHandler,
  mapCategory,
  isMoving,
  moveCategory,
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
      <TouchableOpacity
        isLoading={isLoading}
        loader={false}
        handler={changingActive}
        onPress={changingHandler}
      >
        <Text style={styles.text}>{mapCategory}</Text>
      </TouchableOpacity>
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

    {changingActive && (
      <View>
        <FlatList
          data={categories}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          ListFooterComponent={renderFooter()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResult}
              onPress={() => {
                categoryHandler(item.title);
              }}
            >
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    )}

    {isMoving && (
      <View>
        <FlatList
          data={categories}
          ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
          ListFooterComponent={renderFooter()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResult}
              onPress={() => {
                moveCategory(item.title);
              }}
            >
              <Text style={styles.text}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
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
