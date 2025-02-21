import { RcDataTable } from '@libs/component-lib/components';
import { EFilterType } from '@libs/component-lib/types';
import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import routes from '@/constants/routes';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template.mock';
import { createTestingPinia } from '@pinia/testing';
import { useMockProgramStore } from '@/pinia/program/program.mock';

import Component from './AssessmentTemplatesHome.vue';

const localVue = createLocalVue();

let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
let programStore = useMockProgramStore(pinia).programStore;

describe('AssessmentTemplatesHome.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: { },
      mocks: {
        $hasLevel: (lvl) => (lvl <= `level${level}`) && !!level,
        $hasRole: (r) => r === hasRole,

      },
      ...additionalOverwrites,
    });
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    pinia = createTestingPinia({ stubActions: false });
    assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
    assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
    programStore = useMockProgramStore(pinia).programStore;
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(async () => {
        await mountWrapper(true);
        wrapper.search = jest.fn();
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
        expect(headers.wrappers[3].find('span').text()).toBe('common.edit');
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
        expect(headers.wrappers[4].find('span').text()).toBe('common.edit');
      });

      it('displays the correct row for forms mode', async () => {
        await mountWrapper(true, 6, 'role', { propsData: { id: 'abc' } });
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Program A');
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

        expect(assessmentTemplateStore.getByIdsWithPinnedItems).toHaveBeenCalled();

        const params = assessmentTemplateStore.getByIdsWithPinnedItems.mock.calls[assessmentTemplateStore.getByIdsWithPinnedItems.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(data.length).toBe(assessmentTemplateStore.getByIdsWithPinnedItems().length);
      });

      it('should call getById  with correct storage for forms', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.tableData;
        expect(assessmentFormStore.getByIdsWithPinnedItems).toHaveBeenCalled();

        const params = assessmentFormStore.getByIdsWithPinnedItems.mock.calls[assessmentFormStore.getByIdsWithPinnedItems.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(data.length).toBe(assessmentFormStore.getByIdsWithPinnedItems().length);
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
          program: 'Metadata/Program/Translation/en',
          submissions: 'Metadata/TotalSubmissions',
        });
      });

      it('should return for forms', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });

        expect(wrapper.vm.customColumns).toEqual({
          name: 'Entity/Name/Translation/en',
          status: 'Metadata/AssessmentFormStatusName/Translation/en',
          published: 'Entity/PublishStatus',
          edit: 'edit',
          program: 'Metadata/Program/Translation/en',
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
              dataTest: 'Active',
            },
            {
              text: 'Inactive',
              value: 'Inactive',
              dataTest: 'Inactive',
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
              dataTest: 'Active',
            },
            {
              text: 'Inactive',
              value: 'Inactive',
              dataTest: 'Inactive',
            },
          ],
          type: EFilterType.MultiSelect,
          label: 'common.status',
        },
        {
          key: 'Entity/ProgramId',
          type: EFilterType.Select,
          keyType: 'guid',
          label: 'assessmentTemplate.program',
          items: wrapper.vm.programs,
          loading: wrapper.vm.programsLoading,
          disabled: wrapper.vm.programsLoading,
        }]);
      });
    });

    describe('baseRoute', () => {
      it('return home of correct mode', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        expect(wrapper.vm.baseRoute).toBe(routes.events.assessments);
        await mountWrapper();
        expect(wrapper.vm.baseRoute).toBe(routes.assessmentTemplates);
      });
    });

    describe('isFormMode', () => {
      it('return true if assessment is an assessment form', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        expect(wrapper.vm.isFormMode).toBeTruthy();
        await mountWrapper();
        expect(wrapper.vm.isFormMode).toBeFalsy();
      });
    });

    describe('labels', () => {
      it('return correct value based on form mode', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
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

    describe('tableProps', () => {
      it('returns the correct object', async () => {
        await mountWrapper();
        assessmentTemplateStore.searchLoading = false;
        wrapper.vm.search = jest.fn();
        expect(wrapper.vm.tableProps.loading).toEqual(false);
        expect(wrapper.vm.tableProps.itemClass).toBeDefined();
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
          filter: { MyFilter: 'zzz' }, top: 10, skip: 10, orderBy: 'name asc',
        };
      });

      it('should call storage actions with proper parameters for template mode', async () => {
        await mountWrapper();
        await wrapper.vm.fetchData(params);

        expect(assessmentTemplateStore.search).toHaveBeenCalledWith({
          params: {
            filter: { MyFilter: 'zzz' },
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
          },
          includeInactiveItems: true,
        });
      });

      it('should call storage actions with proper parameters for forms mode', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.vm.fetchData(params);

        expect(assessmentFormStore.search).toHaveBeenCalledWith({
          params: {
            filter: { MyFilter: 'zzz', 'Entity/EventId': { value: 'abc', type: 'guid' } },
            top: params.top,
            skip: params.skip,
            orderBy: params.orderBy,
            count: true,
          },
          includeInactiveItems: true,
        });
      });
    });

    describe('getProgramName', () => {
      it('should return the right text', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.setData({ programs: [{ value: 'abc', text: 'cde' }, { value: 'abc1', text: 'cde1' }] });

        expect(wrapper.vm.getProgramName({ programId: 'abc1' })).toEqual('cde1');
      });
    });

    describe('fetchPrograms', () => {
      it('should call fetchAllIncludingInactive', async () => {
        await mountWrapper(false, 6, 'role', { propsData: { id: 'abc' } });
        await wrapper.vm.fetchPrograms();

        expect(programStore.fetchAllIncludingInactive).toHaveBeenCalledWith({ eventId: wrapper.vm.id });
        expect(wrapper.vm.programs).toEqual([{ text: 'Program A', value: '1' }, { text: 'Program A', value: '2' }]);
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
