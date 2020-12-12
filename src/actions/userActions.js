import AsyncStorage from '@react-native-async-storage/async-storage';
import {MAIN_FIREBASE_API} from 'react-native-dotenv';

export const AUTHENTICATE = 'AUTHENTICATE';

const API_KEY = MAIN_FIREBASE_API;

export const authenticate = (userId, token) => {
  return {type: AUTHENTICATE, userId: userId, token: token};
};

export const signup = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      },
    );
    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_EXISTS') {
        message = 'This email exists already!';
      }
      throw new Error(message);
    }
    const resData = await response.json();
    dispatch(authenticate(resData.localId, resData.idToken));
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn, 10) * 1000,
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

export const login = (email, password) => {
  return async (dispatch) => {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          returnSecureToken: true,
        }),
      },
    );
    if (!response.ok) {
      const errorResData = await response.json();
      const errorId = errorResData.error.message;
      let message = 'Something went wrong!';
      if (errorId === 'EMAIL_NOT_FOUND') {
        message = 'Something went wrong. Try Again';
      } else if (errorId === 'INVALID_PASSWORD') {
        message = 'Something went wrong. Try Again';
      }
      throw new Error(message);
    }
    const resData = await response.json();
    dispatch(authenticate(resData.localId, resData.idToken));
    const expirationDate = new Date(
      new Date().getTime() + parseInt(resData.expiresIn, 10) * 1000,
    );
    saveDataToStorage(resData.idToken, resData.localId, expirationDate);
  };
};

const saveDataToStorage = (token, userId, expirationDate) => {
  AsyncStorage.setItem(
    'userData',
    JSON.stringify({
      token: token,
      userId: userId,
      expiryDate: expirationDate.toISOString(),
    }),
  );
};
