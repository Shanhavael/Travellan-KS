import { StyleSheet } from 'react-native';
import Colors from 'constants/Colors';

export const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    margin: 20,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: '12%',
    paddingHorizontal: '5%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  qrstyle: {
    height: '100%',
    width: '100%',
    borderColor: Colors.white,
    borderWidth: 2,
    zIndex: 5,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  containerR: {
    flex: 1,
    backgroundColor: Colors.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  icon: {
    fontSize: 40,
    color: Colors.text,
  },
});
