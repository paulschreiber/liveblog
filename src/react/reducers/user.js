import { lockEntry } from '../services/api';

export const initialState = {
  entries: {},
};

export const user = (state = initialState, action) => {
  switch (action.type) {
    case 'ENTRY_EDIT_OPEN':
      lockEntry(action.payload.entryId, true, action.payload.config, action.payload.config.nonce);
      return {
        ...state,
        entries: { ...state.entries, [action.payload.entryId]: { isEditing: true } },
      };

    case 'ENTRY_EDIT_CLOSE':
      lockEntry(action.payload.entryId, 0, action.payload.config, action.payload.config.nonce);
      return {
        ...state,
        entries: { ...state.entries, [action.payload.entryId]: { isEditing: false } },
      };

    default:
      return state;
  }
};
