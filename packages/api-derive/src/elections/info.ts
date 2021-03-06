// Copyright 2017-2020 @polkadot/api-derive authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { AccountId, Balance, BlockNumber, SeatHolder } from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiInterfaceRx } from '@polkadot/api/types';
import { Vec, u32 } from '@polkadot/types';

import { DeriveElectionsInfo } from '../types';
import { memo } from '../util';

// SeatHolder is current tuple is 2.x-era Substrate
type Member = SeatHolder | ITuple<[AccountId, Balance]>;

type Candidate = AccountId | ITuple<[AccountId, Balance]>;

function isSeatHolder (value: Member): value is SeatHolder {
  return !Array.isArray(value);
}

function isCandidateTuple (value: Candidate): value is ITuple<[AccountId, Balance]> {
  return Array.isArray(value);
}

function getAccountTuple (value: Member): [AccountId, Balance] {
  return isSeatHolder(value)
    ? [value.who, value.stake]
    : value;
}

function getCandidate (value: Candidate): AccountId {
  return isCandidateTuple(value)
    ? value[0]
    : value;
}

function sortAccounts ([, balanceA]: ITuple<[AccountId, Balance]>, [, balanceB]: ITuple<[AccountId, Balance]>): number {
  return balanceB.cmp(balanceA);
}

function queryElections (api: ApiInterfaceRx): Observable<DeriveElectionsInfo> {
  const section = api.query.phragmenElection ? 'phragmenElection' : api.query.electionsPhragmen ? 'electionsPhragmen' : 'elections';

  return api.queryMulti<[Vec<AccountId>, Vec<AccountId>, Vec<ITuple<[AccountId, Balance]>>, Vec<ITuple<[AccountId, Balance]>>]>([
    api.query.council.members,
    api.query[section].candidates,
    api.query[section].members,
    api.query[section].runnersUp
  ]).pipe(
    map(([councilMembers, candidates, members, runnersUp]): DeriveElectionsInfo => ({
      candidacyBond: api.consts[section].candidacyBond as Balance,
      candidateCount: api.registry.createType('u32', candidates.length),
      candidates: candidates.map(getCandidate),
      desiredSeats: api.consts[section].desiredMembers as u32,
      members: members.length
        ? members.map(getAccountTuple).sort(sortAccounts)
        : councilMembers.map((accountId): [AccountId, Balance] => [accountId, api.registry.createType('Balance')]),
      runnersUp: runnersUp.map(getAccountTuple).sort(sortAccounts),
      termDuration: api.consts[section].termDuration as BlockNumber,
      votingBond: api.consts[section].votingBond as Balance
    }))
  );
}

/**
 * @name info
 * @returns An object containing the combined results of the storage queries for
 * all relevant election module properties.
 * @example
 * <BR>
 *
 * ```javascript
 * api.derive.elections.info(({ members, candidates }) => {
 *   console.log(`There are currently ${members.length} council members and ${candidates.length} prospective council candidates.`);
 * });
 * ```
 */
export function info (api: ApiInterfaceRx): () => Observable<DeriveElectionsInfo> {
  return memo((): Observable<DeriveElectionsInfo> => queryElections(api));
}
