import yo from 'yo-yo';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import * as header from './components/header';
import * as device from './components/device';
import * as map from './components/map';
import * as widget from './components/widget';
import reducer from './components/widget/reducer';

const middleware = [];

middleware.push(store => next => action => {
  if (typeof action === 'function') {
    return action(store.dispatch, store.getState);
  } else {
    return next(action);
  }
});

const store = createStore(
  combineReducers({map: reducer}),
  {
    map: {
      from: '',
      to: '',
      waypoints: {},
      route: {},
      baseline: 1.5,
      loading: null,
      error: null
    }
  },
  compose(
    applyMiddleware(...middleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

[
  header,
  device,
  map,
  widget
].forEach(component => {
  let previous = store.getState();
  const element = component.find(document);
  const view = component.createView();

  store.subscribe(() => {
    yo.update(element, view(store.getState(), store.dispatch, previous));
    previous = store.getState();
  });

  yo.update(element, view(previous, store.dispatch));
});
