import { uid } from '../utils';

let template;

export function createView() {
  const id = uid();

  return state => {
    const element = template();

    if (!Object.keys(state.map.route).length) {
      return element;
    }

    element.id = id('header');
    element.classList.add('is-hidden');

    return element;
  };
}

export function find(root) {
  const node = root.querySelector('#device');

  template = template || (() => {
    const tmp = document.createElement('div');
    tmp.innerHTML = node.outerHTML;
    return tmp.firstChild;
  });

  return node;
}
