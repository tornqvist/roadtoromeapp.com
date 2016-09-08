import yo from 'yo-yo';
import mapboxgl from 'mapbox-gl';
import geojsonExtent from 'geojson-extent';
import { uid, debounce } from '../utils';

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;

const id = uid();
const BASE_OFFSET = -200;
const THRESHOLD = 768;

export function createView() {
  let map, container;
  const onload = route => node => {
    container = node;
    map = new mapboxgl.Map({
      container,
      style: 'mapbox://styles/tornqvist/cirykn4yx0043gum6i942t6gz',
      interactive: false,
      center: [24.757, 45.169],
      zoom: 4
    });

    map.once('load', () => addRoute(route));

    window.addEventListener('resize', debounce(() => {
      map.fitBounds(map.getBounds(), getBoundsOptions());
    }, 200));
  };

  function getBoundsOptions() {
    const width = window.innerWidth;
    const { offsetWidth, offsetHeight } = container;
    const offsetX = width > THRESHOLD ? BASE_OFFSET * (offsetWidth / THRESHOLD) : 0;
    const padding = width > THRESHOLD ? 80 : 50;

    return { padding, offset: [ offsetX, 0 ] };
  }

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
      getBoundsOptions()
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
