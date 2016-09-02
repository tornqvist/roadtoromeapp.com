import yo from 'yo-yo';
import mapboxgl from 'mapbox-gl';
import geojsonExtent from 'geojson-extent';
import { uid } from '../utils';

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const id = uid();

export function createView() {
  let map;
  const onload = route => node => {
    map = new mapboxgl.Map({
      container: node,
      style: 'mapbox://styles/tornqvist/cirykn4yx0043gum6i942t6gz',
      interactive: false,
      center: [24.757, 45.169],
      zoom: 4
    });

    map.once('load', () => addRoute(route));
  };

  function addRoute(route) {
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: { ...route.geometry }
    };
    const [ west, south, east, north ] = geojsonExtent(geojson);

    map.addSource(route.id, { type: 'geojson', data: geojson });
    map.fitBounds(
      [[ west, south ], [ east, north ]],
      { padding: 80, offset: [ -200, 0 ] }
    );
    map.addLayer({
      'id': route.id,
      'type': 'line',
      'source': route.id,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#63BEF5',
        'line-width': 8
      }
    });

  }

  return (state, dispatch, previous) => {
    if (!Object.keys(state.map.route).length) {
      return yo`
        <div class="Map" id=${ id('container') }>
          <img class="Map-backdrop" width="0" height="0" src="backdrop.jpg" alt="Map of Europe">
          <div id=${ id('cover') } class="Map-cover"></div>
        </div>
      `;
    }

    if (!Object.keys(previous.map.route).length) {
      return yo`
        <div class="Map" role="application" id=${ id('container') }>
          <img class="Map-backdrop" width="0" height="0" src="backdrop.jpg" alt="Map of Europe">
          <div id=${ id('map') } class="Map-canvas" onload=${ onload(state.map.route) }></div>
          <div id=${ id('cover') } class="Map-cover is-fading"></div>
        </div>
      `;
    }

    if (state.map.route.id !== previous.map.route.id) {
      map.removeLayer(previous.map.route.id);
      map.removeSource(previous.map.route.id);
      addRoute(state.map.route);
    }

    return document.querySelector(`#${ id('container') }`);
  };
}

export function find(root) {
  return root.querySelector('#map');
}
