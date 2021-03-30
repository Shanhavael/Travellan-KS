import React, { memo } from 'react';
import { FAB } from 'react-native-paper';

import { styles } from './FloatingChangeButtonStyle.js';

const FloatingChangeButton = ({ onPress, loading, disabled }) => (
  <FAB
    style={styles.fab}
    small
    icon="format-list-bulleted"
    onPress={!disabled && onPress}
    loading={loading}
    animated
  />
);

export default memo(FloatingChangeButton);
