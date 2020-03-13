// Copyright 2017-2020 @polkadot/apps-routing authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Routes } from './types';

import Claims from '@polkadot/app-claims';

export default ([
  {
    Component: Claims,
    display: {
      needsApi: [
        'query.claims.claimsFromEth'
      ]
    },
    i18n: {
      defaultValue: 'Claim Tokens'
    },
    icon: 'star',
    name: 'claims'
  }
] as Routes);
