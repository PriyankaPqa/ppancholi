import { mockTeamEntity } from '@libs/entities-lib/team';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

export function getMockExtensionComponents() {
  const entity = mockTeamEntity();
  const options = mockOptionItemData();
  return {
    taskCategories: jest.fn(() => options),
    createTask: jest.fn(() => entity),
    editTask: jest.fn(() => entity),
    fetchTaskCategories: jest.fn(() => options),
    getTaskCategories: jest.fn(() => options),
    setWorkingOn: jest.fn(() => entity),
    taskAction: jest.fn(() => entity),
  };
}
