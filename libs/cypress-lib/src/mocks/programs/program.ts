import { IProgramEntity, EPaymentModalities } from '@libs/entities-lib/program';

import { mockBaseData } from '@libs/entities-lib/base';
import { getRandomNumber } from '@libs/cypress-lib/helpers';

export const mockProgram = (force?: Partial<IProgramEntity>): IProgramEntity => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: `Program En -s${getRandomNumber()}`,
      fr: `Program Fr -s${getRandomNumber()}`,
    },
  },
  description: {
    translation: {
      en: 'Program Description EN',
      fr: 'Program Description FR',
    },
  },
  approvalRequired: false,
  eligibilityCriteria: {
    authenticated: false,
    impacted: false,
    completedAssessments: false,
    completedAssessmentIds: [],
  },
  eventId: 'd3becde1-6ec7-4b59-85c0-6e7fa3511e2e',
  paymentModalities: [EPaymentModalities.DirectDeposit, EPaymentModalities.PrepaidCard],
  fillEmptyMultilingualAttributes: () => {},
  ...force,
  });
