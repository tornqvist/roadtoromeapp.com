let template;

export function createView() {
  return state => {
    const element = template();

    if (!Object.keys(state.map.route).length) {
      return element;
    }

    element.classList.add('is-hidden');

    return element;
  };
}

export function find(root) {
  const node = root.querySelector('#device');

  template = template || (() => {
    const tmp = document.createElement('template');
    tmp.innerHTML = node.outerHTML;
    return tmp.content.firstChild;
  });

  return node;
}
