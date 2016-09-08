import MapboxClient from 'mapbox';
import continents from './continents';
import destinations from './destinations';
import { uid, getWaypointDistance } from '../utils';

const client = new MapboxClient(process.env.MAPBOX_ACCESS_TOKEN);

export const ERROR = 'ERROR';
export function error(err, selector = null) {
  return { type: ERROR, err, selector };
}

export const LOADING = 'LOADING';
export function loading(selector) {
  return { type: LOADING, selector };
}

export const INPUT_WAYPOINT = 'INPUT_WAYPOINT';
export function inputWaypoint(text, name) {
  return { type: INPUT_WAYPOINT, text, name };
}

export function findWaypoint(text, name, sender) {
  return (dispatch, getState) => {
    const waypoint = getState().map.waypoints[name];

    if (!text.trim() || waypoint && waypoint.place_name === text) {
      return;
    }

    dispatch(loading(sender));

    return new Promise((resolve, reject) => {
      client.geocodeForward(text, { types: 'place,region' }, (err, resp) => {
        if (err) { return reject(dispatch(error(error, sender))); }
        if (!resp.features.length) {
          return reject(dispatch(error(new Error('No results found'), sender)));
        }
        resolve(dispatch(setWaypoint(resp.features[0], name)));
      });
    });
  };
}

export const SET_WAYPOINT = 'SET_WAYPOINT';
export function setWaypoint(waypoint, name) {
  return { type: SET_WAYPOINT, waypoint, name };
}

export function findRoute(from, to, sender) {
  return dispatch => {
    const [ fromLong, fromLat ] = from.geometry.coordinates;
    const [ toLong, toLat ] = to.geometry.coordinates;

    dispatch(loading(sender));

    return new Promise((resolve, reject) => {
      client.getDirections([
        { latitude: fromLat, longitude: fromLong },
        { latitude: toLat, longitude: toLong }
      ], (err, resp) => {
        if (err) { return reject(dispatch(error(err, sender))); }
        if (!resp.routes.length) {
          return reject(dispatch(error(new Error('Could not route!'), sender)));
        }
        resolve(dispatch(setRoute(resp.routes[0])));
      });
    });
  };
}

export const SET_ROUTE = 'SET_ROUTE';
export function setRoute(route) {
  return { type: SET_ROUTE, route: { ...route, id: uid('route')} };
}

export const SET_BASELINE = 'SET_BASELINE';
export function setBaseline(baseline) {
  return { type: SET_BASELINE, baseline };
}

export function setDefaultWaypoints(sender) {
  return dispatch => {
    dispatch(loading(sender));

    const faux = {
      'SA': '139.82.255.255',
      'EU': '85.229.123.180'
    };

    return fetch(`//freegeoip.net/json/${ faux.EU/*window.CLIENT_IP*/ }`)
      .then(resp => resp.json())
      .catch(err => dispatch(error(err, sender)))
      .then(data => {
        const { latitude, longitude } = data;
        const continent = continents[data.country_code];

        return new Promise((resolve, reject) => {
          client.geocodeReverse(
            { longitude, latitude },
            { types: 'region' },
            (err, resp) => {
              if (err) { return reject(dispatch(error(error, sender))); }
              if (!resp.features.length) {
                return reject(
                  dispatch(error(new Error('No results found'), sender))
                );
              }

              const waypoint = resp.features[0];

              /**
               * Set the default destination for the origin continent
               */

              if (destinations[continent].length) {
                const distance = getWaypointDistance(waypoint);
                const destinationsByDistance = destinations[continent]
                  .filter(destination => distance(destination) > 1000)
                  .sort((a, b) => distance(a) < distance(b) ? 1 : -1);

                dispatch(setWaypoint(destinationsByDistance[0], 'to'));
              }

              /**
               * Set `from` waypoint
               */

              resolve(dispatch(setWaypoint(waypoint, 'from')));
            }
          );
        });
      });
  };
}
