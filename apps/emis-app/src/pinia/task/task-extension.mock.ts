import { mockNotificationHelperView, mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockOptionItemData, mockOptionSubItem } from '@libs/entities-lib/optionItem';

export function getMockExtensionComponents() {
  const entity = mockTeamTaskEntity();
  const notificationHelperView = mockNotificationHelperView();
  const options = mockOptionItemData();
  const subItems = [mockOptionSubItem()];
  return {
    taskCategories: options,
    createTask: jest.fn(() => entity),
    editTask: jest.fn(() => entity),
    fetchTaskCategories: jest.fn(() => options),
    getTaskCategory: jest.fn(() => options),
    setWorkingOn: jest.fn(() => entity),
    taskAction: jest.fn(() => entity),
    getNotificationHelperView: jest.fn(() => notificationHelperView),
    filterAndSortActiveSubItems: jest.fn(() => subItems),
  };
}
