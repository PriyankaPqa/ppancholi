import {
  mockCreateBeneficiaryRequest,
  mockGenders,
  mockIndigenousIdentitiesSearchData,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../entities/beneficiary';
import { IBeneficiariesServiceMock } from './beneficiaries.types';

export const mockBeneficiariesService = (): IBeneficiariesServiceMock => ({
  getGenders: jest.fn(() => mockGenders()),
  getPreferredLanguages: jest.fn(() => mockPreferredLanguages()),
  getPrimarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
  searchIndigenousIdentities: jest.fn(() => mockIndigenousIdentitiesSearchData()),
  submitRegistration: jest.fn(() => mockCreateBeneficiaryRequest()),
});
