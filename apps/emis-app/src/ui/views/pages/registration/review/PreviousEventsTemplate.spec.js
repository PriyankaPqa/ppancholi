import Vuetify from 'vuetify';
import { mockHouseholdCaseFile } from '@libs/entities-lib/household';
import { mockEventMainInfo } from '@libs/entities-lib/event';
import { createLocalVue, shallowMount } from '@/test/testSetup';

import { mockStorage } from '@/storage';
import Component from './PreviousEventsTemplate.vue';

const localVue = createLocalVue();
const storage = mockStorage();
const vuetify = new Vuetify();

const mockCaseFiles = [
  mockHouseholdCaseFile({ caseFileId: 'id-1', eventId: '1' }),
  mockHouseholdCaseFile({ caseFileId: 'id-2', eventId: '2' }),
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
        caseFiles: mockCaseFiles,
        loading: false,
      },
      mocks: {
        $storage: storage,
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
        jest.spyOn(wrapper.vm.$services.publicApi, 'searchEventsById').mockImplementation(() => {});
        await wrapper.vm.fetchEvents();
        expect(wrapper.vm.$services.publicApi.searchEventsById).toHaveBeenCalledWith(['1', '2']);
      });
    });
  });
});
