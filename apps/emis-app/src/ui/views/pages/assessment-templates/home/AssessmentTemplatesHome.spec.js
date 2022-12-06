import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import routes from '@/constants/routes';
import Component from './AssessmentTemplatesHome.vue';

const localVue = createLocalVue();
let storage = mockStorage();

describe('AssessmentTemplatesHome.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: { },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,
        $storage: storage,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    storage = mockStorage();
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(async () => {
        await mountWrapper(true);
        dataTable = wrapper.findComponent(RcDataTable);
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values for templates mode', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(4);

        expect(headers.wrappers[0].find('span').text()).toBe('common.name');
        expect(headers.wrappers[1].find('span').text()).toBe('assessmentTemplate.published');
        expect(headers.wrappers[2].find('span').text()).toBe('common.status');
        expect(headers.wrappers[3].find('span').text()).toBe('');
      });

      it('displays the correct row for templates mode', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Assessment Floods 2021');
        expect(tds.wrappers[1].text()).toBe('enums.assessmentPublishStatus.Published');
        expect(tds.wrappers[2].text()).toBe('enums.Status.Active');
      });

      it('displays the correct header values for forms mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(5);

        expect(headers.wrappers[0].find('span').text()).toBe('assessmentTemplate.program');
        expect(headers.wrappers[1].find('span').text()).toBe('common.name');
        expect(headers.wrappers[2].find('span').text()).toBe('assessmentTemplate.published');
        expect(headers.wrappers[3].find('span').text()).toBe('common.status');
        expect(headers.wrappers[4].find('span').text()).toBe('');
      });

      it('displays the correct row for forms mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Prog EN');
        expect(tds.wrappers[1].text()).toBe('Assessment Floods 2021');
        expect(tds.wrappers[2].text()).toBe('enums.assessmentPublishStatus.Published');
        expect(tds.wrappers[3].text()).toBe('enums.Status.Active');
      });
    });
  });

  describe('Computed', () => {
    describe('tableData', () => {
      it('should call getById with correct storage for templates', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;

        expect(storage.assessmentTemplate.getters.getByIds).toHaveBeenCalled();

        const params = storage.assessmentTemplate.getters.getByIds.mock.calls[storage.assessmentTemplate.getters.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(params[1].baseDate).toBeFalsy();
        expect(params[1].prependPinnedItems).toBeTruthy();
        expect(params[1].parentId).toBeFalsy();
        expect(data.length).toBe(storage.assessmentTemplate.getters.getByIds().length);
      });

      it('should call getById  with correct storage for forms', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;
        expect(storage.assessmentForm.getters.getByIds).toHaveBeenCalled();

        const params = storage.assessmentForm.getters.getByIds.mock.calls[storage.assessmentForm.getters.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(params[1].baseDate).toBeFalsy();
        expect(params[1].prependPinnedItems).toBeTruthy();
        expect(params[1].parentId).toEqual({ eventId: 'abc' });
        expect(data.length).toBe(storage.assessmentForm.getters.getByIds().length);
      });
    });

    describe('customColumns', () => {
      it('should return for templates', async () => {
        await mountWrapper();

        expect(wrapper.vm.customColumns).toEqual({
          name: 'Entity/Name/Translation/en',
          status: 'Metadata/AssessmentTemplateStatusName/Translation/en',
          published: 'Entity/PublishStatus',
          edit: 'edit',
          program: 'Metadata/ProgramName/Translation/en',
          submissions: 'Metadata/TotalSubmissions',
        });
      });

      it('should return for forms', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });

        expect(wrapper.vm.customColumns).toEqual({
          name: 'Entity/Name/Translation/en',
          status: 'Metadata/AssessmentFormStatusName/Translation/en',
          published: 'Entity/PublishStatus',
          edit: 'edit',
          program: 'Metadata/ProgramName/Translation/en',
          submissions: 'Metadata/TotalSubmissions',
        });
      });
    });

    describe('filters', () => {
      it('returns correct value depending on mode', async () => {
        await mountWrapper();
        expect(wrapper.vm.filters).toEqual([{
          key: 'Entity/Name/Translation/en',
          type: EFilterType.Text,
          label: 'common.name',
        },
        {
          key: 'Metadata/AssessmentTemplateStatusName/Translation/en',
          items: [
            {
              text: 'Active',
              value: 'Active',
            },
            {
              text: 'Inactive',
              value: 'Inactive',
            },
          ],
          type: EFilterType.MultiSelect,
          label: 'common.status',
        }]);

        await wrapper.setProps({ id: 'myId' });

        expect(wrapper.vm.filters).toEqual([{
          key: 'Entity/Name/Translation/en',
          type: EFilterType.Text,
          label: 'common.name',
        },
        {
          key: 'Metadata/AssessmentFormStatusName/Translation/en',
          items: [
            {
              text: 'Active',
              value: 'Active',
            },
            {
              text: 'Inactive',
              value: 'Inactive',
            },
          ],
          type: EFilterType.MultiSelect,
          label: 'common.status',
        },
        {
          key: 'Entity/ProgramId',
          type: EFilterType.Select,
          label: 'assessmentTemplate.program',
          items: wrapper.vm.programsFilter,
          loading: wrapper.vm.programsFilterLoading,
          disabled: wrapper.vm.programsFilterLoading,
        }]);
      });
    });

    describe('baseRoute', () => {
      it('return home of correct mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        expect(wrapper.vm.baseRoute).toBe(routes.events.assessments);
        await mountWrapper();
        expect(wrapper.vm.baseRoute).toBe(routes.assessmentTemplates);
      });
    });

    describe('isFormMode', () => {
      it('return true if assessment is an assessment form', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        expect(wrapper.vm.isFormMode).toBeTruthy();
        await mountWrapper();
        expect(wrapper.vm.isFormMode).toBeFalsy();
      });
    });

    describe('labels', () => {
      it('return correct value based on form mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'assessments.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'assessmentTemplate.addNew',
          },
        });
        await mountWrapper();
        expect(wrapper.vm.labels).toEqual({
          header: {
            title: 'assessmentTemplate.title',
            searchPlaceholder: 'common.inputs.quick_search',
            addButtonLabel: 'assessmentTemplate.addNew',
          },
        });
      });
    });

    describe('menuItems', () => {
      it('return correct value', async () => {
        await mountWrapper();
        expect(wrapper.vm.menuItems).toEqual([{
          text: 'assessmentTemplate.addNew',
          value: 'CreateNew',
          icon: 'mdi-file',
        }, {
          text: 'assessmentTemplate.copy',
          value: 'Copy',
          icon: 'mdi-file-multiple',
        }]);
      });
    });
  });

  describe('Lifecycle', () => {
    describe('created', () => {
      it('calls loadState', async () => {
        await mountWrapper();
        jest.spyOn(wrapper.vm, 'loadState').mockImplementation(() => {});

        const hook = wrapper.vm.$options.created[0];
        await hook.call(wrapper.vm);

        expect(wrapper.vm.loadState).toHaveBeenCalled();
        expect(wrapper.vm.saveState).toBeTruthy();
      });
    });
  });

  describe('Methods', () => {
    describe('fetchData', () => {
      let params;

      beforeEach(() => {
        params = {
          search: 'query', filter: { MyFilter: 'zzz' }, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters for template mode', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.assessmentTemplate.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: { MyFilter: 'zzz' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });

      it('should call storage actions with proper parameters for forms mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.vm.fetchData(params);

        expect(wrapper.vm.$storage.assessmentForm.actions.search).toHaveBeenCalledWith({
          search: params.search,
          filter: { MyFilter: 'zzz', 'Entity/EventId': 'abc' },
          top: params.top,
          skip: params.skip,
          orderBy: params.orderBy,
          count: true,
          queryType: 'full',
          searchMode: 'all',
        }, null, true);
      });
    });

    describe('fetchProgramsFilter', () => {
      it('should call storage actions', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.vm.fetchProgramsFilter();

        expect(wrapper.vm.$storage.program.actions.fetchAllIncludingInactive).toHaveBeenCalledWith({ eventId: wrapper.vm.id });
        expect(wrapper.vm.programsFilter).toEqual([{ text: 'Program A', value: '1' }, { text: 'Program A', value: '2' }, { text: 'Program A', value: '3' }]);
      });
    });

    describe('getAssessmentDetailsRoute', () => {
      it('should return details page', async () => {
        await mountWrapper();
        const route = wrapper.vm.getAssessmentDetailsRoute('id');
        expect(route).toEqual({
          name: wrapper.vm.baseRoute.details.name,
          params: {
            assessmentTemplateId: 'id',
          },
        });
      });
    });

    describe('getAssessmentEditRoute', () => {
      it('should redirect to edit page', async () => {
        await mountWrapper();
        wrapper.vm.getAssessmentEditRoute('id');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.edit.name,
          params: {
            assessmentTemplateId: 'id',
          },
        });
      });
    });

    describe('duplicateSurvey', () => {
      it('should redirect to duplicate page with cloneid', async () => {
        await mountWrapper();
        wrapper.vm.duplicateSurvey({ id: 'surveyId' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.duplicate.name,
          params: {
            cloneId: 'surveyId',
            id: wrapper.vm.id,
          },
        });
      });
    });

    describe('goToAdd', () => {
      it('should redirect to create page when not copying', async () => {
        await mountWrapper();
        wrapper.vm.goToAdd();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.push).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.create.name,
        });
      });

      it('should show popup when copying', async () => {
        await mountWrapper();
        expect(wrapper.vm.showCopyAssessmentDialog).toBeFalsy();
        wrapper.vm.goToAdd({ value: 'Copy' });
        expect(wrapper.vm.showCopyAssessmentDialog).toBeTruthy();
      });
    });

    describe('copySampleLink', () => {
      it('should copy the url to runner page', async () => {
        navigator.clipboard = { writeText: jest.fn() };
        await mountWrapper();
        wrapper.vm.copySampleLink({ id: 'testId' });
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.runner.name,
          params: {
            assessmentTemplateId: 'testId',
            id: wrapper.vm.id,
          },
        });
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(`http://localhost${wrapper.vm.$router.resolve().href}`);
      });
    });

    describe('editorMode', () => {
      it('should open new tab to editor page', async () => {
        await mountWrapper();
        window.open = jest.fn();
        wrapper.vm.editorMode('editId');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.resolve).toHaveBeenCalledWith({
          name: wrapper.vm.baseRoute.builder.name,
          params: {
            assessmentTemplateId: 'editId',
            id: wrapper.vm.id,
          },
        });
        expect(window.open).toHaveBeenCalledWith(wrapper.vm.$router.resolve().href, '_blank');
      });
    });
  });
});
