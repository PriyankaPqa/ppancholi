import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { useMockBookingRequestStore } from '@/pinia/booking-request/booking-request.mock';
import { mockTeamEntity } from '@libs/entities-lib/team';
import { useMockUserStore } from '@/pinia/user/user.mock';
import { mockMember } from '@libs/entities-lib/household-create';
import { EEventStatus, mockEventEntity } from '@libs/entities-lib/event';
import { mockCaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import Component from '../case-file-impacted-individualsV2/ImpactedIndividualsV2.vue';

const localVue = createLocalVue();
const services = mockProvider();
let caseFile = mockCaseFileEntity({ id: 'test-id-01' });
const event = mockEventEntity({ id: 'test-id-01' });
event.schedule.status = EEventStatus.Open;

const { pinia } = useMockPersonStore();
const teamStore = useMockTeamStore(pinia).teamStore;
const bookingRequestStore = useMockBookingRequestStore(pinia).bookingRequestStore;
const userStore = useMockUserStore(pinia).userStore;

let featureList = [];

describe('ImpactedIndividualsV2.vue', () => {
  let wrapper;
  const doMount = async (fullMount = false, level = 5, additionalOverwrites = {}, additionalComputeds = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      featureList,
      propsData: {
        id: 'cf-id',
      },
      computed: {
        caseFile() {
          return caseFile;
        },
        event() {
          return event;
        },
        primaryMember() {
          return mockMember();
        },
        ...additionalComputeds,
      },
      mocks: {
        $services: services,
        $hasLevel: (lvl) => lvl <= `level${level}`,
      },
      ...additionalOverwrites,
    });

    await wrapper.vm.$nextTick();
  };

  beforeEach(async () => {
    featureList = [];
    caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
    jest.clearAllMocks();
    await doMount();
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('checks whether user is part of booking team', async () => {
        jest.clearAllMocks();
        caseFile = mockCaseFileEntity({ id: 'test-id-01', eventId: 'some event' });
        await doMount();
        expect(teamStore.search).toHaveBeenCalledWith({ params: { filter: {
          Entity: { Events: { any: { Id: { value: 'some event', type: 'guid' } } } },
          'Entity/UseForLodging': true,
        } } });
        expect(wrapper.vm.bookingTeams).toEqual(teamStore.search().values);
        expect(bookingRequestStore.fetchAll).toHaveBeenCalledWith({ caseFileId: wrapper.vm.caseFileId });

        expect(wrapper.vm.userCanProvideCrcAddress).toBeFalsy();

        await doMount(false, 6);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeFalsy();

        featureList = [wrapper.vm.$featureKeys.Lodging];
        await doMount(false, 6);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeTruthy();

        await doMount(false, 5);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeFalsy();

        teamStore.search = jest.fn(() => ({ values: [mockTeamEntity({ teamMembers: [{ id: userStore.getUserId() }] })] }));
        await doMount(false, 5);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeTruthy();

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount(false, 5);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeFalsy();
        await doMount(false, 6);
        expect(wrapper.vm.userCanProvideCrcAddress).toBeTruthy();
      });
    });
  });

  describe('computed', () => {
    describe('disableEditingByStatus', () => {
      it('should be true when case file status is closed or archived or inactive', async () => {
        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Archived });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(false);
      });
    });

    describe('pendingBookingRequest', () => {
      it('calls store and filters for pending requests', async () => {
        const result = wrapper.vm.pendingBookingRequest;
        expect(bookingRequestStore.getByCaseFile).toHaveBeenCalledWith(wrapper.vm.caseFileId);
        expect(result.id).toEqual('3-pending');
      });
    });

    describe('canRequestBooking', () => {
      it('returns true for non booking people l1+', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        bookingRequestStore.getByCaseFile = jest.fn(() => []);
        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();

        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();

        await doMount(false, 0);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();
        bookingRequestStore.getByCaseFile = bck;
      });

      it('returns false when a pending request or case file disabled', async () => {
        featureList = [wrapper.vm.$featureKeys.Lodging];
        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();

        bookingRequestStore.getByCaseFile = jest.fn(() => []);
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();

        caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();
      });

      it('returns false when primary has crc provided', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        bookingRequestStore.getByCaseFile = jest.fn(() => []);

        const individual = mockCaseFileIndividualEntity();
        individual.personId = mockMember().id;
        individual.currentAddress.crcProvided = false;
        await doMount(false, 1, {}, {
          individuals() {
            return [individual];
          },
        });
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();
        individual.currentAddress.crcProvided = true;
        await doMount(false, 1, {}, {
          individuals() {
            return [individual];
          },
        });
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();

        bookingRequestStore.getByCaseFile = bck;
      });
    });

    describe('canMoveToNewAddress', () => {
      it('depends on userCanProvideCrcAddress and canRequestBooking', async () => {
        featureList = [wrapper.vm.$featureKeys.Lodging];
        await doMount(false, 1, {}, {
          canRequestBooking() {
            return false;
          },
        });
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canMoveToNewAddress).toBeFalsy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canMoveToNewAddress).toBeTruthy();

        await doMount(false, 1, {}, {
          canRequestBooking() {
            return true;
          },
        });
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canMoveToNewAddress).toBeTruthy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canMoveToNewAddress).toBeTruthy();
      });
    });

    describe('canExtendStay', () => {
      it('depends on userCanProvideCrcAddress and a current address thats crcprovided', async () => {
        featureList = [wrapper.vm.$featureKeys.Lodging];
        const individual = mockCaseFileIndividualEntity();
        individual.currentAddress.crcProvided = false;
        await doMount(false, 1, {}, {
          activeIndividuals() {
            return [individual];
          },
        });
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canExtendStay).toBeFalsy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canExtendStay).toBeFalsy();

        individual.currentAddress.crcProvided = true;

        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canExtendStay).toBeFalsy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canExtendStay).toBeTruthy();
      });
    });
  });

  // describe('methods', () => {
  //   describe('startMoveProcess', () => {
  //     it('should be true when case file status is closed or archived or inactive', async () => {
  //       // caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
  //       // await doMount();
  //       // expect(wrapper.vm.disableEditingByStatus).toEqual(true);

  //       // caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Archived });
  //       // await doMount();
  //       // expect(wrapper.vm.disableEditingByStatus).toEqual(true);

  //       // caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive });
  //       // await doMount();
  //       // expect(wrapper.vm.disableEditingByStatus).toEqual(true);

  //       // caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
  //       // await doMount();
  //       // expect(wrapper.vm.disableEditingByStatus).toEqual(false);
  //     });
  //   });
  // });
});
