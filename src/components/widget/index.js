import { input, range } from '../form';
import { identifier, output, uid } from '../utils';
import {
  findRoute,
  setBaseline,
  inputWaypoint,
  findWaypoint,
  setDefaultWaypoints
} from './actions';

/**
 * Babel transform `yo` into a unrecognizable mess, hence the CommonJS
 */
const yo = require('yo-yo');

const BUTTON_IDENTIFIER = identifier('.js-submit');
const FROM_IDENTIFIER = identifier('[name="from"]');
const TO_IDENTIFIER = identifier('[name="to"]');
const INPUT_IDENTIFIER = identifier('.js-formItem');
const TRANSITION_EVENT = 'transitionend';

const appear = callback => node => {
  requestAnimationFrame(() => {
    const elements = node.querySelectorAll(INPUT_IDENTIFIER.selector);
    const height = node.offsetHeight;

    Object.assign(node.style, { zIndex: '1', height: '0px' });

    const ontransitionend = () => {
      node.removeEventListener(TRANSITION_EVENT, ontransitionend, false);
      node.removeAttribute('style');
    };

    node.addEventListener(TRANSITION_EVENT, ontransitionend, false);
    requestAnimationFrame(() => {
      Object.assign(node.style, {
        height: `${ height }px`,
        transition: `height ${ elements.length * 150 }ms ease-out`,
      });
    });

    Array.prototype.forEach.call(elements, (el, index) => {
      const ontransitionend = () => {
        el.removeEventListener(TRANSITION_EVENT, ontransitionend, false);
        el.removeAttribute('style');

        if (typeof callback == 'function' && index === (elements.length - 1)) {
          callback();
        }
      };

      Object.assign(el.style, { opacity: '0', transform: 'translateY(50%)' });

      el.addEventListener(TRANSITION_EVENT, ontransitionend, false);
      requestAnimationFrame(() => {
        Object.assign(el.style, {
          transition: `200ms linear ${ (index + 2) * 150 }ms`,
          transitionProperty: 'opacity, transform',
          transform: 'translateY(0%)',
          opacity: '1'
        });
      });
    });
  });
};

export function createView() {
  const id = uid();

  return ({ map }, dispatch) => {
    const { route, error, waypoints } = map;

    let cansubmit = true;
    const outline = !!Object.keys(route).length;
    const itemClass = INPUT_IDENTIFIER.classes.join(' ');
    const steps = Math.round(route.distance / 0.45);
    const oninput = event => dispatch(
      inputWaypoint(event.target.value, event.target.name)
    );
    const onblur = ({ target }) => dispatch(
      findWaypoint(target.value, target.name, `[name="${ target.name }"]`)
    );
    const onfocus = event => event.target.select();
    const onBaselineInput = event => dispatch(setBaseline(+event.target.value));
    const onkeydown = event => {
      if (event.keyCode === 13) {
        const { target } = event;
        const name = target.name;

        dispatch(findWaypoint(target.value, name, `[name="${ name }"]`))
          .then(action => {
            const args = [waypoints.from, waypoints.to];
            args[name === 'from' ? 0 : 1] = action.waypoint;
            return dispatch(findRoute(...args, BUTTON_IDENTIFIER.selector));
          });
      }
    };

    const onsubmit = event => {
      dispatch(findRoute(
        waypoints.from,
        waypoints.to,
        BUTTON_IDENTIFIER.selector
      ));

      event.preventDefault();
    };

    if (map.loading || error || !waypoints.from || !waypoints.to) {
      cansubmit = false;
    }

    const buttonClasses = [
      'Button',
      'Button--lg',
      itemClass
    ].concat(BUTTON_IDENTIFIER.classes);
    if (BUTTON_IDENTIFIER.matches(map.loading)) {
      buttonClasses.push('is-loading');
    }
    if (outline) {
      buttonClasses.push('Button--outlined');
    }

    return yo`
      <div class="u-marginBl">
        <div>
          <strong style="color: red;">${ map.error && map.error.message }</strong>
        </div>
        <div class="u-posRelative" onload=${ appear(() => dispatch(setDefaultWaypoints(FROM_IDENTIFIER.selector))) }>
          ${ output(Object.keys(route).length, () => yo`
            <div id=${ id('details') } class="u-marginBl" class="u-posRelative" onload=${ appear() }>
              <div class=${ itemClass }>
                ${ input({outline, label: 'Distance', id: id('distance'), readonly: true, value: `${ route.distance } m` }) }
              </div>
              <div class=${ itemClass }>
                ${ input({outline, label: 'Steps', id: id('steps'), readonly: true, value: steps }) }
              </div>
              <div class=${ itemClass }>
                ${ input({outline, label: 'You\'ll be there in', id: id('estimate'), readonly: true, value: `${ Math.round(route.distance / (map.baseline * 5000)) } days` }) }
              </div>
              <div class=${ itemClass }>
                ${ range({outline, label: 'Average time walking/day', id: id('baseline'), name: 'baseline', value: map.baseline, unit: 'h', min: 0.5, max: 24, step: 0.5, oninput: onBaselineInput }) }
              </div>
            </div>
          `) }
          <form onsubmit=${ onsubmit }>
            <div class=${ itemClass }>
              ${ input({outline, label: 'From', id: id('from'), error: (error && FROM_IDENTIFIER.matches(error.selector)), loading: FROM_IDENTIFIER.matches(map.loading), name: 'from', value: map.from, oninput, onblur, onfocus, onkeydown }) }
            </div>
            <div class=${ itemClass }>
              ${ input({outline, label: 'To', id: id('to'), error: (error && TO_IDENTIFIER.matches(error.selector)), loading: TO_IDENTIFIER.matches(map.loading), name: 'to', value: map.to, oninput, onblur, onfocus, onkeydown }) }
            </div>
            <button type="submit" disabled=${ !cansubmit } class=${ buttonClasses.join(' ') }>
              Get going
            </button>
          </form>
        </div>
      </div>
    `;
  };
}

export function find(root) {
  return root.querySelector('#widget');
}
