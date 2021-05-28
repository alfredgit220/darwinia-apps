// Copyright 2017-2020 @polkadot/apps authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import queryString from 'query-string';
import store from 'store';
import { createEndpoints } from '@polkadot/apps-config/settings';
import { registry } from '@polkadot/react-api';
import settings from '@polkadot/ui-settings';
import * as definitions from '@darwinia/types/interfaces/definitions';

// we split here so that both these forms are allowed
//  - http://localhost:3000/?rpc=wss://substrate-rpc.parity.io/#/explorer
//  - http://localhost:3000/#/explorer?rpc=wss://substrate-rpc.parity.io
const urlOptions = queryString.parse(location.href.split('?')[1]);
const stored = store.get('settings') || {};

if (Array.isArray(urlOptions.rpc)) {
  throw new Error('Invalid WS endpoint specified');
}

const fallbackUrl = createEndpoints(() => '').find(({ value }) => !!value) || { value: 'ws://127.0.0.1:9944' };
let apiUrl = urlOptions.rpc // we have a supplied value
  ? urlOptions.rpc.split('#')[0] // https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:9944#/explorer
  : [stored.apiUrl, process.env.WS_URL].includes(settings.apiUrl) // overridden, or stored
    ? settings.apiUrl // keep as-is
    : fallbackUrl.value as string; // grab the fallback

// cc1.darwinia.network migration
if (apiUrl === 'wss://cc1.darwinia.network') {
  apiUrl = 'wss://rpc.darwinia.network';
}

// set the default as retrieved here
settings.set({ apiUrl });

console.log('WS endpoint=', apiUrl);

try {
  const types = store.get('types') || {};
  const names = Object.keys(types);

  const darwiniaTypes = Object.values(definitions).reduce((res, { types }): object => ({ ...res, ...types }), {});

  registry.register(darwiniaTypes);

  if (names.length) {
    registry.register(types);
    console.log('Type registration:', names.join(', '));
  }
} catch (error) {
  console.error('Type registration failed', error);
}
