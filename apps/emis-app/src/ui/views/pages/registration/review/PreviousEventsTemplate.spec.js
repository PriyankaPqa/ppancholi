import Vuetify from 'vuetify';
import { mockCaseFileEntities, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { mockEventMainInfo } from '@libs/entities-lib/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockProvider } from '@/services/provider';
import Component from './PreviousEventsTemplate.vue';

const localVue = createLocalVue();
const services = mockProvider();

const vuetify = new Vuetify();

const mockCaseFiles = [
  mockCaseFileEntity({ id: '1', eventId: '11' }),
  mockCaseFileEntity({ id: '2', eventId: '22' }),
];
const mockEvents = [
  mockEventMainInfo({
    id: mockCaseFiles[0].eventId,
    name: 'n-1',
  }),
  mockEventMainInfo({
    id: mockCaseFiles[1].eventId,
    name: 'n-2',
  }),
];

describe('PreviousEventsTemplate.vue', () => {
  let wrapper;

  beforeEach(async () => {
    jest.clearAllMocks();

    wrapper = shallowMount(Component, {
      localVue,
      vuetify,
      propsData: {
        householdId: 'household-12345-test',
      },
      data() {
        return {
          caseFiles: mockCaseFiles,
          loading: false,
        };
      },
      mocks: {
        $services: services,
      },
    });
  });

  describe('watch', () => {
    describe('caseFiles', () => {
      it('should call fetchEvents if caseFiles is updated', async () => {
        wrapper.vm.fetchEvents = jest.fn();
        await wrapper.setData({ caseFiles: [] });
        expect(wrapper.vm.fetchEvents).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('computed', () => {
    describe('eventNames', () => {
      it('return the expected event names', () => {
        wrapper.setData({ events: mockEvents });
        expect(wrapper.vm.eventNames[mockCaseFiles[0].eventId]).toEqual(mockEvents[0].entity.name);
        expect(wrapper.vm.eventNames[mockCaseFiles[1].eventId]).toEqual(mockEvents[1].entity.name);
      });
    });
  });

  describe('methods', () => {
    describe('fetchEvents', () => {
      it('calls public event search with expected parameters', async () => {
        wrapper.vm.caseFiles = mockCaseFiles;
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.$services.publicApi.searchEventsById).toHaveBeenCalledWith(['11', '22']);
      });
    });
    describe('fetchCaseFilesInformation', () => {
      it('calls caseFile service method getAllCaseFilesRelatedToHouseholdId', () => {
        wrapper.vm.fetchCaseFilesInformation('1');
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toHaveBeenCalledWith('1');
      });

      it('updates caseFiles with the call result', async () => {
        const caseFiles = mockCaseFileEntities();
        wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId = jest.fn(() => caseFiles);
        await wrapper.vm.fetchCaseFilesInformation('1');
        expect(wrapper.vm.caseFiles).toEqual(caseFiles);
      });
    });
  });
  describe('Lifecycle', () => {
    describe('mounted', () => {
      it('should call fetchCaseFilesInformation with householdID from props', async () => {
        jest.clearAllMocks();
        wrapper = shallowMount(Component, {
          localVue,
          vuetify,
          propsData: {
            householdId: 'household-12345-test',
          },
          mocks: {
            $services: services,
          },
        });
        wrapper.vm.fetchCaseFilesInformation = jest.fn();
        await wrapper.vm.$options.mounted.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        expect(wrapper.vm.fetchCaseFilesInformation).toHaveBeenCalledWith('household-12345-test');
      });
    });
  });
});
