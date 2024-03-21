import { CaseFileStatus, mockCaseFileEntities, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockHouseholdCreate, mockMember } from '@libs/entities-lib/household-create';
import { mockProvider } from '@/services/provider';
import { useMockHouseholdStore } from '@/pinia/household/household.mock';
import { useMockRegistrationStore } from '@libs/stores-lib/registration/registration.mock';
import { mockHouseholdEntity } from '@libs/entities-lib/household';
import { EEventLocationStatus, mockEventSummary } from '@libs/entities-lib/event';
import flushPromises from 'flush-promises';
import Component from '../case-file-impacted-individuals/ImpactedIndividuals.vue';

const localVue = createLocalVue();
let caseFile = mockCaseFileEntity({ id: 'test-id-01' });
const services = mockProvider();
const householdCreate = { ...mockHouseholdCreate({ id: 'mock-hh-id' }), additionalMembers: [mockMember({ id: '1' }), mockMember({ id: '2' }), mockMember({ id: '3' })] };
const householdEntity = mockHouseholdEntity({ id: 'mock-hh-id' });
const events = [
  mockEventSummary({
    id: '1',
    shelterLocations: [{ id: 'loc-1', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-1-active', status: EEventLocationStatus.Active }, { id: ' loc-id-2-inactive', status: EEventLocationStatus.Inactive }],
    name: { translation: { en: 'event-name-1' } },
  }),
  mockEventSummary({
    id: '2',
    shelterLocations: [{ id: 'loc-2', status: EEventLocationStatus.Inactive }, { id: 'loc-3', status: EEventLocationStatus.Active }],
    registrationLocations: [{ id: ' loc-id-3-active', status: EEventLocationStatus.Active }, { id: ' loc-id-4-inactive', status: EEventLocationStatus.Inactive }],
    name: { translation: { en: 'event-name-2' } },
  }),
];

const { pinia, registrationStore } = useMockRegistrationStore();
const { caseFileStore } = useMockCaseFileStore(pinia);
const { householdStore } = useMockHouseholdStore(pinia);

describe('ImpactedIndividuals.vue', () => {
  let wrapper;
  const doMount = async () => {
    const options = {
      localVue,
      pinia,
      propsData: {
        id: caseFile.id,
      },
      data() {
        return {
          caseFileId: caseFile.id,
          caseFiles: mockCaseFileEntities(),
          myEvents: events,
          loading: false,
        };
      },
      computed: {
        caseFile() {
          return caseFile;
        },
        household() {
          return householdCreate;
        },
        householdEntity() {
          return householdEntity;
        },
      },
      mocks: {
        $services: services,
      },
    };
    wrapper = shallowMount(Component, options);
    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await doMount();
  });

  describe('Computed', () => {
    describe('caseFile', () => {
      it('return the case file by id from the storage', () => {
        caseFileStore.getById = jest.fn(() => caseFile);
        expect(JSON.stringify(wrapper.vm.caseFile)).toEqual(JSON.stringify(caseFile));
      });
    });

    describe('household', () => {
      it('returns the right data', () => {
        expect(wrapper.vm.household).toEqual(householdCreate);
      });
    });

    describe('householdEntity', () => {
      it('returns the right data', () => {
        expect(wrapper.vm.householdEntity).toEqual(householdEntity);
      });
    });

    describe('disableEditingByStatus', () => {
      it('should be true when case file status is closed or archived or inactive', () => {
        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Archived });
        doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive });
        doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
        doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(false);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should fetch and load data', async () => {
        await doMount();
        wrapper.vm.fetchHouseholdInfo = jest.fn();
        wrapper.vm.fetchData = jest.fn();
        wrapper.vm.fetchCaseFileActivities = jest.fn();

        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();

        expect(wrapper.vm.fetchHouseholdInfo).toHaveBeenCalled();
        expect(wrapper.vm.fetchData).toHaveBeenCalled();
        expect(wrapper.vm.fetchCaseFileActivities).toHaveBeenCalled();
      });

      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(true);
      });
    });

    describe('destroyed', () => {
      it('should call attachToChanges', async () => {
        wrapper.vm.attachToChanges = jest.fn();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledTimes(0);

        wrapper.destroy();

        expect(wrapper.vm.attachToChanges).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      await doMount();
    });

    describe('fetchData', () => {
      it('should call services, call fetchMyEvents,call fetchShelterLocations', async () => {
        const householdId = wrapper.vm.caseFile.householdId;
        wrapper.vm.fetchMyEvents = jest.fn();
        wrapper.vm.fetchShelterLocations = jest.fn();
        await wrapper.vm.fetchData();
        expect(wrapper.vm.$services.caseFiles.getAllCaseFilesRelatedToHouseholdId).toBeCalledWith(householdId);
        expect(wrapper.vm.fetchMyEvents).toHaveBeenCalled();
        expect(wrapper.vm.fetchShelterLocations).toHaveBeenCalled();
      });
    });

    describe('fetchHouseholdInfo', () => {
      it('calls setHouseholdCreate', async () => {
        jest.spyOn(wrapper.vm, 'setHouseholdCreate').mockImplementation(() => {
        });
        await wrapper.vm.fetchHouseholdInfo();
        expect(wrapper.vm.setHouseholdCreate).toHaveBeenCalledTimes(1);
      });

      it('calls household storage action fetch with the id', async () => {
        jest.clearAllMocks();
        await wrapper.vm.fetchHouseholdInfo();
        expect(householdStore.fetch).toHaveBeenCalledWith(wrapper.vm.caseFile.householdId);
      });
    });

    describe('setHouseholdCreate', () => {
      it('should call buildHouseholdCreateData and the registration mutation with the data received from buildHouseholdCreateData', async () => {
        await doMount();
        jest.spyOn(wrapper.vm, 'buildHouseholdCreateData').mockImplementation(() => householdCreate);
        await wrapper.vm.setHouseholdCreate();
        expect(wrapper.vm.buildHouseholdCreateData).toHaveBeenCalledWith(householdEntity);
        expect(registrationStore.setHouseholdCreate).toHaveBeenCalledWith(householdCreate);
      });
    });
  });
});
