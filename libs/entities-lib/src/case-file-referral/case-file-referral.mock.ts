import { mockBaseData } from '../base';
import { ICaseFileReferralEntity } from './case-file-referral.types';

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
  referralConsentInformation: null,
  ...force,
  validate: () => true,
});

export const mockCaseFileReferralEntities = () : ICaseFileReferralEntity[] => [
  mockCaseFileReferralEntity({ id: '1' }),
  mockCaseFileReferralEntity({ id: '2' }),
];

export const mockSearchData = {
  '@odata.context': 'https://emis-search-dev.search.windows.net/indexes("index-referrals")/$metadata#docs(*)',
  '@odata.count': 3,
  value: [
    {
      Id: '1',
      TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      Entity: {
        CaseFileId: '1',
        Name: 'Referral2',
        Note: null,
        Method: 1,
        Id: '1',
        TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        Created: '2021-08-05T18:47:36.9059145Z',
        Timestamp: '2021-08-05T18:47:36.9059145Z',
        Status: 1,
        Type: {
          OptionItemId: '1',
          SpecifiedOther: null,
        },
        OutcomeStatus: null,
        ReferralConsentInformation: null,
      },

    },
    {
      Id: '2',
      TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      Entity: {
        CaseFileId: '1',
        Name: 'Referral4',
        Note: null,
        Method: 1,
        Id: '2',
        TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        Created: '2021-08-05T18:56:04.9069716Z',
        Timestamp: '2021-08-05T18:56:04.9069716Z',
        Status: 1,
        Type: {
          OptionItemId: 'e591ba32-0318-1253-8a3c-4470d01df700',
          SpecifiedOther: null,
        },
        OutcomeStatus: null,
        ReferralConsentInformation: null,
      },

    },
    {
      Id: '3',
      TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      Entity: {
        CaseFileId: '1',
        Name: 'Test_1',
        Note: '',
        Method: 1,
        Id: '3',
        TenantId: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        Created: '2021-08-05T12:41:27.166263Z',
        Timestamp: '2021-08-05T12:42:40.0839505Z',
        Status: 1,
        Type: {
          OptionItemId: '2',
          SpecifiedOther: '',
        },
        OutcomeStatus: {
          OptionItemId: 'e591ba32-1842-8485-8a3c-4470d01df700',
          SpecifiedOther: '',
        },
        ReferralConsentInformation: '',
      },

    },
  ],
};
