import { innerSVG } from '../utils';

/**
 * Babel transform `yo` into a unrecognizable mess, hence the CommonJS
 */
const yo = require('yo-yo');
const { createElement } = yo;

let id = 0;
const uid = () => id += 1;
const blacklist = ['label', 'loading', 'error', 'outline', 'unit'];

function extractAttrs(attrs, ...args) {
  attrs.className = attrs.className || '';

  for (let props of args) {
    for (let key of Object.keys(props)) {
      if (key === 'class' || key === 'className') {
        attrs.className += ` ${ props[key] }`;
      } else if (!blacklist.includes(key)) {
        attrs[key] = props[key];
      } else if ((key === 'loading') && props.loading) {
        attrs.disabled = true;
      }
    }
  }

  if (!attrs.id) {
    attrs.id = `form-${ uid() }`;
  }

  return attrs;
}

export function input(props) {
  const attrs = extractAttrs({
    type: 'text',
    className: 'Form-text'
  }, props);

  let loader = null;
  const classList = ['Form-item'];

  if (props.loading) {
    attrs.disabled = true;
    classList.push('is-loading');
    loader = yo`<svg class="Form-loader" width="50" height="50"></svg>`;
    innerSVG(loader).set('<use xlink:href="#loader"></use>');
  }

  if (props.error) {
    classList.push('has-error');
  }

  if (props.outline) {
    classList.push('Form-item--outlined');
  }

  const onfocus = attrs.onfocus;
  attrs.onfocus = event => {
    if (!attrs.readonly) {
      event.target.parentElement.classList.add('has-focus');
    }
    if (typeof onfocus === 'function') { onfocus(event); }
  };

  const onblur = attrs.onblur;
  attrs.onblur = event => {
    if (!attrs.readonly) {
      event.target.parentElement.classList.remove('has-focus');
    }
    if (typeof onblur === 'function') { onblur(event); }
  };

  return yo`
    <div class=${ classList.join(' ') }>
      <label class="Form-label" for="${ attrs.id }">${ props.label }</label>
      ${ createElement('input', attrs) }
      ${ loader }
    </div>
  `;
}

export function range(props) {
  const attrs = extractAttrs({
    type: 'range',
    className: 'Form-range'
  }, props, {
    onchange: event => {
      if (typeof props.onchange === 'function') {
        props.onchange(event);
      }
    }
  });

  const classList = ['Form-item'];

  if (props.error) {
    classList.push('has-error');
  }

  if (props.outline) {
    classList.push('Form-item--outlined');
  }

  return yo`
    <div class=${ classList.join(' ') }>
      <div class="u-flex">
        <label class="Form-label u-textNoWrap" for=${ attrs.id }>${ props.label }</label>
        <input type="text" class="Form-text u-textRight u-sizeFit" readonly value=${ `${ props.value } ${ props.unit }` } />
      </div>
      ${ createElement('input', attrs) }
    </div>
  `;
}
