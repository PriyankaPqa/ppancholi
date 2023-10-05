import { createLocalVue, mount } from '@/test/testSetup';
import { mockCaseFileEntity } from '@libs/entities-lib/case-file';
import TasksTable from '@/ui/views/pages/case-files/details/case-file-task/TasksTable.vue';
import { mockProvider } from '@/services/provider';
import Component from './CaseFileTaskTable.vue';

const localVue = createLocalVue();
const services = mockProvider();
describe('CaseFileTaskTable.vue', () => {
  let wrapper;
  describe('Template', () => {
    describe('tasks-table', () => {
      it('should pass proper props', () => {
        wrapper = mount(Component, {
          localVue,
          propsData: {
            id: 'mock-case-file-id-1',
          },
          computed: {
            caseFile: () => mockCaseFileEntity({ id: 'mock-case-file-id-1' }),
          },
          mocks: {
            $services: services,
          },
        });
        const component = wrapper.findComponent(TasksTable);
        expect(component.props('id')).toEqual('mock-case-file-id-1');
        expect(JSON.stringify(component.props('caseFile'))).toEqual(JSON.stringify(mockCaseFileEntity({ id: 'mock-case-file-id-1' })));
        expect(component.props('isInCaseFile')).toEqual(true);
      });
    });
  });
});
