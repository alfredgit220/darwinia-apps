// Copyright 2017-2020 @polkadot/app-council authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveElectionsInfo } from '@polkadot/api-derive/types';

import BN from 'bn.js';
import React, { useEffect, useState } from 'react';
import { Button, InputAddress, InputAddressMulti, Modal, TxButton, VoteValue } from '@polkadot/react-components';
import { useApi, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  electionsInfo?: DeriveElectionsInfo;
}

const MAX_VOTES = 16;

function Vote ({ electionsInfo }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [isVisible, toggleVisible] = useToggle();
  const [accountId, setAccountId] = useState<string | null>(null);
  const [available, setAvailable] = useState<string[]>([]);
  const [defaultVotes, setDefaultVotes] = useState<string[]>([]);
  const [votes, setVotes] = useState<string[]>([]);
  const [voteValue, setVoteValue] = useState(new BN(0));

  useEffect((): void => {
    if (electionsInfo) {
      const { candidates, members, runnersUp } = electionsInfo;

      setAvailable(
        members
          .map(([accountId]): string => accountId.toString())
          .concat(runnersUp.map(([accountId]) => accountId.toString()))
          .concat(candidates.map((accountId) => accountId.toString()))
      );
    }
  }, [electionsInfo]);

  useEffect((): void => {
    accountId && api.derive.council.votesOf(accountId).then(({ votes }): void => {
      setDefaultVotes(
        votes
          .map((accountId): string => accountId.toString())
          .filter((accountId): boolean => available.includes(accountId))
      );
    });
  }, [api, accountId, available]);

  return (
    <>
      <Button
        icon='check'
        isDisabled={available.length === 0}
        label={t('Vote')}
        onClick={toggleVisible}
      />
      {isVisible && (
        <Modal
          header={t('Vote for current candidates')}
          size='large'
        >
          <Modal.Content>
            <Modal.Columns>
              <Modal.Column>
                <InputAddress
                  help={t('This account will be use to approve each candidate.')}
                  label={t('voting account')}
                  onChange={setAccountId}
                  type='account'
                />
              </Modal.Column>
              <Modal.Column>
                <p>{t('The vote will be recorded for the selected account.')}</p>
              </Modal.Column>
            </Modal.Columns>
            <Modal.Columns>
              <Modal.Column>
                <VoteValue
                  accountId={accountId}
                  onChange={setVoteValue}
                />
              </Modal.Column>
              <Modal.Column>
                <p>{t('The value associated with this vote. The amount will be locked (not available for transfer) and used in all subsequent elections.')}</p>
              </Modal.Column>
            </Modal.Columns>
            <Modal.Columns>
              <Modal.Column>
                <InputAddressMulti
                  available={available}
                  availableLabel={t('council candidates')}
                  defaultValue={defaultVotes}
                  help={t('Select and order council candidates you wish to vote for.')}
                  maxCount={MAX_VOTES}
                  onChange={setVotes}
                  valueLabel={t('my ordered votes')}
                />
              </Modal.Column>
              <Modal.Column>
                <p>{t('The votes for the members, runner-ups and candidates. These should be ordered based on your priority.')}</p>
                <p>{t('In calculating the election outcome, this prioritized vote ordering will be used to determine the final score for the candidates.')}</p>
              </Modal.Column>
            </Modal.Columns>
          </Modal.Content>
          <Modal.Actions onCancel={toggleVisible}>
            <TxButton
              accountId={accountId}
              isDisabled={!accountId || votes.length === 0 || voteValue.lten(0)}
              onStart={toggleVisible}
              params={[votes, voteValue]}
              tx={
                api.tx.phragmenElection ? 'phragmenElection.vote' : api.tx.electionsPhragmen
                  ? 'electionsPhragmen.vote'
                  : 'elections.vote'
              }
            />
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

export default React.memo(Vote);
