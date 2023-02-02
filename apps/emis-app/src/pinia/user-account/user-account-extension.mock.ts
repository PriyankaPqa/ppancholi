import { mockUserAccountEntity, mockUserFilters } from '@libs/entities-lib/user-account';
import { mockOptionItems, mockRolesByLevel } from '@libs/entities-lib/optionItem';

export function getMockUserAccountExtensionComponents(entity = mockUserAccountEntity()) {
  return {
    currentUserFiltersByKey: jest.fn(() => [mockUserFilters()[2]]),
    getRoles: jest.fn(() => mockOptionItems()),
    rolesByLevels: jest.fn(() => mockRolesByLevel()),
    addFilter: jest.fn(() => entity),
    editFilter: jest.fn(() => entity),
    deleteFilter: jest.fn(() => entity),
    assignRole: jest.fn(() => entity),
    fetchCurrentUserAccount: jest.fn(() => entity),
    fetchRoles: jest.fn(() => mockOptionItems()),
  };
}
