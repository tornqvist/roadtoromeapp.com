import yo from 'yo-yo';
import { uid } from '../utils';

let template;
let isFixed = false;
const id = uid();

export function createView() {
  return state => {
    const element = template();

    if (!Object.keys(state.map.route).length) {
      return element;
    }

    if (isFixed) {
      element.id = id('header');
      element.classList.add('is-fixed');
      return element;
    }

    const onload = () => {
      requestAnimationFrame(() => {
        const node = element.parentElement;
        const height = node.offsetHeight;
        const beforeFixed = () => {
          node.removeEventListener('transitionend', beforeFixed);
          node.removeAttribute('style');
          element.classList.add('is-fixed');

          Object.assign(element.style, {
            transform: 'translateY(-100%)',
            transition: 'transform 400ms ease-out'
          });

          requestAnimationFrame(() => {
            element.addEventListener('transitionend', afterFixed);
            Object.assign(element.style, { transform: 'translateY(0%)' });
          });

          isFixed = true;
        };
        const afterFixed = () => {
          element.removeEventListener('transitionend', afterFixed);
          element.removeAttribute('style');
        };

        Object.assign(node.style, {
          height: `${ height }px`,
          opacity: '1',
          overflow: 'hidden',
          transition: 'height 600ms ease-out, opacity 600ms ease-out'
        });

        requestAnimationFrame(() => {
          node.addEventListener('transitionend', beforeFixed);
          node.style.height = '0px';
          node.style.opacity = '0';
        });
      });
    };

    element.id = uid('header');

    return yo`
      <div onload=${ onload } id=${ id('header') }>
        ${ element }
      </div>
    `;
  };
}

export function find(root) {
  const node = root.querySelector('#header');

  template = template || (() => {
    const tmp = document.createElement('template');
    tmp.innerHTML = node.outerHTML;
    return tmp.content.firstChild;
  });

  return node;
}
