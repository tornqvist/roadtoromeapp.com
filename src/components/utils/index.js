const MATCH_NODE = /^([a-z]{1}[\w-]*)/;
const MATCH_ID = /(?:#([a-z]{1}[\w-]*))/;
const MATCH_CLASSES = /(?:\.([a-z]{1}[\w-]*))/g;
const MATCH_ATTRS = /(?:\[(?:([a-z]{1}[\w-]*)(?:="?([a-z]{1}[\w-]*)"?)?)\])/g;
const MATCH_ATTR = new RegExp(MATCH_ATTRS.source);

export function identifier(str) {
  let matches;
  const props = { attrs: {} };

  if ((matches = str.match(MATCH_NODE))) {
    props.node = matches[1];
  }

  if ((matches = str.match(MATCH_ID))) {
    props.id = matches[1];
  }

  if ((matches = str.match(MATCH_CLASSES))) {
    props.classes = matches.map(match => match.replace(/^\./, ''));
  }

  if ((matches = str.match(MATCH_ATTRS))) {
    matches.forEach(pair => {
      const match = pair.match(MATCH_ATTR);
      props.attrs[match[1]] = match[2] || true;
    });
  }

  return {
    ...props,

    selector: str,

    matches(selector) {
      if (!selector) { return false; }
      if (selector === str) { return true; }

      let matches = false;
      const target = identifier(selector);

      if (target.node && props.node) {
        matches = matches || (target.node === props.node);
      }

      if (target.id && props.id) {
        matches = matches || (target.id === props.id);
      }

      if (target.classes && props.classes) {
        matches = matches || target.classes.reduce((result, className) => {
          return result || props.classes.includes(className);
        }, matches);
      }

      if (target.attrs && props.attrs) {
        matches = matches || Object.keys(target.attrs).reduce((result, attr) => {
          return matches || (props.attrs[attr] === target.attrs[attr]);
        }, matches);
      }

      return matches;
    }
  };
}

export function output(condition, renderer) {
  if (condition) {
    return renderer();
  }
}


function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
export function getWaypointDistance(...features) {
  if (features.length < 2) {
    return feature => getWaypointDistance(features[0], feature);
  }

  const [lon1, lat1] = features[0].geometry.coordinates;
  const [lon2, lat2] = features[1].geometry.coordinates;

  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1); // deg2rad above
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km

  return d;
}

export function random(length = 5) {
  const str = Math.random().toString(36).slice(2, length + 2);

  return str.match(/[a-z]/)[0] + str;
}

export function uid(id) {
  const key = random();

  if (!id) {
    return id => `${ key }-${ id }`;
  }

  return `${ key }-${ id }`;
}

export function debounce(callback, time = 100) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), time);
  };
}
