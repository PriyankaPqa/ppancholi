import { mockVersionedEntity } from '@libs/entities-lib/value-objects/versioned-entity';
import { mockDetailedRegistrationResponse, mockHouseholdEntity } from '@libs/entities-lib/household';
import {
  mockCheckForPossibleDuplicateResponse,
  mockGenders,
  mockIndigenousCommunitiesGetData, mockMemberData,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockValidateEmailResponse,
} from '@libs/entities-lib/household-create';
import { mockHouseholdActivities } from '@libs/entities-lib/value-objects/household-activity';
import { mockDomainBaseService } from '../../base';
import { IHouseholdsServiceMock } from './households.types';

export const mockHouseholdsService = (): IHouseholdsServiceMock => ({
  ...mockDomainBaseService([mockVersionedEntity()]),
  getGenders: jest.fn(() => mockGenders()),
  getPreferredLanguages: jest.fn(() => mockPreferredLanguages()),
  getPrimarySpokenLanguages: jest.fn(() => mockPrimarySpokenLanguages()),
  getIndigenousCommunities: jest.fn(() => mockIndigenousCommunitiesGetData()),
  submitRegistration: jest.fn(() => mockDetailedRegistrationResponse()),
  postPublicRegistration: jest.fn(() => mockDetailedRegistrationResponse()),
  getPerson: jest.fn(() => mockMemberData()),
  submitCRCRegistration: jest.fn(() => mockDetailedRegistrationResponse()),
  postCRCRegistration: jest.fn(() => mockDetailedRegistrationResponse()),
  updatePersonContactInformation: jest.fn(() => mockMemberData()),
  updatePersonIdentity: jest.fn(() => mockMemberData()),
  updatePersonAddress: jest.fn(() => mockMemberData()),
  updateHomeAddress: jest.fn(() => mockHouseholdEntity()),
  updateNoFixedHomeAddress: jest.fn(() => mockHouseholdEntity()),
  deleteAdditionalMember: jest.fn(() => mockHouseholdEntity()),
  addMember: jest.fn(() => mockHouseholdEntity()),
  hasOutstandingPayments: jest.fn(() => ({ hasOutstandingPayments: false })),
  makePrimary: jest.fn(() => mockHouseholdEntity()),
  splitHousehold: jest.fn(() => mockDetailedRegistrationResponse()),
  moveMembers: jest.fn(() => [mockHouseholdEntity(), mockHouseholdEntity()]),
  validateEmail: jest.fn(() => mockValidateEmailResponse()),
  validatePublicEmail: jest.fn(() => mockValidateEmailResponse()),
  getHouseholdActivity: jest.fn(() => mockHouseholdActivities()),
  getHouseholdHistory: jest.fn(() => [mockVersionedEntity()]),
  getHouseholdMetadataHistory: jest.fn(() => [mockVersionedEntity()]),
  setHouseholdStatus: jest.fn(() => mockHouseholdEntity()),
  checkForPossibleDuplicatePublic: jest.fn(() => mockCheckForPossibleDuplicateResponse()),
  sendOneTimeCodeRegistrationPublic: jest.fn(),
  verifyOneTimeCodeRegistrationPublic: jest.fn(() => true),
  getPublicToken: jest.fn(() => 'some token'),
  publicGetHousehold: jest.fn(() => mockHouseholdEntity()),
  publicGetPerson: jest.fn(() => mockMemberData()),
});
