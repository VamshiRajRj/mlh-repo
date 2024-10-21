// action types
export const HOMESCREEN_DATA = 'HOMESCREEN_DATA';
export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';
export const UPDATE_STOCK = 'UPDATE_STOCK';
export const UPDATE_ICE_BREKRR_PROFILES = 'UPDATE_ICE_BREKRR_PROFILES';
export const LOG_IN_SENT = 'LOG_IN_SENT';
export const LOG_IN_FULFILLED = 'LOG_IN_FULFILLED';
export const LOG_IN_REJECTED = 'LOG_IN_REJECTED';
export const UPDATE_CONTACTS = 'UPDATE_CONTACTS';
export const LOG_OUT = 'LOG_OUT';
export const CURRENT_MODE = 'CURRENT_MODE';
export const UPDATE_ICE_BREKRR_FRIENDS = 'UPDATE_ICE_BREKRR_FRIENDS';
export const UPDATE_IDEA_BREKRR_FRIENDS = 'UPDATE_IDEA_BREKRR_FRIENDS';
export const UPDATE_LIKED_ICE_PROFILES = 'UPDATE_LIKED_ICE_PROFILES';
export const UPDATE_VEHICLES = 'UPDATE_VEHICLES';

// action creators
export const updateUser = update => ({
  type: UPDATE_USER_PROFILE,
  payload: update,
});

export const updateVehicles = update => ({
  type: UPDATE_VEHICLES,
  payload: update,
});

export const updateHomeData = data => ({
  type: HOMESCREEN_DATA,
  payload: data,
});

export const updateStock = stock => ({
  type: UPDATE_STOCK,
  payload: stock,
});

export const logout = () => ({
  type: LOG_OUT,
});
