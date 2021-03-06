import axios from 'axios';
import { FIREBASE_URL } from 'react-native-dotenv';

import Note from 'models/Note';

export const SET_NOTES = 'SET_NOTES';
export const CREATE_NOTE = 'CREATE_NOTE';
export const DELETE_NOTE = 'DELETE_NOTE';
export const EDIT_NOTE = 'EDIT_NOTE';

const API_URL = FIREBASE_URL;

export const setNotes = (tripId, notes) => {
  return {
    notes,
    tripId,
    type: SET_NOTES,
  };
};

export const createNote = (tripId, newNote) => {
  return {
    newNote,
    tripId,
    type: CREATE_NOTE,
  };
};

export const deleteNote = (tripId, noteId) => {
  return {
    noteId,
    tripId,
    type: DELETE_NOTE,
  };
};

export const editNote = (tripId, updatedNote, noteId) => {
  return {
    noteId,
    tripId,
    type: EDIT_NOTE,
    updatedNote,
  };
};

export const fetchNotesRequest = (tripId) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;

    axios
      .get(`${API_URL}/Trips/${userId}/${tripId}/notes.json?auth=${token}`)
      .then((res) => res.data)
      .then((notes) => {
        const loadedNotes = [];
        for (const key in notes) {
          loadedNotes.push(
            new Note(
              key,
              notes[key].date,
              notes[key].category,
              notes[key].title,
              notes[key].description,
            ),
          );
        }

        dispatch(setNotes(tripId, loadedNotes));
      })
      .catch(() => {
        throw new Error('Something went wrong while getting your notes!');
      });
  };
};

export const deleteNoteRequest = (tripId, noteId) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;

    axios
      .delete(
        `${API_URL}/Trips/${userId}/${tripId}/notes/${noteId}.json?auth=${token}`,
      )
      .then(() => {
        dispatch(deleteNote(tripId, noteId));
      })
      .catch(() => {
        throw new Error(`Couldn't delete the note. Are you sure it exists?`);
      });
  };
};

export const createNoteRequest = (tripId, category, title, description) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const date = new Date();

    axios
      .post(`${API_URL}/Trips/${userId}/${tripId}/notes.json?auth=${token}`, {
        category,
        date,
        description,
        title,
      })
      .then((res) => [res.data, unescape(res.config.data)])
      .then((data) => {
        const noteId = data[0].name;
        const requestConfig = JSON.parse(data[1]);
        const newNote = new Note(
          noteId,
          requestConfig.date,
          requestConfig.category,
          requestConfig.title,
          requestConfig.description,
        );
        dispatch(createNote(tripId, newNote));
      })
      .catch(() => {
        throw new Error('Cannot create a note!');
      });
  };
};

export const editNoteRequest = (
  tripId,
  noteId,
  title,
  category,
  description,
) => {
  return async function (dispatch, getState) {
    const token = getState().auth.token;
    const userId = getState().auth.userId;
    const date = new Date();

    axios
      .put(
        `${API_URL}/Trips/${userId}/${tripId}/notes/${noteId}.json?auth=${token}`,
        {
          noteId,
          date,
          category,
          title,
          description,
        },
      )
      .then(() => {
        const updatedNote = new Note(
          noteId,
          date,
          category,
          title,
          description,
        );

        dispatch(editNote(tripId, updatedNote, noteId));
      })

      .catch(() => {
        throw new Error(`Couldn't edit note`);
      });
  };
};
