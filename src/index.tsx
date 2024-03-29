/* Copyright 2018 Spotify AB. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Toaster } from '@blueprintjs/core'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import createHistory from 'history/createBrowserHistory'
import 'normalize.css/normalize.css'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { applyMiddleware, compose, createStore, StoreEnhancer } from 'redux'
import persistState, { mergePersistedState } from 'redux-localstorage'
import filter from 'redux-localstorage-filter'
import App from './components/App'
import './index.css'
import reducers, { IState } from './reducers'
import registerServiceWorker from './registerServiceWorker'
import { SchemaLoader } from './schema/loader'
import schemaUrl from './schema/schema.pb'

/* tslint:disable */
// Sadly this library is not ES6 module compatible
const adapter = require('redux-localstorage/lib/adapters/localStorage')
/* tslint:enable */

const history = createHistory()
const storage = filter(['ui', 'recent'])(adapter(window.localStorage))
const middlewareEnhancer = applyMiddleware(routerMiddleware(history))
const persistanceEnhancer = persistState(storage, 'proto-registry')
const enhancer: StoreEnhancer<IState> = compose(middlewareEnhancer, persistanceEnhancer)
const reducer = mergePersistedState()(reducers)
// @ts-ignore
const store = createStore(reducer, enhancer)

const element = document.getElementById('root')
let toaster: Toaster | null = null
const refToaster = (t: Toaster) => { toaster = t }
const component = (
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App refToaster={refToaster} schema={new SchemaLoader(schemaUrl).load()}/>
    </ConnectedRouter>
  </Provider>
)

ReactDOM.render(component, element)
registerServiceWorker(() => toaster)
