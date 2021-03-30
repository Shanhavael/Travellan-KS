import React, { memo } from 'react';
import { FAB } from 'react-native-paper';

import { styles } from './FloatingDeleteButtonStyle.js';

const FloatingDeleteButton = ({ onPress, loading, disabled }) => (
  <FAB
    style={styles.fab}
    small
    icon="delete"
    onPress={!disabled && onPress}
    loading={loading}
    animated
  />
);

export default memo(FloatingDeleteButton);
