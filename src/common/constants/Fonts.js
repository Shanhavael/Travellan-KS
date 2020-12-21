/**
 * this file contains font sizes that are global to the application
 */
import { StyleSheet } from 'react-native';

const size = {
  h1: 20,
  h2: 18,
  h3: 16,
  input: 14,
  regular: 14,
  medium: 12,
  small: 10,
};

export default StyleSheet.create({
  h1: {
    fontSize: size.h1,
  },
  h2: {
    fontSize: size.h2,
  },
  h3: {
    fontSize: size.h3,
  },
  normal: {
    fontSize: size.regular,
  },
});
