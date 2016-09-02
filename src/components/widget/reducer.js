import * as ACTIONS from './actions';

export default function (state = {}, action) {
  switch (action.type) {
    case ACTIONS.ERROR:
      return { ...state, loading: null, error: {
        message: action.err.message,
        selector: action.selector
      }};
    case ACTIONS.LOADING: {
      let error = state.error && { ...state.error };

      if (error && error.selector === action.selector) {
        error = null;
      }

      return { ...state, error: error, loading: action.selector };
    }
    case ACTIONS.INPUT_WAYPOINT:
      return { ...state, [action.name]: action.text };
    case ACTIONS.SET_WAYPOINT:
      return { ...state, loading: null,
        [action.name]: action.waypoint.place_name,
        waypoints: {
          ...state.waypoints,
          [action.name]: action.waypoint
        }
      };
    case ACTIONS.SET_ROUTE:
      return { ...state, route: action.route, loading: null };
    case ACTIONS.SET_BASELINE:
      return { ...state, baseline: action.baseline };
    default:
      return state;
  }
}
