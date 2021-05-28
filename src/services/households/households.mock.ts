import { mockHousehold } from '../../entities/household';
import {
  mockGenders,
  mockIndigenousIdentitiesSearchData,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '../../entities/household-create';
import { IHouseholdsServiceMock } from './households.types';

export const mockHouseholdsService = (): IHouseholdsServiceMock => ({
  getGenders: jest.fn(() => mockGenders()),
  getPreferredLanguages: jest.fn(() => mockPreferredLanguages()),
  getPrimarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
  searchIndigenousIdentities: jest.fn(() => mockIndigenousIdentitiesSearchData()),
  submitRegistration: jest.fn(() => mockHousehold()),
});
