import {
  EPaymentModalities, EProgramStatus, IProgramData, IProgramSearchData,
} from './program.types';

export const mockProgramsData = (): IProgramData[] => [{
  id: '50448672-17db-4640-9cdf-83a310821245',
  created: '2021-03-31T15:23:00.755Z',
  timestamp: '2021-03-31T15:23:00.755Z',
  eTag: '',
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
  programStatus: EProgramStatus.Active,
  paymentModalities: [
    EPaymentModalities.Cheque,
    EPaymentModalities.DirectDeposit,
    EPaymentModalities.GiftCard,
    EPaymentModalities.Invoice,
    EPaymentModalities.PrepaidCard,
    EPaymentModalities.Voucher,
  ],
}];

export const mockProgramsSearchData = (): IProgramSearchData[] => [{
  programId: '50448672-17db-4640-9cdf-83a310821245',
  createdDate: '2021-03-31T15:23:00.755Z',
  programName: {
    translation: {
      en: 'Program A',
      fr: 'Program A FR',
    },
  },
  programDescription: {
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
  programStatus: EProgramStatus.Active,
  programStatusName: {
    translation: {
      en: 'Active',
      fr: 'Actif',
    },
  },
  paymentModalities: [
    EPaymentModalities.Cheque,
    EPaymentModalities.DirectDeposit,
    EPaymentModalities.GiftCard,
    EPaymentModalities.Invoice,
    EPaymentModalities.PrepaidCard,
    EPaymentModalities.Voucher,
  ],
}];
