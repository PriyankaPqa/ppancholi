import {
  mockGenders,
  mockIndigenousCommunities,
  mockIndigenousTypes,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
} from '@/entities/beneficiary';
import { IBeneficiariesServiceMock } from './beneficiaries.types';

export const mockBeneficiariesService = (): IBeneficiariesServiceMock => ({
  getGenders: jest.fn(() => mockGenders()),
  getPreferredLanguages: jest.fn(() => mockPreferredLanguages()),
  getPrimarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
  getIndigenousTypes: jest.fn(() => mockIndigenousTypes()),
  getIndigenousCommunities: jest.fn(() => mockIndigenousCommunities()),
});
