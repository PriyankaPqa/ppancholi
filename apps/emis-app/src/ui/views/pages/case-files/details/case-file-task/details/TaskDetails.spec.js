import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockPersonalTaskEntity, mockTeamTaskEntity, TaskStatus } from '@libs/entities-lib/task';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import routes from '@/constants/routes';
import { useMockUserAccountStore } from '@/pinia/user-account/user-account.mock';
import { mockOptionItem, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import flushPromises from 'flush-promises';
import { mockUserAccountMetadata } from '@libs/entities-lib/user-account';
import { getPiniaForUser, useMockUserStore } from '@/pinia/user/user.mock';
import { UserRoles } from '@libs/entities-lib/user';
import { mockProvider } from '@/services/provider';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { mockTeamEntities, mockTeamEntity } from '@libs/entities-lib/team';
import Component from './TaskDetails.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { userAccountMetadataStore } = useMockUserAccountStore(pinia);
const { userStore } = useMockUserStore(pinia);
const { caseFileStore } = useMockCaseFileStore(pinia);
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
    await doMount();
  });

  describe('Template', () => {
    describe('task-details-is-urgent', () => {
      it('should be rendered when task isUrgent is true', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ isUrgent: true }));
        await doMount(true, {
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
        });
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

    describe('task-details-team-task-name-description', () => {
      it('should render task name description when is team task and has description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedTaskName: () => mockOptionItem({
              translation: {
                en: 'This is item 1 description',
                fr: 'This is item 1 description FR',
              },
            }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-team-task-name-description');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('This is item 1 description');
      });

      it('should not render task name description when is not team task', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity(),
            selectedTaskName: () => mockOptionItem({
              translation: {
                en: 'This is item 1 description',
                fr: 'This is item 1 description FR',
              },
            }),
          },
        });
        const element = wrapper.findDataTest('task-details-team-task-name-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should not render task name description when is team task but has no description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedTaskName: () => ({
              description: {
                translation: {
                  en: '',
                  fr: '',
                },
              } }),
          },
        });
        const element = wrapper.findDataTest('task-details-team-task-name-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-assigned-to', () => {
      it('should render assigned to me when personal task and user is creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-1');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-assigned-to');
        expect(element.text()).toEqual('task.create_edit.assigned_to.me');
      });

      it('should render the name of creator when personal task but user not creator', async () => {
        userStore.getUserId = jest.fn(() => 'mock-user-2');
        await doMount(true, {
          computed: {
            task: () => mockPersonalTaskEntity({ createdBy: 'mock-user-1' }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-assigned-to');
        expect(element.text()).toEqual('Jane Smith');
      });

      it('should render assigned team name when team task', async () => {
        jest.clearAllMocks();
        wrapper.vm.$services.teams.getTeamsByEvent = jest.fn(() => mockTeamEntities());
        await doMount(true, {
          data() {
            return {
              assignedTeam: mockTeamEntity(),
            };
          },
          computed: {
            task: () => mockTeamTaskEntity({ id: 'mock-team-id-1', assignedTeamId: 'mock-team-id-1' }),
            isTeamTask: () => true,
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-assigned-to');
        expect(element.text()).toEqual('Standard Active Team 1');
      });
    });

    describe('task-details-category', () => {
      it('should be rendered when there is selected category', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            selectedCategory: () => mockOptionSubItem(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-category');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('case worker 2');
      });
    });

    describe('task-details-category-description', () => {
      it('should render task category description when is team task and has description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedCategory: () => mockOptionSubItem(),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-category-description');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('case worker 2 description');
      });

      it('should not render task category description when is not team task', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => false,
            task: () => mockPersonalTaskEntity(),
            selectedCategory: () => mockOptionSubItem(),
          },
        });
        const element = wrapper.findDataTest('task-details-category-description');
        expect(element.exists()).toBeFalsy();
      });

      it('should not render task category description when is team task but has no description', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity(),
            selectedCategory: () => ({
              description: {
                translation: {
                  en: '',
                  fr: '',
                },
              } }),
          },
        });
        const element = wrapper.findDataTest('task-details-category-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-details-category-specified-other', () => {
      it('should rendered specified other when there is', async () => {
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
            task: () => mockTeamTaskEntity({
              category: {
                optionItemId: 'mock-category-id-1',
                specifiedOther: 'mock-specified-content',
              },
            }),
          },
        });
        await flushPromises();
        const element = wrapper.findDataTest('task-details-category-specified-other');
        expect(element.exists()).toBeTruthy();
        expect(element.text()).toEqual('mock-specified-content');
      });

      describe('task-details-due-date', () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });
        it('should be rendered proper data when is personal task', async () => {
          await doMount(true, {
            computed: {
              task: () => mockPersonalTaskEntity(),
              isTeamTask: () => false,
            },
          });
          await flushPromises();
          const element = wrapper.findDataTest('task-details-due-date');
          expect(element.text()).toEqual('Aug 1, 2023');
        });
      });

      describe('task-details-date-added', () => {
        beforeEach(() => {
          jest.clearAllMocks();
        });
        it('should be rendered proper data', async () => {
          await doMount(true, {
            computed: {
              task: () => mockTeamTaskEntity({ dateAdded: '2020-02-01' }),
              isTeamTask: () => true,
            },
          });
          await flushPromises();
          const element = wrapper.findDataTest('task-details-date-added');
          expect(element.text()).toEqual('Feb 1, 2020');
        });
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

    describe('displayedTaskName', () => {
      it('should return proper task name when is team task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
          data() {
            return {
              selectedTaskNameId: 'mock-id-1',
            };
          },
          computed: {
            task: () => mockTeamTaskEntity({
              id: 'mock-task-id-1',
              name: { optionItemId: 'mock-id-1' },
            }),
            taskNames: () => [mockOptionItem({ id: 'mock-id-1' }), mockOptionItem({ id: 'mock-id-2' })],
            isTeamTask: () => true,
            selectedTaskName: () => mockOptionItem({ id: 'mock-id-1' }),
          },
        });
        expect(wrapper.vm.displayedTaskName).toEqual(wrapper.vm.$m({ translation: {
          en: 'Flood',
          fr: 'Inundation',
        } }));
      });

      it('should return proper task name when is not team task', async () => {
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
          data() {
            return {
              selectedTaskNameId: 'mock-id-1',
            };
          },
          computed: {
            task: () => mockPersonalTaskEntity({
              id: 'mock-task-id-1',
              name: {
                optionItemId: 'mock-id-1',
                specifiedOther: 'personal task name',
              },
            }),
            isTeamTask: () => false,
          },
        });
        await flushPromises();
        expect(wrapper.vm.displayedTaskName).toEqual('personal task name');
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
  });

  describe('Methods', () => {
    describe('navigateBack', () => {
      it('should call $route push with proper path name', async () => {
        wrapper.vm.$router.push = jest.fn();
        wrapper.vm.navigateBack();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({ name: routes.caseFile.task.home.name });
      });
    });

    describe('getAssignedTeam', () => {
      it('should call getTeamsByEvent and set assignedTeam', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ assignedTeamId: 'guid-team-1' }));
        caseFileStore.getById = jest.fn(() => mockCaseFileEntity({ eventId: 'event-id-1' }));
        wrapper.vm.$services.teams.getTeamsByEvent = jest.fn(() => [mockTeamEntity({ id: 'guid-team-1' })]);
        await doMount(true, {
          propsData: {
            id: 'mock-case-file-id-1',
            taskId: 'mock-task-id-1',
          },
          computed: {
            isTeamTask: () => true,
            caseFile: () => mockCaseFileEntity({ eventId: 'event-id-1' }),
          },
        });
        await flushPromises();
        await wrapper.vm.getAssignedTeam();
        expect(wrapper.vm.$services.teams.getTeamsByEvent).toHaveBeenCalledWith('event-id-1', 'guid-team-1');
        expect(wrapper.vm.assignedTeam).toEqual(mockTeamEntity({ id: 'guid-team-1' }));
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

        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-10', false);
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

      it('should call useUserAccountMetadataStore fetch and getAssignedTeam if is team task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({ createdBy: 'mock-user-id-1' }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        wrapper.vm.getAssignedTeam = jest.fn();
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.getAssignedTeam).toHaveBeenCalled();
        expect(userAccountMetadataStore.fetch).toHaveBeenCalledWith('mock-user-id-1', false);
      });

      it('should set selectedTaskNameId and selectedCategoryId properly if is team task', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({
          name: { optionItemId: 'mock-task-name-1' },
          category: { optionItemId: 'mock-category-name-1' },
        }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.selectedTaskNameId).toEqual('mock-task-name-1');
        expect(wrapper.vm.selectedCategoryId).toEqual('mock-category-name-1');
      });

      it('should set selectedCategoryId to empty if there is no category', async () => {
        taskStore.getById = jest.fn(() => mockTeamTaskEntity({
          name: { optionItemId: 'mock-task-name-1' },
          category: null,
        }));
        await doMount(true, {
          computed: {
            isTeamTask: () => true,
          },
        });
        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);
        expect(wrapper.vm.selectedCategoryId).toEqual('');
      });
    });
  });
});
