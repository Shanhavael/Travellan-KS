import { StyleSheet } from 'react-native';

import Colors from 'constants/Colors';

export const homeStyle = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: '5%',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    margin: '2%',
    padding: '4%',
    borderRadius: 25,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
  },
  header: {
    fontSize: 18,
  },
  label: {
    fontSize: 16,
  },
  text: {
    color: Colors.text,
  },
  smallMarginTop: {
    marginTop: '2%',
  },
  bigMarginTop: {
    marginTop: '5%',
  },
});
