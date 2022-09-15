import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockStorage } from '@/storage';
import helpers from '@/ui/helpers/helpers';
import { Status } from '@libs/entities-lib/base';
import Component from './CopyAssessment.vue';

const localVue = createLocalVue();
let storage = mockStorage();

describe('CopyAssessment.vue', () => {
  let wrapper;

  const mountWrapper = async (fullMount = false, level = 6, hasRole = 'role', additionalOverwrites = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      propsData: { show: true },
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
        dataTable = wrapper.findDataTest('table');
      });

      it('renders', () => {
        expect(dataTable.exists()).toBeTruthy();
      });

      it('displays the correct header values', () => {
        const headers = wrapper.findAll('th');

        expect(headers.length).toBe(2);

        expect(headers.wrappers[0].find('span').text()).toBe('assessmentTemplate.assessmentTemplateName');
        expect(headers.wrappers[1].find('span').text()).toBe('');
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

        expect(storage.assessmentTemplate.getters.getByIds).toHaveBeenCalled();

        const params = storage.assessmentTemplate.getters.getByIds.mock.calls[storage.assessmentTemplate.getters.getByIds.mock.calls.length - 1];
        expect(params[0]).toEqual(['abc']);
        expect(params[1].onlyActive).toBeTruthy();
        expect(params[1].baseDate).toBeFalsy();
        expect(params[1].prependPinnedItems).toBeFalsy();
        expect(params[1].parentId).toBeFalsy();
        expect(data.length).toBe(storage.assessmentTemplate.getters.getByIds().length);
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
        helpers.toQuickSearch = jest.fn(() => 'cleanedUp');
        await mountWrapper();
        await wrapper.setData({ search: 'hello' });
        await wrapper.vm.doSearch();
        expect(storage.assessmentTemplate.actions.search).toHaveBeenCalledWith({
          search: 'cleanedUp',
          filter: { 'Entity/Status': Status.Active },
          top: 50,
          queryType: 'full',
          orderBy: `Entity/Name/Translation/${wrapper.vm.$i18n.locale}`,
        });
      });
    });
  });
});
