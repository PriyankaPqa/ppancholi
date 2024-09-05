import { createLocalVue } from '@/test/testSetup';
import CaseFileTable from '@/ui/views/pages/case-files/CaseFilesTable.vue';
import EventStats from '@/ui/views/pages/home/components/stats/EventStats.vue';
import { mockProvider } from '@/services/provider';
import { useMockEventStore } from '@/pinia/event/event.mock';
import { shallowMount } from '@vue/test-utils';
import Component from './HomeContributorIM.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia } = useMockEventStore();

describe('HomeContributorIM.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('shows CaseFileTable and EventStats component', () => {
      wrapper = shallowMount(Component, {
        localVue,
        pinia,
        mocks: {
          $services: services,
        },
      });
      expect(wrapper.findComponent(CaseFileTable)).toBeTruthy();
      expect(wrapper.findComponent(EventStats)).toBeTruthy();
    });
  });
});
