import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import { useMockAssessmentTemplateStore } from '@/pinia/assessment-template/assessment-template.mock';
import { createTestingPinia } from '@pinia/testing';
import Component from './CopyAssessment.vue';

const localVue = createLocalVue();
let pinia = createTestingPinia({ stubActions: false });
let assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;

describe('CopyAssessment.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: { show: true },
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
    assessmentTemplateStore = useMockAssessmentTemplateStore(pinia).assessmentTemplateStore;
    jest.clearAllMocks();
  });

  describe('Template', () => {
    describe('data table', () => {
      let dataTable;
      beforeEach(async () => {
        await mountWrapper(true);
        dataTable = wrapper.findDataTest('table');
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(2);

        expect(headers.wrappers[0].find('span').text()).toBe('assessmentTemplate.assessmentTemplateName');
        expect(headers.wrappers[1].find('span').text()).toBe('common.copy');
      });

      it('displays the correct row for templates mode', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Assessment Floods 2021');
        expect(tds.wrappers[1].text()).toBe('common.copy');
      });
    });
  });

  describe('Computed', () => {
    describe('items', () => {
      it('should call getById with correct storage for templates', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.items;

        expect(assessmentTemplateStore.getByIds).toHaveBeenCalled();

        const params = assessmentTemplateStore.getByIds.mock.calls[assessmentTemplateStore.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(data.length).toBe(assessmentTemplateStore.getByIds().length);
      });
    });
  });

  describe('watch', () => {
    describe('search', () => {
      it('launches a search', async () => {
        await mountWrapper();
        wrapper.vm.doSearch = jest.fn();
        jest.clearAllMocks();
        await wrapper.setData({ search: 'hello' });
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 750));
        expect(wrapper.vm.doSearch).toHaveBeenCalled();
      });
    });
  });

  describe('methods', () => {
    describe('close', () => {
      it('emits update:show false', async () => {
        await mountWrapper();
        await wrapper.vm.close();
        expect(wrapper.emitted('update:show')[0][0]).toEqual(false);
      });
    });

    describe('copy', () => {
      it('emits selected', async () => {
        await mountWrapper();
        const someObject = {};
        await wrapper.vm.copy(someObject);
        expect(wrapper.emitted('selected')[0][0]).toBe(someObject);
      });
    });

    describe('doSearch', () => {
      it('searches storage', async () => {
        const quickSearchSqlObject = {
          and: [{
            'metadata/searchableText': {
              contains: 'hello',
            },
          }],
        };

        helpers.toQuickSearchSql = jest.fn(() => quickSearchSqlObject);
        await mountWrapper();
        await wrapper.setData({ search: 'hello' });
        await wrapper.vm.doSearch();
        expect(assessmentTemplateStore.search).toHaveBeenCalledWith({
          params: {
            filter: { ...quickSearchSqlObject },
            top: 50,
            orderBy: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
          },
          includeInactiveItems: false,
        });
      });
    });
  });
});
