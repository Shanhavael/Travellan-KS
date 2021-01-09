import React, { useCallback, useEffect, useReducer, useState } from 'react';
import SplashScreen from 'react-native-splash-screen';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

import * as userActions from 'actions/userActions';
import Colors from 'constants/Colors';
import Input from '../components/input/Input';
import { styles } from './AuthenticationContainerStyle';

const FORM_INPUT_UPDATE = 'FORM_INPUT_UPDATE';

const formReducer = (state, action) => {
  if (action.type === FORM_INPUT_UPDATE) {
    const updatedValues = {
      ...state.inputValues,
      [action.input]: action.value,
    };
    const updatedValidities = {
      ...state.inputValidities,
      [action.input]: action.isValid,
    };
    let updatedFormIsValid = true;
    for (const key in updatedValidities) {
      updatedFormIsValid = updatedFormIsValid && updatedValidities[key];
    }
    return {
      formIsValid: updatedFormIsValid,
      inputValidities: updatedValidities,
      inputValues: updatedValues,
    };
  }
  return state;
};

const AuthenticationContainer = (props) => {
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();
  const [formState, dispatchFormState] = useReducer(formReducer, {
    formIsValid: false,
    inputValidities: {
      email: false,
      password: false,
    },
    inputValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    SplashScreen.hide();
    if (error) {
      Alert.alert('An error occured!', error, [{ text: 'Okay' }]);
    }
  }, [error]);

  const authHandler = async () => {
    let action;
    action = userActions.loginRequest(
      formState.inputValues.email,
      formState.inputValues.password,
    );
    setError(null);
    setIsLoading(true);

    try {
      await dispatch(action);
      props.navigation.navigate('My trips');
    } catch (err) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  const inputChangeHandler = useCallback(
    (inputIdentifier, inputValue, inputValidity) => {
      dispatchFormState({
        input: inputIdentifier,
        isValid: inputValidity,
        type: FORM_INPUT_UPDATE,
        value: inputValue,
      });
    },
    [dispatchFormState],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.screen}
    >
      <View style={styles.authContainer}>
        <ScrollView>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Image
              style={{ height: 150, resizeMode: 'stretch', width: 150 }}
              source={require('assets/images/logo.png')}
            />
          </View>
          <Input
            style={[styles.input]}
            id="email"
            label="E-mail"
            keyboardType="email-address"
            required
            email
            autoCapitalize="none"
            errorText="Please enter a valid email address."
            onInputChange={inputChangeHandler}
            initialValue=""
          />
          <Input
            styles={styles.input}
            id="password"
            label="Password"
            keyboardType="default"
            secureTextEntry
            required
            minLength={5}
            autoCapitalize="none"
            errorText="Please enter a valid password (at least 5 characters)"
            onInputChange={inputChangeHandler}
            initialValue=""
          />
          <View style={styles.actionsContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <TouchableOpacity
                style={[styles.buttonContainer, { marginRight: 10 }]}
                onPress={authHandler}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                props.navigation.navigate('Register');
              }}
            >
              <Text style={styles.buttonText}>Switch to Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export const authOptions = {
  headerShown: false,
};

export default AuthenticationContainer;
