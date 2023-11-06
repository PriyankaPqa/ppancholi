import { mockNotificationHelperView, mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';

export function getMockExtensionComponents() {
  const entity = mockTeamTaskEntity();
  const notificationHelperView = mockNotificationHelperView();
  const options = mockOptionItemData();
  return {
    taskCategories: jest.fn(() => options),
    createTask: jest.fn(() => entity),
    editTask: jest.fn(() => entity),
    fetchTaskCategories: jest.fn(() => options),
    getTaskCategories: jest.fn(() => options),
    setWorkingOn: jest.fn(() => entity),
    taskAction: jest.fn(() => entity),
    getNotificationHelperView: jest.fn(() => notificationHelperView),
  };
}
