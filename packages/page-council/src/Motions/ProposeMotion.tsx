// Copyright 2017-2020 @polkadot/app-council authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { SubmittableExtrinsic } from '@polkadot/api/types';

import BN from 'bn.js';
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Extrinsic, InputAddress, InputNumber, Modal, TxButton } from '@polkadot/react-components';
import { useApi, useToggle } from '@polkadot/react-hooks';

import { useTranslation } from '../translate';

interface Props {
  isMember: boolean;
  members: string[];
}

interface Threshold {
  isThresholdValid: boolean;
  threshold?: BN;
}

interface ProposalState {
  proposal?: SubmittableExtrinsic<'promise'> | null;
  proposalLength: number;
}

function Propose ({ isMember, members }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, apiDefaultTxSudo } = useApi();
  const [isOpen, toggleOpen] = useToggle();
  const [accountId, setAcountId] = useState<string | null>(null);
  const [{ proposal, proposalLength }, setProposal] = useState<ProposalState>({ proposalLength: 0 });
  const [{ isThresholdValid, threshold }, setThreshold] = useState<Threshold>({ isThresholdValid: false });

  useEffect((): void => {
    members && setThreshold({
      isThresholdValid: members.length !== 0,
      threshold: new BN(Math.ceil(members.length * 0.5))
    });
  }, [members]);

  const _setMethod = useCallback(
    (proposal?: SubmittableExtrinsic<'promise'> | null) => setProposal({
      proposal,
      proposalLength: proposal?.encodedLength || 0
    }),
    []
  );

  const _setThreshold = useCallback(
    (threshold?: BN) => setThreshold({
      isThresholdValid: !!threshold?.gtn(0),
      threshold
    }),
    []
  );

  return (
    <>
      <Button
        icon='add'
        isDisabled={!isMember}
        label={t<string>('Propose motion')}
        onClick={toggleOpen}
      />
      {isOpen && (
        <Modal
          header={t<string>('Propose a council motion')}
          size='large'
        >
          <Modal.Content>
            <InputAddress
              filter={members}
              help={t<string>('Select the account you wish to make the proposal with.')}
              label={t<string>('propose from account')}
              onChange={setAcountId}
              type='account'
              withLabel
            />
            <InputNumber
              className='medium'
              help={t<string>('The minimum number of council votes required to approve this motion')}
              isError={!threshold || threshold.eqn(0) || threshold.gtn(members.length)}
              label={t<string>('threshold')}
              onChange={_setThreshold}
              placeholder={t<string>('Positive number between 1 and {{memberCount}}', { replace: { memberCount: members.length } })}
              value={threshold || new BN(0)}
            />
            <Extrinsic
              defaultValue={apiDefaultTxSudo}
              label={t<string>('proposal')}
              onChange={_setMethod}
            />
          </Modal.Content>
          <Modal.Actions onCancel={toggleOpen}>
            <TxButton
              accountId={accountId}
              isDisabled={!proposal || !isThresholdValid}
              label={t<string>('Propose')}
              onStart={toggleOpen}
              params={
                api.tx.council.propose.meta.args.length === 3
                  ? [threshold, proposal, proposalLength]
                  : [threshold, proposal]
              }
              tx='council.propose'
            />
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

export default React.memo(Propose);
