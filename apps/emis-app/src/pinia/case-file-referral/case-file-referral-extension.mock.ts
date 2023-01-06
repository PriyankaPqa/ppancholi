import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { ICaseFileReferralEntity } from '@libs/entities-lib/case-file-referral';

export function getMockCaseFileReferralExtensionComponents() {
  const options = mockOptionItemData();
  return {
    getAllTypes: jest.fn(() => options),
    getAllOutcomeStatuses: jest.fn(() => options),
    fetchTypes: jest.fn(() => options),
    fetchOutcomeStatuses: jest.fn(() => options),
    createReferral: jest.fn((payload: ICaseFileReferralEntity) => payload),
    updateReferral: jest.fn((payload: ICaseFileReferralEntity) => payload),
  };
}
