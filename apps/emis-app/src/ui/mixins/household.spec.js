import { mockHouseholdEntity } from '@libs/entities-lib/household/household.mocks';
import household from '@/ui/mixins/household';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import { CaseFileStatus, mockCaseFileEntities } from '@libs/entities-lib/case-file';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { mockProvider } from '@/services/provider';

const Component = {
  render() {},
  mixins: [household],
};

const localVue = createLocalVue();
const services = mockProvider();

const { pinia, householdStore } = useMockHouseholdStore();
const { registrationStore } = useMockRegistrationStore(pinia);
let wrapper;

describe('household', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    wrapper = shallowMount(Component, {
      pinia,
      localVue,
      propsData: {
        id: 'id-1',
      },
      mocks: {
        $services: services,
      },
    });
  });

  describe('Computed', () => {
    describe('activeCaseFiles', () => {
      it('returns the open case files', async () => {
        const cfOpen = { caseFileId: '1', caseFileStatus: CaseFileStatus.Open };
        const cfClosed = { caseFileId: '2', caseFileStatus: CaseFileStatus.Closed };
        const caseFiles = [cfOpen, cfClosed];
        await wrapper.setData({ caseFiles });

        expect(wrapper.vm.activeCaseFiles).toEqual([cfOpen]);
      });
    });
  });

  describe('Methods', () => {
    describe('buildHouseholdCreateData', () => {
      it('should call buildHouseholdCreateData from store', async () => {
        const household = mockHouseholdEntity();
        const result = {};
        registrationStore.buildHouseholdCreateData = jest.fn(() => result);
        await wrapper.setData({ shelterLocations: [{}] });
        expect(await wrapper.vm.buildHouseholdCreateData(household)).toBe(result);
        expect(registrationStore.buildHouseholdCreateData).toHaveBeenCalledWith(household, wrapper.vm.shelterLocations);
      });
      it('should call buildHouseholdCreateData', async () => {
        const id = 1;
        wrapper.vm.buildHouseholdCreateData = jest.fn();
        householdStore.fetch = jest.fn(() => mockHouseholdEntity());
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(mockHouseholdEntity());
      });
    });
    describe('fetchHouseholdCreate', () => {
      it('should fetch the household', async () => {
        const id = 1;
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(householdStore.fetch).toHaveBeenCalledWith(id);
      });
      it('should call buildHouseholdCreateData', async () => {
        const id = 1;
        wrapper.vm.buildHouseholdCreateData = jest.fn();
        householdStore.fetch = jest.fn(() => mockHouseholdEntity());
        await wrapper.vm.fetchHouseholdCreate(id);
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(mockHouseholdEntity());
      });
    });

    describe('fetchCaseFiles', () => {
      it('calls fetchCaseFiles with the props id if no argument is passed', async () => {
        await wrapper.vm.fetchCaseFiles();
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toHaveBeenCalledWith(wrapper.vm.id);
      });

      it('calls fetchCaseFiles with the id in the argument', async () => {
        await wrapper.vm.fetchCaseFiles('mock-id');
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toHaveBeenCalledWith('mock-id');
      });

      it('updates caseFiles with the call result if no argument is passed and returns the result', async () => {
        const caseFiles = mockCaseFileEntities();
        wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId = jest.fn(() => caseFiles);
        const result = await wrapper.vm.fetchCaseFiles();
        expect(wrapper.vm.caseFiles).toEqual(caseFiles);
        expect(result).toEqual(caseFiles);
      });
    });

    describe('fetchMyEvents', () => {
      it('calls searchEventSummariesById with the expected parameters if no argument is passed', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'hh-id',
          },
          mocks: {
            $services: services,
          },
        });

        await wrapper.setData({
          caseFiles: [{ eventId: 'id-1' }, { eventId: 'id-2' }],
        });
        wrapper.vm.$services.events.searchEventSummariesById = jest.fn();
        await wrapper.vm.fetchMyEvents();
        expect(wrapper.vm.$services.events.searchEventSummariesById).toHaveBeenCalledWith(['id-1', 'id-2']);
      });

      it('calls searchEventSummariesById with the expected parameters from the argument', async () => {
        const caseFiles = [{ eventId: 'id-1' }, { eventId: 'id-2' }];
        jest.spyOn(wrapper.vm.$services.events, 'searchEventSummariesById').mockImplementation(() => {});
        await wrapper.vm.fetchMyEvents(caseFiles);
        expect(wrapper.vm.$services.events.searchEventSummariesById).toHaveBeenCalledWith(['id-1', 'id-2']);
      });

      it('stores the result in myEvents if there is no argument and returns the result', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          pinia,
          propsData: {
            id: 'hh-id',
          },
          mocks: {
            $services: services,
          },
        });

        await wrapper.setData({
          caseFiles: [{ eventId: 'eventId' }],
        });

        wrapper.vm.$services.events.searchEventSummariesById = jest.fn(() => ({ value: [{ id: 'eventId' }] }));
        const result = await wrapper.vm.fetchMyEvents();
        expect(wrapper.vm.myEvents).toEqual([{ id: 'eventId' }]);
        expect(result).toEqual([{ id: 'eventId' }]);
      });
    });

    describe('fetchShelterLocations', () => {
      it('gets the shelterLocations from my events', async () => {
        const events = [{ shelterLocations: [{ id: 'sl-1' }] }, { shelterLocations: [{ id: 'sl-2' }] }];
        await wrapper.setData({ myEvents: events });
        const result = await wrapper.vm.fetchShelterLocations();
        expect(result).toEqual([{ id: 'sl-1' }, { id: 'sl-2' }]);
      });

      it('calls fetchCaseFiles and fetchMyEvents the shelterLocations from my events if an argument is passed and there are no myEvents in the state', async () => {
        const caseFiles = [{ eventId: 'id-1', caseFileStatus: CaseFileStatus.Open }, { eventId: 'id-2', caseFileStatus: CaseFileStatus.Closed }];
        const events = [{ shelterLocations: [{ id: 'sl-1' }] }, { shelterLocations: [{ id: 'sl-2' }] }];
        await wrapper.setData({ myEvents: null });
        wrapper.vm.fetchCaseFiles = jest.fn(() => caseFiles);
        wrapper.vm.fetchMyEvents = jest.fn(() => events);
        const result = await wrapper.vm.fetchShelterLocations('hh-id');

        expect(wrapper.vm.fetchCaseFiles).toHaveBeenCalledWith('hh-id');
        expect(wrapper.vm.fetchMyEvents).toHaveBeenCalledWith([{ eventId: 'id-1', caseFileStatus: CaseFileStatus.Open }]);
        expect(result).toEqual([{ id: 'sl-1' }, { id: 'sl-2' }]);
      });
    });
  });
});
