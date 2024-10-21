import {combineReducers} from 'redux';

import {
  HOMESCREEN_DATA,
  UPDATE_USER_PROFILE,
  UPDATE_STOCK,
  UPDATE_ICE_BREKRR_PROFILES,
  UPDATE_IDEA_BREKRR_PROFILES,
  LOG_IN_SENT,
  LOG_IN_FULFILLED,
  LOG_IN_REJECTED,
  UPDATE_CONTACTS,
  LOG_OUT,
  CURRENT_MODE,
  UPDATE_ICE_BREKRR_FRIENDS,
  UPDATE_IDEA_BREKRR_FRIENDS,
  UPDATE_LIKED_ICE_PROFILES,
  UPDATE_LIKED_IDEA_PROFILES,
  UPDATE_VEHICLES,
} from './actions';

const merge = (prev, next) => Object.assign({}, prev, next);

const userReducer = (
  state = {homeDetails: [], myDetails: null, stock: [], vehicles: []},
  action,
) => {
  switch (action.type) {
    case HOMESCREEN_DATA:
      return merge(state, {homeDetails: action.payload});
    case UPDATE_USER_PROFILE:
      return merge(state, {myDetails: action.payload});
    case UPDATE_STOCK:
      return merge(state, {myDetails: action.payload});
    case UPDATE_STOCK:
      return merge(state, {stock: action.payload});
    case UPDATE_VEHICLES:
      return merge(state, {vehicles: action.payload});
    case LOG_IN_REJECTED:
      return merge(state, {loginErr: action.payload});
    case LOG_OUT:
      return {};
    default:
      return state;
  }
};

const reducer = combineReducers({
  user: userReducer,
});

export default reducer;
