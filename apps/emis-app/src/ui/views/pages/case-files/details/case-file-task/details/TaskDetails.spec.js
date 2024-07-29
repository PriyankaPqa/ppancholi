import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { ActionTaken, mockPersonalTaskEntity, mockTeamTaskEntity, TaskStatus } from '@libs/entities-lib/task';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import routes from '@/constants/routes';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockOptionItem, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import flushPromises from 'flush-promises';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { mockProvider } from '@/services/provider';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { mockTeamEntity } from '@libs/entities-lib/team';
import StatusChip from '@/ui/shared-components/StatusChip.vue';
import { GlobalHandler } from '@libs/services-lib/http-client';
import Component from './TaskDetails.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const { userStore } = useMockUserStore(pinia);
const { teamStore } = useMockTeamStore(pinia);
const services = mockProvider();

describe('TaskDetails.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}, level = 5) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        id: 'mock-case-file-id-1',
        taskId: 'mock-task-id-1',
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, options) : mount(Component, options);
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    await doMount(false);
  });

  describe('Template', () => {
    describe('task-details-is-urgent', () => {
      it('should be rendered when task isUrgent is true', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ isUrgent: true }));
        await doMount(false, {
          data() {
            return {
              loading: false,
            };
          },
          computed: {
            task: () => mockTeamTaskEntity({ isUrgent: true }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-is-urgent');
        expect(element.exists()).toBeTruthy();
      });

      it('should be not rendered when task isUrgent is true', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ isUrgent: false }));
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ isUrgent: false }),
            isTeamTask: () => true,
          },
        });
        const element = wrapper.findDataTest('task-details-is-urgent');
        expect(element.exists()).toBeFalsy();
      });

      it('should be not rendered when task is not team', async () => {
        taskStore.getById = jest.fn(() => mockPersonalTaskEntity({ isUrgent: false }));
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ isUrgent: false }),
            isTeamTask: () => false,
          },
        });
        const element = wrapper.findDataTest('task-details-is-urgent');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-edit-button', () => {
      it('should be render when user has level 1 and is team task', async () => {
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          data() {
            return {
              loading: false,
            };
          },
          computed: {
            task: () => mockTeamTaskEntity(),
            isTeamTask: () => true,
          },
        }, 1);
        await flushPromises();
        const element = wrapper.findDataTest('task-details-edit-button');
        expect(element.exists()).toBeTruthy();
      });

      it('should be render when user is the creator and is personal task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ createdBy: 'mock-id-1' }));
        userStore.getUserId = jest.fn(() => 'mock-user-001');
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-001' }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-edit-button');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be render when user is not the creator of the personal task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ createdBy: 'mock-id-1' }));
        userStore.getUserId = jest.fn(() => 'mock-user-002');
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-001' }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-edit-button');
        expect(element.exists()).toBeFalsy();
      });

      it('should call getEditTaskRoute when click', async () => {
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          data() {
            return {
              loading: false,
            };
          },
          computed: {
            task: () => mockTeamTaskEntity(),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        wrapper.vm.getEditTaskRoute = jest.fn();
        const element = wrapper.findDataTest('task-details-edit-button');
        await element.vm.$emit('click');
        expect(wrapper.vm.getEditTaskRoute).toHaveBeenCalled();
      });
    });

    describe('task-details-team-task-creator-info', () => {
      it('should render proper data when is team task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ createdBy: 'mock-id-1' }));
        await doMount(true, {
          data() {
            return {
              loading: false,
            };
          },
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity({ createdBy: 'mock-id-1' }),
            userAccountMetadata: () => mockUserAccountMetadata({ id: 'mock-id-1' }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-team-task-creator-info');
        expect(element.text()).toEqual('task.task_details.by Jane Smith (System Admin)');
      });
    });

    describe('task-details-team-task-category-description', () => {
      it('should render task category description when is team task and has description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedTaskCategory: () => mockOptionItem({
              translation: {
                en: 'This is item 1 description',
                fr: 'This is item 1 description FR',
              },
            }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-team-task-category-description');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('This is item 1 description');
      });

      it('should not render task category description when is not team task', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity(),
            selectedTaskCategory: () => mockOptionItem({
              translation: {
                en: 'This is item 1 description',
                fr: 'This is item 1 description FR',
              },
            }),
          },
        });
        const element = wrapper.findDataTest('task-details-team-task-category-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should not render task category description when is team task but has no description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedTaskCategory: () => ({
              description: {
                translation: {
                  en: '',
                  fr: '',
                },
              } }),
          },
        });
        const element = wrapper.findDataTest('task-details-team-task-category-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-sub-category', () => {
      it('should be rendered when there is selected sub-category', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            selectedSubCategory: () => mockOptionSubItem(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-sub-category');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('case worker 2');
      });

      it('should render value from specifiedOther when sub-category is other', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity({
              subCategory: {
                optionItemId: 'mock-category-id-1',
                specifiedOther: 'mock-specified-content',
              },
            }),
            selectedSubCategory: () => mockOptionSubItem({
              id: 'mock-category-id-1',
              isOther: true,
            }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-sub-category');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('mock-specified-content');
      });
    });

    describe('task-details-sub-category-description', () => {
      it('should render task sub-category description when is team task and has description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedSubCategory: () => mockOptionSubItem(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-sub-category-description');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('case worker 2 description');
      });

      it('should not render task sub-category description when is not team task', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity(),
            selectedSubCategory: () => mockOptionSubItem(),
          },
        });
        const element = wrapper.findDataTest('task-details-sub-category-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should not render task sub-category description when is team task but has no description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedSubCategory: () => ({
              description: {
                translation: {
                  en: '',
                  fr: '',
                },
              } }),
          },
        });
        const element = wrapper.findDataTest('task-details-sub-category-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-sub-category-section', () => {
      it('should display sub-category name and description if there is selectedCategory', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            selectedSubCategory: () => mockOptionSubItem(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-sub-category-section');
        expect(element.text()).toEqual('task.task_sub_category\n'
          + '               \n'
          + '                  case worker 2\n'
          + '                 \n'
          + '                    mdi-alert-circle\n'
          + '                    case worker 2 description');
      });

      it('should not display if there is no selectedSubCategory', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            selectedSubCategory: () => null,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-sub-category-section');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-working-on-it', () => {
      it('should be rendered when displayWorkingOnIt is true', async () => {
        await doMount(true, {
          computed: {
            displayWorkingOnIt: () => true,
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-working-on-it');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when displayWorkingOnIt is false', async () => {
        await doMount(true, {
          computed: {
            displayWorkingOnIt: () => false,
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-working-on-it');
        expect(element.exists()).toBeFalsy();
      });

      it('should display N/A if there is no selectedCategory', async () => {
        await doMount(true, {
          computed: {
            displayWorkingOnIt: () => true,
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
            isTeamTask: () => true,
          },
        });
        await wrapper.setData({
          isWorkingOn: false,
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-working-on-it');
        expect(element.text()).toEqual('task.task_details.working_on_it\n'
          + '           \n'
          + '            common.N/A');
      });
    });

    describe('task_details_back_btn', () => {
      it('should router back to case file tasks', async () => {
        await doMount(false);
        const element = wrapper.findDataTest('task_details_back_btn');
        await element.vm.$emit('click');
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: routes.caseFile.task.home.name,
        });
      });
    });

    describe('status-chip', () => {
      it('should be rendered for team task', async () => {
        await doMount(false, {
          computed: {
            task: () => mockTeamTaskEntity(),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        const element = wrapper.findComponent(StatusChip);
        expect(element.exists()).toBeTruthy();
      });

      it('should be rendered for completed personal task', async () => {
        await doMount(false, {
          computed: {
            task: () => mockPersonalTaskEntity({
              taskStatus: TaskStatus.Completed,
            }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        const element = wrapper.findComponent(StatusChip);
        expect(element.exists()).toBeTruthy();
      });

      it('should be rendered for cancelled personal task', async () => {
        await doMount(false, {
          computed: {
            task: () => mockPersonalTaskEntity({
              taskStatus: TaskStatus.Cancelled,
            }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        const element = wrapper.findComponent(StatusChip);
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered for in progress personal task', async () => {
        await doMount(false, {
          computed: {
            task: () => mockPersonalTaskEntity({
              taskStatus: TaskStatus.InProgress,
            }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        const element = wrapper.findComponent(StatusChip);
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-action-button', () => {
      it('should be rendered when it is team task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-action-button');
        expect(element.exists()).toBeTruthy();
      });

      it('should be rendered when it is in progress personal task and user is creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-id-1' }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-action-button');
        expect(element.exists()).toBeTruthy();
      });

      it('should be rendered when it is in progress personal task and user is L6', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-id-2' }),
          },
        }, 6);
        await flushPromises();
        const element = wrapper.findDataTest('task-details-action-button');
        expect(element.exists()).toBeTruthy();
      });

      it('should be not rendered when it is completed personal task and user is creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-id-1', taskStatus: TaskStatus.Completed }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-action-button');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered when it is in progress personal task and user is not creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-id-2');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-id-1' }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-action-button');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('title', () => {
      it('should return proper data when task type is team', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
          },
        });
        expect(wrapper.vm.title).toEqual('task.task_details.title.team_task_details');
      });

      it('should return proper data when task type is personal', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity(),
          },
        });
        expect(wrapper.vm.title).toEqual('task.task_details.title.personal_task_details');
      });
    });

    describe('task', () => {
      it('should return proper data', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
        });
        const result = mockTeamTaskEntity({ id: 'mock-task-id-1' });
        taskStore.getById = jest.fn(() => result);
        expect(wrapper.vm.task).toEqual(result);
      });
    });

    describe('displayedTaskCategory', () => {
      it('should return proper task category when is team task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
          data() {
            return {
              selectedTaskCategoryId: 'mock-id-1',
            };
          },
          computed: {
            task: () => mockTeamTaskEntity({
              id: 'mock-task-id-1',
              category: { optionItemId: 'mock-id-1' },
            }),
            taskCategories: () => [mockOptionItem({ id: 'mock-id-1' }), mockOptionItem({ id: 'mock-id-2' })],
            isTeamTask: () => true,
            selectedTaskCategory: () => mockOptionItem({ id: 'mock-id-1' }),
          },
        });
        expect(wrapper.vm.displayedTaskCategory).toEqual(wrapper.vm.$m({ translation: {
          en: 'Flood',
          fr: 'Inundation',
        } }));
      });

      it('should return proper task category when is not team task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
          data() {
            return {
              selectedTaskCategoryId: 'mock-id-1',
            };
          },
          computed: {
            task: () => mockPersonalTaskEntity({
              id: 'mock-task-id-1',
              category: {
                optionItemId: 'mock-id-1',
                specifiedOther: 'personal task name',
              },
            }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.displayedTaskCategory).toEqual('personal task name');
      });
    });

    describe('teamTaskCreatorInfo', () => {
      it('should return proper data', async () => {
        await doMount(true, {
          computed: {
            userAccountMetadata: () => mockUserAccountMetadata({ id: 'mock-id-1' }),
          },
        });
        expect(wrapper.vm.teamTaskCreatorInfo).toEqual('task.task_details.by Jane Smith (System Admin)');
      });
    });

    describe('canEdit', () => {
      it('should be true when user has Level6', async () => {
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level6),
        }, 6);
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be false when cancelled even when user has Level6', async () => {
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level6),
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Cancelled }),
          },
        }, 6);
        expect(wrapper.vm.canEdit).toEqual(false);
      });

      it('should be true when task type is personal and user is the creator', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'user-1' }),
            isTeamTask: () => false,
          },
        });
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be true when task type is team, status is InProgress and user has L1', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'user-2' }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be true when task type is team, status is New and user has L1', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'user-2', taskStatus: TaskStatus.New }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be true when task type is team, status is InProgress and user has no L1 but is creator', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level0),
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'user-1' }),
            isTeamTask: () => true,
          },
        });
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be true when task type is team, status is New and user has no L1 but is creator', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level0),
          computed: {
            task: () => mockTeamTaskEntity({ createdBy: 'user-1', taskStatus: TaskStatus.New }),
            isTeamTask: () => true,
          },
        });
        expect(wrapper.vm.canEdit).toEqual(true);
      });

      it('should be false if task is Completed and user has no L6', async () => {
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
            isTeamTask: () => true,
          },
        });
        expect(wrapper.vm.canEdit).toEqual(false);
      });

      it('should be false if task is Completed and user has no L6 and user is the creator', async () => {
        userStore.getUserId = jest.fn(() => 'user-1');
        await doMount(true, {
          pinia: getPiniaForUser(UserRoles.level1),
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Completed, createdBy: 'user-1' }),
            isTeamTask: () => true,
          },
        });
        expect(wrapper.vm.canEdit).toEqual(false);
      });
    });

    describe('assignedToPerson', () => {
      it('should render assigned to me when user is creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.assignedToPerson).toEqual('task.create_edit.assigned_to.me');
      });

      it('should return the name of creator when user is not creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-2');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.assignedToPerson).toEqual('Jane Smith');
      });
    });

    describe('displayWorkingOnIt', () => {
      it('should return true when is team task and in progress', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(true);
      });

      it('should return true when is team task and new', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.New }),
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(true);
      });

      it('should return false when is team task but Completed', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(false);
      });

      it('should return false when is personal task but in progress', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress }),
          },
        });
        expect(wrapper.vm.displayWorkingOnIt).toEqual(false);
      });
    });

    describe('taskAssignedTo', () => {
      it('should return assigned to me when personal task and user is creator', async () => {
        jest.clearAllMocks();
        userStore.getUserId = jest.fn(() => 'mock-user-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.taskAssignedTo).toEqual('task.create_edit.assigned_to.me');
      });

      it('return the name of creator when personal task but user not creator', async () => {
        jest.clearAllMocks();
        userStore.getUserId = jest.fn(() => 'mock-user-2');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.taskAssignedTo).toEqual('Jane Smith');
      });

      it('return assigned team name when is not completed team task', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ assignedTeamId: 'mock-team-id-1' }),
            isTeamTask: () => true,
            assignedTeam: () => mockTeamEntity({ id: 'mock-team-id-1' }),
          },
        });
        await flushPromises();
        expect(wrapper.vm.taskAssignedTo).toEqual('Standard Active Team 1');
      });

      it('return current team name from the last history object when is completed team task', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({
              assignedTeamId: 'mock-team-id-1',
              taskStatus: TaskStatus.Completed,
              taskActionHistories: [
                {
                  actionTaken: ActionTaken.Create,
                  taskStatus: TaskStatus.InProgress,
                  currentTeamId: 'mock-team-id-1',
                  currentTeamName: 'mock-team-1',
                  previousTeamId: '',
                  previousTeamName: '',
                  rationale: 'create task',
                  timestamp: '2023-01-01',
                  userInformation: {
                    userId: 'mock-user-id-1',
                    userName: 'mock-user-name',
                    roleId: 'mock-role-id-1',
                    roleName: {
                      translation: {
                        en: 'mock-role-name en',
                        fr: 'mock-role-name fr',
                      },
                    } },
                },
                {
                  actionTaken: ActionTaken.Completed,
                  taskStatus: TaskStatus.Completed,
                  currentTeamId: 'mock-team-id-3',
                  previousTeamId: 'mock-team-id-3',
                  currentTeamName: 'mock-team-3',
                  previousTeamName: 'mock-team-3',
                  rationale: 'team 3 complete task',
                  timestamp: '2023-01-03',
                  userInformation: {
                    userId: 'mock-user-id-1',
                    userName: 'mock-user-name',
                    roleId: 'mock-role-id-1',
                    roleName: {
                      translation: {
                        en: 'mock-role-name en',
                        fr: 'mock-role-name fr',
                      },
                    },
                  },
                },
              ] }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        expect(wrapper.vm.taskAssignedTo).toEqual('mock-team-3');
      });
    });

    describe('shouldShowActionButton', () => {
      it('should return true for team task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity(),
            isTeamTask: () => true,
          },
        });
        expect(wrapper.vm.shouldShowActionButton).toEqual(true);
      });

      it('should return false for completed personal task', async () => {
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.Completed }),
            isTeamTask: () => false,
          },
        });
        expect(wrapper.vm.shouldShowActionButton).toEqual(false);
      });

      it('should return true for in progress personal task as L6 but not creator', async () => {
        userStore.getUserId = jest.fn(() => 'user-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress, createdBy: 'user-id-2' }),
            isTeamTask: () => false,
          },
        }, 6);
        expect(wrapper.vm.shouldShowActionButton).toEqual(true);
      });

      it('should return true for in progress personal task as creator but not L6', async () => {
        userStore.getUserId = jest.fn(() => 'user-id-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ taskStatus: TaskStatus.InProgress, createdBy: 'user-id-1' }),
            isTeamTask: () => false,
          },
        }, 5);
        expect(wrapper.vm.shouldShowActionButton).toEqual(true);
      });
    });
  });

  describe('Methods', () => {
    describe('navigateBack', () => {
      it('should call $route push with proper path name', async () => {
        wrapper.vm.$router.push = jest.fn();
        wrapper.vm.navigateBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.caseFile.task.home.name });
      });
    });

    describe('getEditTaskRoute', () => {
      it('should call $router push with proper object', async () => {
        await wrapper.setData({
          task: mockTeamTaskEntity(),
        });
        wrapper.vm.getEditTaskRoute();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: 'casefile.task.edit',
          params: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-team-task-id-1',
            taskType: 'team',
          },
        });
      });
    });
  });

  describe('lifecycle', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    describe('Created', () => {
      it('should call fetch task entity with taskID and case file id', async () => {
        taskStore.fetch = jest.fn();
        await wrapper.setProps({
          id: 'mock-case-file-id-1',
          taskId: 'mock-task-id-1',
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(taskStore.fetch).toHaveBeenCalledWith({ caseFileId: 'mock-case-file-id-1', id: 'mock-task-id-1' });
      });

      it('should call fetchTaskCategories', async () => {
        taskStore.fetchTaskCategories = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(taskStore.fetchTaskCategories).toHaveBeenCalled();
      });

      it('should call userAccountMetadataStore fetch when is personal task and user has L5 ', async () => {
        jest.clearAllMocks();
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-id-10' }),
            isTeamTask: () => false,
          },
        });
        taskStore.getById = jest.fn(() => mockPersonalTaskEntity({ createdBy: 'mock-user-id-10' }));

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        await flushPromises();

        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-10', GlobalHandler.Partial);
      });

      it('should not call userAccountMetadataStore fetch when is personal task and user doesnt have L5 ', async () => {
        jest.clearAllMocks();
        taskStore.getById = jest.fn(() => mockPersonalTaskEntity({ createdBy: 'mock-user-id-10' }));
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
          },
        }, 4);
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(userAccountMetadataStore.fetch).not.toHaveBeenCalled();
      });

      it('should call useUserAccountMetadataStore fetch and teamStore fetch if is team task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ createdBy: 'mock-user-id-1' }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(teamStore.fetch).toHaveBeenCalledWith(wrapper.vm.task.assignedTeamId);
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-1', GlobalHandler.Partial);
      });

      it('should set data properly if is team task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({
          category: { optionItemId: 'mock-task-category-1' },
          subCategory: { optionItemId: 'mock-sub-category-name-1' },
          userWorkingOn: 'mock-user-id-1',
        }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.selectedTaskCategoryId).toEqual('mock-task-category-1');
        expect(wrapper.vm.selectedSubCategoryId).toEqual('mock-sub-category-name-1');
        expect(wrapper.vm.isWorkingOn).toEqual(true);
      });

      it('should set selectedSubCategoryId to empty if there is no sub-category', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({
          category: { optionItemId: 'mock-task-name-1' },
          subCategory: null,
        }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.selectedSubCategoryId).toEqual('');
      });

      it('should set filterOutInactiveTaskCategoryAndSubCategory to false', async () => {
        await wrapper.setData({
          filterOutInactiveTaskCategoryAndSubCategory: () => true,
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.filterOutInactiveTaskCategoryAndSubCategory).toEqual(false);
      });

      it('should call fetchSelectedFAPaymentAndSetName if there is financialAssistancePaymentId', async () => {
        await doMount(true, {
          computed: {
            task: () => mockTeamTaskEntity({ financialAssistancePaymentId: 'mock-fa-payment-id-123' }),
          },
        });
        wrapper.vm.fetchSelectedFAPaymentAndSetName = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.fetchSelectedFAPaymentAndSetName).toHaveBeenCalled();
      });
    });
  });

  describe('watcher', () => {
    describe('task.assignedTeamId', () => {
      it('should set isWorkingOn to false when changed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'mock-id-1',
            taskId: 'mock-case-file-id-1',
          },
          data() {
            return {
              mockTask: mockTeamTaskEntity({ assignedTeamId: 'mock-team-1' }),
              isWorkingOn: true,
            };
          },
          computed: {
            task: {
              get() {
                return this.mockTask;
              },
              set(value) {
                this.mockTask = value;
              },
            },
          },
          mocks: {
            $services: services,
          },
        });
        wrapper.vm.task = mockTeamTaskEntity({ assignedTeamId: 'mock-team-2' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.isWorkingOn).toEqual(false);
        expect(teamStore.fetchByIds).toHaveBeenCalledWith([wrapper.vm.task.assignedTeamId], true);
      });
    });
  });
});
