import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import {
  AssociationType,
} from '@libs/entities-lib/assessment-template';
import { useMockAssessmentFormStore } from '@/pinia/assessment-form/assessment-form.mock';
import { useMockAssessmentResponseStore } from '@/pinia/assessment-response/assessment-response.mock';
import { createTestingPinia } from '@pinia/testing';

import Component from './AddCaseFileAssessment.vue';

const localVue = createLocalVue();

let pinia = createTestingPinia({ stubActions: false });
let assessmentFormStore = useMockAssessmentFormStore(pinia).assessmentFormStore;
let assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;

describe('AddCaseFileAssessment.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      propsData: {
        show: true, eventId: 'eventId', caseFileId: 'cfId', excludedIds: ['id1', 'id2'],
      },
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
    assessmentResponseStore = useMockAssessmentResponseStore(pinia).assessmentResponseStore;
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

        expect(headers.length).toBe(3);

        expect(headers.wrappers[0].find('span').text()).toBe('assessmentTemplate.name');
        expect(headers.wrappers[1].find('span').text()).toBe('assessmentTemplate.program');
        expect(headers.wrappers[2].find('span').text()).toBe('');
      });

      it('displays the correct row for templates mode', async () => {
        const tds = wrapper.findAll('td');

        expect(tds.wrappers[0].text()).toBe('Assessment Floods 2021');
        expect(tds.wrappers[1].text()).toBe('Prog EN');
        expect(tds.wrappers[2].text()).toBe('common.add');
      });
    });
  });

  describe('Computed', () => {
    describe('items', () => {
      it('should call getById', async () => {
        await mountWrapper();
        await wrapper.setData({ searchResultIds: ['abc'] });
        const data = wrapper.vm.items;

        expect(assessmentFormStore.getByIds).toHaveBeenCalled();

        const params = assessmentFormStore.getByIds.mock.calls[assessmentFormStore.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(data.length).toBe(assessmentFormStore.getByIds().length);
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

    describe('select', () => {
      it('calls create then closes', async () => {
        await mountWrapper();
        const someObject = { entity: { id: 'newId' } };
        wrapper.vm.close = jest.fn();
        await wrapper.vm.select(someObject);
        expect(assessmentResponseStore.create).toHaveBeenCalled();
        const params = assessmentResponseStore.create.mock.calls[assessmentResponseStore.create.mock.calls.length - 1];
        expect(params[0].assessmentFormId).toEqual('newId');
        expect(params[0].association).toEqual({ id: 'cfId', type: AssociationType.CaseFile });
      });
    });

    describe('doSearch', () => {
      it('searches storage', async () => {
        helpers.toQuickSearch = jest.fn(() => 'cleanedUp');
        await mountWrapper();
        await wrapper.setData({ search: 'hello' });
        await wrapper.vm.doSearch();
        expect(assessmentFormStore.search).toHaveBeenCalledWith({
          params: {
            search: 'cleanedUp',
            filter: { 'Entity/EventId': 'eventId', 'Entity/Status': Status.Active, 'Entity/Id': { notSearchIn_az: ['id1', 'id2'] } },
            top: 50,
            queryType: 'full',
            orderBy: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
          },
          searchEndpoint: null,
        });
      });
    });
  });
});
