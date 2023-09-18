import caseFileTask from '@/ui/mixins/caseFileTask';
import { mockOptionItem, mockOptionItems, mockOptionSubItem } from '@libs/entities-lib/optionItem';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { useMockTaskStore } from '@/pinia/task/task.mock';

const Component = {
  render() {},
  mixins: [caseFileTask],
};

const localVue = createLocalVue();
const { pinia, taskStore } = useMockTaskStore();
let wrapper;

describe('caseFileTask', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
    });
  });

  describe('Computed', () => {
    describe('taskNames', () => {
      it('should return proper data from store', () => {
        const options = mockOptionItems();
        taskStore.getTaskCategories = () => options;
        expect(wrapper.vm.taskNames).toEqual(options);
      });
    });

    describe('taskCategories', () => {
      it('should return proper subitems', async () => {
        await wrapper.setData({
          selectedTaskNameId: '1',
        });
        const options = mockOptionItems();
        taskStore.getTaskCategories = jest.fn(() => options);
        const expectedRes = [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }), mockOptionSubItem({ id: '2' })];
        expect(wrapper.vm.taskCategories).toEqual(expectedRes);
      });
    });

    describe('selectedTaskName', () => {
      it('should return proper selected task name option', async () => {
        await wrapper.setData({
          selectedTaskNameId: '1',
        });
        const options = [mockOptionItem({ id: '1' }), mockOptionItem({ id: '2' })];
        taskStore.getTaskCategories = jest.fn(() => options);
        const expectedRes = options.filter((o) => o.id === '1')[0];
        expect(wrapper.vm.selectedTaskName).toEqual(expectedRes);
      });
    });

    describe('selectedCategory', () => {
      it('should return proper selected task category', async () => {
        wrapper = shallowMount(Component, {
          pinia,
          localVue,
          computed: {
            taskNames: () => mockOptionItems(),
            taskCategories: () => [mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }), mockOptionSubItem({ id: '2' })],
          },
        });
        await wrapper.setData({
          selectedTaskNameId: '1',
          selectedCategoryId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6',
        });
        expect(wrapper.vm.selectedCategory).toEqual(mockOptionSubItem({ id: '7eb37c59-4947-4edf-8146-c2458bd2b6f6' }));
      });
    });
  });
});
