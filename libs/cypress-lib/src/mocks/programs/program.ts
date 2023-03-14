import { IProgramEntity, EPaymentModalities } from '@libs/entities-lib/program';

import { mockBaseData } from '@libs/entities-lib/base';

export const mockProgram = (force?: Partial<IProgramEntity>): IProgramEntity => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: 'Program En',
      fr: 'Program Fr',
    },
  },
  description: {
    translation: {
      en: 'Program Description EN',
      fr: 'Program Description FR',
    },
  },
  approvalRequired: true,
  eligibilityCriteria: {
    authenticated: true,
    impacted: false,
    completedAssessments: false,
    completedAssessmentIds: [],
  },
  eventId: 'd3becde1-6ec7-4b59-85c0-6e7fa3511e2e',
  paymentModalities: [EPaymentModalities.DirectDeposit],
  fillEmptyMultilingualAttributes: () => {},
  ...force,
  });
