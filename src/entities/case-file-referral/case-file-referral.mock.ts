import { mockBaseData } from '@/entities/base';
import { IEntity } from '../base/base.types';
import { ICaseFileReferralCombined, ICaseFileReferralEntity, ICaseFileReferralMetadata } from './case-file-referral.types';

export const mockCaseFileReferralEntity = (force? : Partial<ICaseFileReferralEntity>) : ICaseFileReferralEntity => ({
  ...mockBaseData(),
  caseFileId: '38106287-9046-47b9-8981-76ede656d305',
  name: 'test referral',
  note: 'notes...',
  method: 1,
  type: {
    optionItemId: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
    specifiedOther: null,
  },
  outcomeStatus: {
    optionItemId: '09bda590-ad8b-4f29-af4e-c63eedd337a0',
    specifiedOther: null,
  },
  ...force,
  validate: () => true,
});

export const mockCaseFileReferralMetadata = (force? : Partial<ICaseFileReferralMetadata>) : ICaseFileReferralMetadata => ({
  ...mockBaseData(),
  referralOutcomeStatusName: {
    translation: {
      en: 'referralOutcomeStatusNameEn',
      fr: 'referralOutcomeStatusNameFr',
    },
  },
  referralTypeName: {
    translation: {
      en: 'referralTypeNameEn',
      fr: 'referralTypeNameFr',
    },
  },
  ...force,
});

export const mockCaseFileReferralEntities = () : ICaseFileReferralEntity[] => [
  mockCaseFileReferralEntity({ id: '1' }),
  mockCaseFileReferralEntity({ id: '2' }),
];

export const mockCaseFileReferralMetadatum = () : ICaseFileReferralMetadata[] => [
  mockCaseFileReferralMetadata({ id: '1' }),
  mockCaseFileReferralMetadata({ id: '2' }),
];

export const mockCombinedCaseFileReferral = (force?: Partial<IEntity>): ICaseFileReferralCombined => ({
  metadata: mockCaseFileReferralMetadata(force),
  entity: mockCaseFileReferralEntity(force),
});

export const mockCombinedCaseFileReferrals = (): ICaseFileReferralCombined[] => [
  mockCombinedCaseFileReferral({ id: '1' }),
  mockCombinedCaseFileReferral({ id: '2' }),
  mockCombinedCaseFileReferral({ id: '3' }),
];
