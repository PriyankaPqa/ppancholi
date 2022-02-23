import { mockVersionedEntity } from '../../../entities/value-objects/versioned-entity';
import { mockHouseholdEntity } from '../../../entities/household';
import {
  mockGenders,
  mockIndigenousCommunitiesGetData, mockMemberData,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockValidateEmailResponse,
} from '../../../entities/household-create';
import { IHouseholdsServiceMock } from './households.types';
import { mockHouseholdActivities } from '../../../entities/value-objects/household-activity';

export const mockHouseholdsService = (): IHouseholdsServiceMock => ({
  getGenders: jest.fn(() => mockGenders()),
  getPreferredLanguages: jest.fn(() => mockPreferredLanguages()),
  getPrimarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
  getIndigenousCommunities: jest.fn(() => mockIndigenousCommunitiesGetData()),
  submitRegistration: jest.fn(() => mockHouseholdEntity()),
  getPerson: jest.fn(() => mockMemberData()),
  submitCRCRegistration: jest.fn(() => mockHouseholdEntity()),
  updatePersonContactInformation: jest.fn(() => mockHouseholdEntity()),
  updatePersonIdentity: jest.fn(() => mockHouseholdEntity()),
  updatePersonAddress: jest.fn(() => mockHouseholdEntity()),
  updateHomeAddress: jest.fn(() => mockHouseholdEntity()),
  updateNoFixedHomeAddress: jest.fn(() => mockHouseholdEntity()),
  deleteAdditionalMember: jest.fn(() => mockHouseholdEntity()),
  addMember: jest.fn(() => mockHouseholdEntity()),
  hasOutstandingPayments: jest.fn(() => ({ hasOutstandingPayments: false })),
  makePrimary: jest.fn(() => mockHouseholdEntity()),
  splitHousehold: jest.fn(() => mockHouseholdEntity()),
  moveMembers: jest.fn(() => [mockHouseholdEntity(), mockHouseholdEntity()]),
  validateEmail: jest.fn(() => mockValidateEmailResponse()),
  validatePublicEmail: jest.fn(() => mockValidateEmailResponse()),
  getHouseholdActivity: jest.fn(() => mockHouseholdActivities()),
  getHouseholdHistory: jest.fn(() => [mockVersionedEntity()]),
  getHouseholdMetadataHistory: jest.fn(() => [mockVersionedEntity()]),
  getMemberHistory: jest.fn(() => [mockVersionedEntity()]),
  getMemberMetadataHistory: jest.fn(() => [mockVersionedEntity()]),
});
