// Copyright 2017-2020 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveStakingOverview } from '@polkadot/api-derive/types';

import React, { useContext } from 'react';
import styled from 'styled-components';
import SummarySession from '@polkadot/app-explorer/SummarySession';
import { CardSummary } from '@polkadot/react-components';
import { SummaryBox, IdentityIcon } from '@polkadot/react-components-darwinia';
import { BlockAuthorsContext } from '@polkadot/react-query';

import { useTranslation } from '../translate';

interface Props {
  className?: string;
  isVisible: boolean;
  next: string[];
  nominators: string[];
  stakingOverview?: DeriveStakingOverview;
  style?: any;
}

function Summary ({ className, isVisible, next, nominators, stakingOverview, style }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { lastBlockAuthors, lastBlockNumber } = useContext(BlockAuthorsContext);

  return (
    <SummaryBox
      className={`${className} ${!isVisible && 'staking--hidden'}`}
      style={style}
    >
      <section>
        {stakingOverview && (
          <CardSummary label={t('validators')}>
            {stakingOverview.validators.length}{`/${stakingOverview.validatorCount.toString()}`}
          </CardSummary>
        )}
        {next && next.length !== 0 && (
          <CardSummary label={t('waiting')}>
            {next.length}
          </CardSummary>
        )}
        {nominators.length !== 0 && (
          <CardSummary label={t('nominators')}>
            {nominators.length}
          </CardSummary>
        )}
      </section>
      <section>
        <CardSummary
          className='validator--Summary-authors'
          label={t('last block')}
        >
          <div>
            {lastBlockAuthors?.map((author): React.ReactNode => (
              <IdentityIcon
                className=''
                key={author}
                size={24}
                value={author}
              />
            ))}
          </div>
          {lastBlockNumber}
        </CardSummary>
      </section>
      <section>
        <SummarySession />
      </section>
    </SummaryBox>
  );
}

export default styled(Summary)`
  .summary--box {
    width: 100%;
  }
  .validator--Account-block-icon {
    margin-right: 0.75rem;
    margin-top: -0.25rem;
    vertical-align: middle;
  }

  .validator--Summary-authors {
    .validator--Account-block-icon+.validator--Account-block-icon {
      margin-left: -1.5rem;
    }
  }
`;
