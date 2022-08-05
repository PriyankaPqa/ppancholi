import { IEntity, mockBaseData } from '../base';
import { ProgramEntity } from './program';
import {
  EPaymentModalities, IProgramCombined, IProgramEntity, IProgramEntityData, IProgramMetadata,
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
    completedAssessments: false,
    impacted: false,
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

export const mockProgramMetadata = (force?: Partial<IProgramMetadata>): IProgramMetadata => ({
  ...mockBaseData(),
  eventId: 'd3becde1-6ec7-4b59-85c0-6e7fa3511e2e',
  programStatusName: {
    translation: {
      en: 'Program status EN',
      fr: 'Program status FR',
    },
  },
  ...force,
});

export const mockProgramMetadataArray = (): IProgramMetadata[] => [mockProgramMetadata({ id: '1' }), mockProgramMetadata({ id: '2' })];

export const mockCombinedProgram = (force?: Partial<IEntity>): IProgramCombined => ({
  metadata: mockProgramMetadata(force),
  entity: mockProgramEntity(force),
});

export const mockCombinedPrograms = (): IProgramCombined[] => [
  mockCombinedProgram({ id: '1' }),
  mockCombinedProgram({ id: '2' }),
  mockCombinedProgram({ id: '3' }),
];
