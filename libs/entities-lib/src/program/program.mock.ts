import { mockBaseData } from '../base';
import { ProgramEntity } from './program';
import {
  EPaymentModalities, IProgramEntity, IProgramEntityData,
} from './program.types';

export const mockProgramEntityData = (force?: Partial<IProgramEntityData>): IProgramEntityData => ({
  ...mockBaseData(),
  name: {
    translation: {
      en: 'Program A',
      fr: 'Program A FR',
    },
  },
  description: {
    translation: {
      en: 'Description EN',
      fr: 'Description FR',
    },
  },
  approvalRequired: true,
  eligibilityCriteria: {
    authenticated: true,
    impacted: false,
    completedAssessments: false,
    completedAssessmentIds: [] as uuid[],
  },
  eventId: 'd3becde1-6ec7-4b59-85c0-6e7fa3511e2e',
  paymentModalities: [
    EPaymentModalities.Cheque,
    EPaymentModalities.DirectDeposit,
    EPaymentModalities.GiftCard,
    EPaymentModalities.Invoice,
    EPaymentModalities.PrepaidCard,
    EPaymentModalities.Voucher,
  ],
  ...force,
});

export const mockProgramEntity = (force?: Partial<IProgramEntityData>): IProgramEntity => new ProgramEntity(mockProgramEntityData(force));

export const mockProgramEntities = (): IProgramEntity[] => [
  mockProgramEntity({ id: '1' }),
  mockProgramEntity({ id: '2' }),
];
