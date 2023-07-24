// import { mockCaseNoteCategories, mockCaseNoteEntity } from '@libs/entities-lib/potential-duplicate';

import { mockPotentialDuplicateEntity } from '@libs/entities-lib/potential-duplicate';

export function getMockExtensionComponents() {
  const potentialDuplicate = mockPotentialDuplicateEntity();

  return {
    getDuplicates: jest.fn(() => [potentialDuplicate]),
    flagNewDuplicate: jest.fn(() => potentialDuplicate),
    flagDuplicate: jest.fn(() => potentialDuplicate),
    resolveDuplicate: jest.fn(() => potentialDuplicate),
  };
}
