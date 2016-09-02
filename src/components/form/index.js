import { default as yo, createElement } from 'yo-yo';

let id = 0;
const uid = () => id += 1;
const blacklist = ['label', 'loading', 'error', 'outline'];

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

  const onfocus = attrs.onfocus;
  attrs.onfocus = event => {
    event.target.parentElement.classList.add('has-focus');
    if (typeof onfocus === 'function') { onfocus(event); }
  };

  const onblur = attrs.onblur;
  attrs.onblur = event => {
    event.target.parentElement.classList.remove('has-focus');
    if (typeof onblur === 'function') { onblur(event); }
  };

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
    classList.push('is-loading');
    loader = yo`<svg class="Form-loader" role="presentational"><use width="50" height="50" namespace="http://www.w3.org/1999/xlink" href="#loader"></use></svg>`;
  }

  if (props.error) {
    classList.push('has-error');
  }

  if (props.outline) {
    classList.push('Form-item--outlined');
  }

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
  }, {
    ...props,
    onchange: ({ target }) => {

    }
  });

  return yo`
    <div class="Form-item">
      <div class="u-flex"
        <label class="Form-label u-flexExpand u-inlineBlock" for=${ attrs.id }>${ props.label }</label>
        <input type="text" class="Form-text u-inlineBlock" readonly value="">
      </div>
      ${ createElement('input', attrs) }
    </div>
  `;
}
