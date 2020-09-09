import React from 'react';
import {View, TextInput} from 'react-native';
import Search from 'map/components/search/Search';

const Input = (props) => {
  switch (props.type) {
    case 'search':
      return (
        <Search
          styles={props.styles}
          setPlaceToSearch={props.setPlaceToSearch}
          placeToSearch={props.placeToSearch}
          autocomplete={props.autocomplete}
          showAutocomplete={props.showAutocomplete}
          setShowAutocomplete={props.setShowAutocomplete}
          focusedPlace={props.focusedPlace}
          setFocusedPlace={props.setFocusedPlace}
        />
      );
    case 'title':
      return (
        <View style={{alignItems: 'center'}}>
          <View style={props.styles.inputContainer}>
            <TextInput
              placeholder="Add title"
              placeholderTextColor={'grey'}
              style={props.styles.input}
              onChangeText={(text) => props.setMarkerTitle(text)}
              value={props.markerTitle}
            />
          </View>
        </View>
      );
  }
};

export default Input;