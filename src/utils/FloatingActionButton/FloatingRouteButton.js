import React, { memo } from 'react';
import { FAB } from 'react-native-paper';

import { styles } from './FloatingRouteButtonStyle.js';

const FloatingRouteButton = ({ onPress, loading, disabled }) => (
  <FAB
    style={styles.fab}
    small
    icon="map-outline"
    onPress={!disabled && onPress}
    loading={loading}
    animated
  />
);

export default memo(FloatingRouteButton);
