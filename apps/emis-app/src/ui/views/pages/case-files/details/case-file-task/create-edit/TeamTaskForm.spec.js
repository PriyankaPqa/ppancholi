import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { mockTeamTaskEntity, TaskStatus } from '@libs/entities-lib/task';
import { mockOptionItem, mockOptionItems, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import flushPromises from 'flush-promises';
import { useMockFinancialAssistancePaymentStore } from '@/pinia/financial-assistance-payment/financial-assistance-payment.mock';
import Component from './TeamTaskForm.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
const { financialAssistancePaymentStore } = useMockFinancialAssistancePaymentStore(pinia);

describe('TeamTaskForm.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}, level = 5) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        caseFileId: 'mock-case-file-id-1',
        taskData: mockTeamTaskEntity(),
      },
      computed: {
        taskCategories: () => mockOptionItems(),
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, option) : mount(Component, option);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    describe('task-category-team-task', () => {
      it('should call resetCurrentCategory when triggering event Change', async () => {
        await doMount();
        wrapper.vm.setTaskCategoryIdAndResetForm = jest.fn();
        const element = wrapper.findDataTest('task-category-team-task');
        await element.vm.$emit('change');
        expect(wrapper.vm.setTaskCategoryIdAndResetForm).toHaveBeenCalled();
      });
    });

    describe('task-status-chip', () => {
      it('should not be rendered if isEditMode is false', async () => {
        await doMount();
        const element = wrapper.findDataTest('task-status-chip');
        expect(element.exists()).toBeFalsy();
      });

      it('should be rendered if isEditMode is true', async () => {
        await wrapper.setProps({
          isEditMode: true,
        });
        const element = wrapper.findDataTest('task-status-chip');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('task-sub-category', () => {
      it('should be rendered when shouldDisplayCategorySelect is true', async () => {
        await doMount(true, {
          computed: {
            shouldDisplaySubCategorySelect: () => true,
          },
        });
        const element = wrapper.findDataTest('task-sub-category');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when shouldDisplayCategorySelect is false', async () => {
        await doMount(true, {
          computed: {
            shouldDisplaySubCategorySelect: () => false,
          },
        });
        const element = wrapper.findDataTest('task-sub-category');
        expect(element.exists()).toBeFalsy();
      });

      it('should set selectedSubCategoryId when change', async () => {
        const element = wrapper.findDataTest('task-sub-category');
        await element.vm.$emit('change', 'mock-sub-category-id');
        expect(wrapper.vm.selectedSubCategoryId).toEqual('mock-sub-category-id');
      });

      it('should call setSubCategoryIdAndResetSpecifiedOther with proper id when change', async () => {
        const element = wrapper.findDataTest('task-sub-category');
        wrapper.vm.setSubCategoryIdAndResetSpecifiedOther = jest.fn();
        await element.vm.$emit('change', 'mock-sub-category-id');
        expect(wrapper.vm.setSubCategoryIdAndResetSpecifiedOther).toHaveBeenCalledWith('mock-sub-category-id');
      });
    });

    describe('task-specified-other', () => {
      it('should be render when selected sub-category is other', async () => {
        await doMount(true, {
          computed: {
            selectedSubCategory: () => mockOptionSubItem({ isOther: true }),
          },
        });
        const element = wrapper.findDataTest('task-specified-other');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be render when selected sub-category is not other', async () => {
        await doMount(true, {
          computed: {
            selectedSubCategory: () => mockOptionSubItem({ isOther: false }),
          },
        });
        const element = wrapper.findDataTest('task-specified-other');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-category-description', () => {
      it('should be rendered when there is description in task category', async () => {
        await doMount(true, {
          computed: {
            selectedTaskCategory: () => mockOptionItem({ description: {
              translation: {
                en: 'mock-description-content',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-category-description');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when there is description in task category', async () => {
        await doMount(true, {
          computed: {
            selectedTaskCategory: () => mockOptionItem({ description: {
              translation: {
                en: '',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-category-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-sub-category-description', () => {
      it('should be rendered when there is description in task sub-category', async () => {
        await doMount(true, {
          computed: {
            selectedSubCategory: () => mockOptionSubItem({ description: {
              translation: {
                en: 'mock-description-content',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-sub-category-description');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when there is description in task sub-category', async () => {
        await doMount(true, {
          computed: {
            selectedSubCategory: () => mockOptionSubItem({ description: {
              translation: {
                en: '',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-sub-category-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('create-edit-task-FA-select', () => {
      it('should render when selectedTaskCategory isRelatedToFinancialAssistance is true', async () => {
        await doMount(true, {
          computed: {
            selectedTaskCategory: () => mockOptionItem({ isRelatedToFinancialAssistance: true }),
          },
        });

        const element = wrapper.findDataTest('create-edit-task-FA-select');
        expect(element.exists()).toBeTruthy();
      });

      it('should not render when selectedTaskCategory isRelatedToFinancialAssistance is false', async () => {
        await doMount(true, {
          computed: {
            selectedTaskCategory: () => mockOptionItem({ isRelatedToFinancialAssistance: false }),
          },
        });

        const element = wrapper.findDataTest('create-edit-task-FA-select');
        expect(element.exists()).toBeFalsy();
      });
    });
  });

  describe('Computed', () => {
    describe('shouldDisplaySubCategorySelect', () => {
      it('should be false if there is no selected task category', async () => {
        await doMount(true, {
          computed: {
            taskSubCategories: () => [],
          },
        });
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            category: {
              optionItemId: null,
            },
          }),
        });
        taskStore.getTaskCategory = jest.fn(() => []);
        expect(wrapper.vm.shouldDisplaySubCategorySelect).toEqual(false);
      });

      it('should be true if there is selected task category but no taskSubCategories', async () => {
        await doMount(true, {
          computed: {
            taskSubCategories: () => [],
          },
        });
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            category: {
              optionItemId: 'mock-option-id',
            },
          }),
        });
        await wrapper.vm.$nextTick();
        taskStore.getTaskCategory = jest.fn(() => mockOptionItems());
        expect(wrapper.vm.shouldDisplaySubCategorySelect).toEqual(false);
      });

      it('should be true if there is selected task category and taskSubCategories', async () => {
        await doMount(true, {
          computed: {
            taskSubCategories: () => [mockOptionSubItem()],
          },
        });
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            name: {
              optionItemId: 'mock-option-id',
            },
          }),
        });
        await wrapper.vm.$nextTick();
        taskStore.getTaskCategory = jest.fn(() => mockOptionItems());
        expect(wrapper.vm.shouldDisplaySubCategorySelect).toEqual(true);
      });
    });

    describe('rules', () => {
      it('should return proper data', async () => {
        await doMount(true, {
          computed: {
            shouldDisplayCategorySelect: () => true,
          },
        });
        expect(wrapper.vm.rules).toEqual({
          teamTaskCategory: {
            required: true,
          },
          teamTaskSubCategory: {
            required: true,
          },
          description: {
            required: true,
            max: MAX_LENGTH_LG,
          },
          specifyOtherSubCategory: {
            required: true,
          },
        });
      });
    });

    describe('formDisabled', () => {
      it('should return false when user has L6', async () => {
        await doMount(true, {}, 6);
        expect(wrapper.vm.formDisabled).toEqual(false);
      });

      it('should based on the task status when user has no L6', async () => {
        await wrapper.setProps({
          taskData: mockTeamTaskEntity({ taskStatus: TaskStatus.Completed }),
        });
        expect(wrapper.vm.formDisabled).toEqual(true);

        await wrapper.setProps({
          taskData: mockTeamTaskEntity({ taskStatus: TaskStatus.InProgress }),
        });
        expect(wrapper.vm.formDisabled).toEqual(false);
      });
    });
  });

  describe('Methods', () => {
    describe('setTaskCategoryIdAndResetForm', () => {
      it('should reset sub-category, financialAssistancePaymentId and emit event', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            category: {
              optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
              specifiedOther: '123',
            },
            description: 'mock-string',
            financialAssistancePaymentId: 'mock-id-111',
          }),
        });
        wrapper.vm.setTaskCategoryIdAndResetForm();
        expect(wrapper.vm.localTeamTaskForm.subCategory).toEqual({
          optionItemId: null,
          specifiedOther: null,
        });
        expect(wrapper.vm.localTeamTaskForm.description).toEqual('');
        expect(wrapper.vm.localTeamTaskForm.financialAssistancePaymentId).toEqual(null);
        expect(wrapper.vm.selectedTaskCategoryId).toEqual('986192ea-3f7b-4539-8a65-214161aea367');
        expect(wrapper.emitted('reset-form-validation')).toBeTruthy();
      });
    });

    describe('setSubCategoryIdAndResetSpecifiedOther', () => {
      it('should set sub-category id and reset specifiedOther', async () => {
        await doMount(true, {
          data() {
            return {
              selectedSubCategoryId: '',
              localTask: {
                subCategory: {
                  specifiedOther: 'mock-string',
                },
              },
            };
          },
        });
        wrapper.vm.setSubCategoryIdAndResetSpecifiedOther('mock-sub-category-id-123');
        expect(wrapper.vm.selectedSubCategoryId).toEqual('mock-sub-category-id-123');
        expect(wrapper.vm.localTeamTaskForm.subCategory.specifiedOther).toEqual(null);
      });
    });

    describe('fetchFinancialAssistancePaymentData', () => {
      it('should ', async () => {
        financialAssistancePaymentStore.search = jest.fn();
        await wrapper.vm.fetchFinancialAssistancePaymentData('mock-fa-id-1');
        expect(financialAssistancePaymentStore.search).toHaveBeenCalledWith(
          {
            includeInactiveItems: true,
            params:
              { filter: { Entity: { CaseFileId: { type: 'guid', value: 'mock-case-file-id-1' } }, and: [{ 'Entity/Name': { contains: 'mock-fa-id-1' } }] }, top: 5,
              },
          },
        );
      });
    });

    describe('fetchSelectedFinancialAssistancePaymentEntity', () => {
      it('should ', async () => {
        await wrapper.setProps({
          taskData: mockTeamTaskEntity({ financialAssistancePaymentId: 'new-fa-id-1' }),
        });
        financialAssistancePaymentStore.search = jest.fn();
        await wrapper.vm.fetchSelectedFinancialAssistancePaymentEntity();
        expect(financialAssistancePaymentStore.search).toHaveBeenCalledWith(
          {
            params: { filter: { Entity: { Id: { type: 'guid', value: 'new-fa-id-1' } } } },
          },
        );
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should assign data properly', async () => {
        await doMount(true, {
          propsData: {
            caseFileId: 'mock-case-file-id-1',
            taskData: mockTeamTaskEntity(),
          },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.localTeamTaskForm).toEqual({
          category: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
            specifiedOther: '',
          },
          subCategory: {
            optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
            specifiedOther: '',
          },
          description: 'mock-description',
          isUrgent: false,
          financialAssistancePaymentId: '',
        });
      });

      it('should call fetchTaskCategories, fetchFinancialAssistanceData', async () => {
        await doMount(true, {
          propsData: {
            caseFileId: 'mock-case-file-id-1',
            taskData: mockTeamTaskEntity(),
          },
        });
        wrapper.vm.fetchFinancialAssistancePaymentData = jest.fn();
        taskStore.fetchTaskCategories = jest.fn();
        taskStore.taskSubCategories = jest.fn(() => []);
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(taskStore.fetchTaskCategories).toHaveBeenCalled();
        expect(wrapper.vm.fetchFinancialAssistancePaymentData).toHaveBeenCalled();
      });

      it('should set data properly in edit mode', async () => {
        await doMount(true, {
          propsData: {
            caseFileId: 'mock-case-file-id-1',
            taskData: mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1' }),
            isEditMode: true,
          },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.selectedTaskCategoryId).toEqual('986192ea-3f7b-4539-8a65-214161aea367');
        expect(wrapper.vm.selectedSubCategoryId).toEqual('7eb37c59-4947-4edf-8146-c2458bd2b6f6');
      });

      it('should set financialAssistancePaymentId data and call fetchSelectedFinancialAssistancePaymentEntity in edit mode if there is financialAssistancePaymentId', async () => {
        await doMount(true, {
          propsData: {
            caseFileId: 'mock-case-file-id-1',
            taskData: mockTeamTaskEntity({ userWorkingOn: 'mock-user-id-1', financialAssistancePaymentId: 'mock-id-1' }),
            isEditMode: true,
          },
        });
        wrapper.vm.fetchSelectedFinancialAssistancePaymentEntity = jest.fn();
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.localTeamTaskForm.financialAssistancePaymentId).toEqual('mock-id-1');
        expect(wrapper.vm.fetchSelectedFinancialAssistancePaymentEntity).toHaveBeenCalled();
      });
    });
  });

  describe('watcher', () => {
    describe('localTeamTaskForm', () => {
      it('should emit update:task event and send proper data', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({
          taskData: mockTeamTaskEntity({ description: '' }),
        });

        const updatedForm = {
          category: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
            specifiedOther: '',
          },
          subCategory: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea123',
            specifiedOther: '',
          },
          description: 'mock-description',
        };
        await wrapper.setData({
          localTeamTaskForm: updatedForm,
        });
        expect(wrapper.emitted('update:taskData')[0][0]).toEqual({
          ...wrapper.vm.taskData,
          ...updatedForm,
        });
      });
    });
  });
});
