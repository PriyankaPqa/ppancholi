import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';
import { mockTeamTaskEntity } from '@libs/entities-lib/task';
import { mockOptionItem, mockOptionItems, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { MAX_LENGTH_LG } from '@libs/shared-lib/constants/validations';
import flushPromises from 'flush-promises';
import Component from './TeamTaskForm.vue';

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();

describe('TeamTaskForm.vue', () => {
  let wrapper;
  const doMount = async (shallow = true, otherOptions = {}) => {
    const option = {
      localVue,
      pinia,
      propsData: {
        task: mockTeamTaskEntity(),
      },
      computed: {
        taskNames: () => mockOptionItems(),
      },
      ...otherOptions,
    };
    wrapper = shallow ? shallowMount(Component, option) : mount(Component, option);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
    taskStore.getTaskCategories = jest.fn(() => mockOptionItems());
  });

  describe('Template', () => {
    describe('task-name-team-task', () => {
      it('should call resetCurrentCategory when triggering event Change', async () => {
        await doMount();
        wrapper.vm.setTaskNameIdAndResetForm = jest.fn();
        const element = wrapper.findDataTest('task-name-team-task');
        await element.vm.$emit('change');
        expect(wrapper.vm.setTaskNameIdAndResetForm).toHaveBeenCalled();
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

    describe('task-category', () => {
      it('should be disabled when shouldDisableCategorySelect is true', async () => {
        await doMount(true, {
          computed: {
            shouldDisableCategorySelect: () => true,
          },
        });
        const element = wrapper.findDataTest('task-category');
        expect(element.attributes('disabled')).toBeTruthy();
      });

      it('should be disabled when shouldDisableCategorySelect is false', async () => {
        await doMount(true, {
          computed: {
            shouldDisableCategorySelect: () => false,
          },
        });
        const element = wrapper.findDataTest('task-category');
        expect(element.attributes('disabled')).toBeFalsy();
      });

      it('should set selectedCategoryId when change', async () => {
        const element = wrapper.findDataTest('task-category');
        await element.vm.$emit('change', 'mock-category-id');
        expect(wrapper.vm.selectedCategoryId).toEqual('mock-category-id');
      });

      it('should call setCategoryIdAndResetSpecifiedOther with proper id when change', async () => {
        const element = wrapper.findDataTest('task-category');
        wrapper.vm.setCategoryIdAndResetSpecifiedOther = jest.fn();
        await element.vm.$emit('change', 'mock-category-id');
        expect(wrapper.vm.setCategoryIdAndResetSpecifiedOther).toHaveBeenCalledWith('mock-category-id');
      });
    });

    describe('task-specified-other', () => {
      it('should be render when selected category is other', async () => {
        await doMount(true, {
          computed: {
            selectedCategory: () => mockOptionSubItem({ isOther: true }),
          },
        });
        const element = wrapper.findDataTest('task-specified-other');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be render when selected category is not other', async () => {
        await doMount(true, {
          computed: {
            selectedCategory: () => mockOptionSubItem({ isOther: false }),
          },
        });
        const element = wrapper.findDataTest('task-specified-other');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-name-description', () => {
      it('should be rendered when there is description in task name', async () => {
        await doMount(true, {
          computed: {
            selectedTaskName: () => mockOptionItem({ description: {
              translation: {
                en: 'mock-description-content',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-name-description');
        expect(element.exists()).toBeTruthy();
      });

      it('should not be rendered when there is description in task name', async () => {
        await doMount(true, {
          computed: {
            selectedTaskName: () => mockOptionItem({ description: {
              translation: {
                en: '',
                fr: '',
              },
            } }),
          },
        });
        const element = wrapper.findDataTest('task-name-description');
        expect(element.exists()).toBeFalsy();
      });
    });

    describe('task-category-description', () => {
      it('should be rendered when there is description in task category', async () => {
        await doMount(true, {
          computed: {
            selectedCategory: () => mockOptionSubItem({ description: {
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
            selectedCategory: () => mockOptionSubItem({ description: {
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
  });

  describe('Computed', () => {
    describe('shouldDisableCategorySelect', () => {
      it('should be true if there is no selected task name', async () => {
        await doMount();
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            name: {
              optionItemId: null,
            },
          }),
        });
        const element = wrapper.findDataTest('task-category');
        expect(element.attributes('disabled')).toBeTruthy();
      });

      it('should be true if there is selected task name but no taskCategories', async () => {
        await doMount(true, {
          computed: {
            taskCategories: () => [],
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
        taskStore.getTaskCategories = jest.fn(() => mockOptionItems());
        const element = wrapper.findDataTest('task-category');
        expect(element.attributes('disabled')).toBeTruthy();
      });

      it('should be false if there is selected task name and taskCategories', async () => {
        await doMount(true, {
          computed: {
            taskCategories: () => [mockOptionSubItem()],
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
        taskStore.getTaskCategories = jest.fn(() => mockOptionItems());
        const element = wrapper.findDataTest('task-category');
        expect(element.attributes('disabled')).toBeFalsy();
      });
    });

    describe('rules', () => {
      it('should return proper data', async () => {
        await doMount(true, {
          computed: {
            shouldDisableCategorySelect: () => true,
          },
        });
        expect(wrapper.vm.rules).toEqual({
          teamTaskName: {
            required: true,
          },
          teamTaskCategory: {
            required: false,
          },
          description: {
            required: true,
            max: MAX_LENGTH_LG,
          },
          specifyOtherCategory: {
            required: true,
          },
        });
      });
    });
  });

  describe('Methods', () => {
    describe('setTaskNameIdAndResetForm', () => {
      it('should reset category and emit event', async () => {
        await wrapper.setProps({
          task: mockTeamTaskEntity({
            category: {
              optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
              specifiedOther: '123',
            },
            description: 'mock-string',
          }),
        });
        wrapper.vm.setTaskNameIdAndResetForm();
        expect(wrapper.vm.localTaskForm.category).toEqual({
          optionItemId: null,
          specifiedOther: null,
        });
        expect(wrapper.vm.localTaskForm.description).toEqual('');
        expect(wrapper.vm.selectedTaskNameId).toEqual('986192ea-3f7b-4539-8a65-214161aea367');
        expect(wrapper.emitted('reset-form-validation')).toBeTruthy();
      });
    });

    describe('setCategoryIdAndResetSpecifiedOther', () => {
      it('should set category id and reset specifiedOther', async () => {
        await doMount(true, {
          data() {
            return {
              selectedCategoryId: '',
              localTask: {
                category: {
                  specifiedOther: 'mock-string',
                },
              },
            };
          },
        });
        wrapper.vm.setCategoryIdAndResetSpecifiedOther('mock-category-id-123');
        expect(wrapper.vm.selectedCategoryId).toEqual('mock-category-id-123');
        expect(wrapper.vm.localTaskForm.category.specifiedOther).toEqual(null);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should assign data properly', async () => {
        await doMount(true, {
          propsData: {
            task: mockTeamTaskEntity(),
          },
        });
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.localTaskForm).toEqual({
          name: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
            specifiedOther: '',
          },
          category: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea123',
            specifiedOther: '',
          },
          description: 'mock-description',
        });
      });
    });
  });

  describe('watcher', () => {
    describe('localTaskForm', () => {
      it('should emit update:task event and send proper data', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({
          task: mockTeamTaskEntity({ description: '' }),
        });

        const updatedForm = {
          name: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea367',
            specifiedOther: '',
          },
          category: {
            optionItemId: '986192ea-3f7b-4539-8a65-214161aea123',
            specifiedOther: '',
          },
          description: 'mock-description',
        };
        await wrapper.setData({
          localTaskForm: updatedForm,
        });
        expect(wrapper.emitted('update:task')[0][0]).toEqual({
          ...wrapper.vm.task,
          ...updatedForm,
        });
      });
    });
  });
});
