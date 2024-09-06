import { CaseFileStatus, mockCaseFileEntity } from '@libs/entities-lib/case-file';
import { shallowMount, mount, createLocalVue } from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockTeamStore } from '@/pinia/team/team.mock';
import { useMockBookingRequestStore } from '@/pinia/booking-request/booking-request.mock';
import { mockTeamEntity } from '@libs/entities-lib/team';
import { useMockUserStore } from '@/pinia/user/user.mock';
import Component from '../case-file-impacted-individualsV2/ImpactedIndividualsV2.vue';
import { CaseFileDetailsMock } from './caseFileDetailsMock.mock';
import { LodgingMode } from '../../../lodging/bookingHelper';

const localVue = createLocalVue();
const services = mockProvider();

const { pinia } = useMockPersonStore();
const teamStore = useMockTeamStore(pinia).teamStore;
const bookingRequestStore = useMockBookingRequestStore(pinia).bookingRequestStore;
const userStore = useMockUserStore(pinia).userStore;

let detailsMock = new CaseFileDetailsMock();

let featureList = [];

describe('ImpactedIndividualsV2.vue', () => {
  let wrapper;
  const doMount = async (fullMount = false, level = 5, additionalOverwrites = {}, additionalComputeds = {}) => {
    wrapper = (fullMount ? mount : shallowMount)(Component, {
      localVue,
      pinia,
      featureList,
      propsData: detailsMock.propsData,
      computed: {
        ...detailsMock.computed,
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
    detailsMock = new CaseFileDetailsMock();
    jest.clearAllMocks();
    await doMount();
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('checks whether user is part of booking team', async () => {
        jest.clearAllMocks();
        detailsMock.mocks.caseFile = mockCaseFileEntity({ id: 'test-id-01', eventId: 'some event' });
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

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
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
        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Archived });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive });
        await doMount();
        expect(wrapper.vm.disableEditingByStatus).toEqual(true);

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open });
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
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();

        bookingRequestStore.getByCaseFile = jest.fn(() => []);
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();
        bookingRequestStore.getByCaseFile = bck;
      });

      it('returns false when anyone has crc provided', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        bookingRequestStore.getByCaseFile = jest.fn(() => []);

        const individual = detailsMock.mocks.individuals[0];
        individual.currentAddress.crcProvided = false;
        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeTruthy();
        individual.currentAddress.crcProvided = true;
        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestBooking).toBeFalsy();

        bookingRequestStore.getByCaseFile = bck;
      });
    });

    describe('canRequestUpdate', () => {
      it('returns true for non booking people l1+', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        bookingRequestStore.getByCaseFile = jest.fn(() => []);
        const individual = detailsMock.mocks.individuals[0];
        individual.currentAddress.crcProvided = true;

        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeTruthy();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        expect(wrapper.vm.canRequestUpdate).toBeFalsy();

        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeTruthy();

        await doMount(false, 0);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeFalsy();
        bookingRequestStore.getByCaseFile = bck;
      });

      it('returns false when a pending request or case file disabled', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        const individual = detailsMock.mocks.individuals[0];
        individual.currentAddress.crcProvided = true;

        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeFalsy();

        bookingRequestStore.getByCaseFile = jest.fn(() => []);
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeTruthy();

        detailsMock.mocks.caseFile = mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Closed });
        await doMount(false, 5);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeFalsy();
        bookingRequestStore.getByCaseFile = bck;
      });

      it('returns true when anyone has crc provided', async () => {
        const bck = bookingRequestStore.getByCaseFile;
        featureList = [wrapper.vm.$featureKeys.Lodging];
        bookingRequestStore.getByCaseFile = jest.fn(() => []);

        const individual = detailsMock.mocks.individuals[0];
        individual.currentAddress.crcProvided = false;
        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeFalsy();
        individual.currentAddress.crcProvided = true;
        await doMount(false, 1);
        await wrapper.setData({ userCanProvideCrcAddress: false });
        expect(wrapper.vm.canRequestUpdate).toBeTruthy();

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
        const individual = detailsMock.mocks.individuals[0];
        individual.currentAddress.crcProvided = false;
        await doMount(false, 1);
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

  describe('methods', () => {
    describe('startMoveProcess', () => {
      it('should start the process with the selected people', async () => {
        await doMount(false, 6, {}, {
          pendingBookingRequest() {
            return null;
          },
        });
        wrapper.vm.$refs.selectIndividualsDialog = {
          open: jest.fn(() => ({ answered: true, selectedIndividuals: [detailsMock.mocks.individuals[0].id] })), close: jest.fn(),
        };

        await wrapper.vm.startMoveProcess();
        const params = wrapper.vm.$refs.selectIndividualsDialog.open.mock.calls[0];
        expect(params[0].title).toEqual('impactedIndividuals.selectMove.title');
        expect(params[0].textUserSelection).toEqual('impactedIndividuals.selectMove.content');
        expect(params[0].individuals).toEqual([
          {
            ...detailsMock.mocks.members[0],
            caseFileIndividualId: detailsMock.mocks.individuals[0].id,
            isPrimary: true,
          }, {
            ...detailsMock.mocks.members[1],
            caseFileIndividualId: detailsMock.mocks.individuals[1].id,
            isPrimary: false,
          },
        ]);

        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.MoveCrcProvidedNotAllowed);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        await wrapper.setData({ userCanProvideCrcAddress: true, selectedIndividuals: [], showMoveDialog: false });
        await wrapper.vm.startMoveProcess();
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.MoveCrcProvidedAllowed);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        wrapper.vm.$refs.selectIndividualsDialog = {
          open: jest.fn(() => ({ answered: false, selectedIndividuals: [] })), close: jest.fn(),
        };
        await wrapper.setData({ userCanProvideCrcAddress: true, selectedIndividuals: [], showMoveDialog: false });
        jest.clearAllMocks();
        await wrapper.vm.startMoveProcess();
        expect(wrapper.vm.showMoveDialog).toBeFalsy();
      });

      it('when there is a pending request we instead go for booking mode', async () => {
        wrapper.vm.$refs.selectIndividualsDialog = {
          open: jest.fn(() => ({ answered: true, selectedIndividuals: [detailsMock.mocks.individuals[0].id] })), close: jest.fn(),
        };
        await wrapper.setData({ userCanProvideCrcAddress: true });

        await wrapper.vm.startMoveProcess();
        expect(wrapper.vm.$refs.selectIndividualsDialog.open).not.toHaveBeenCalled();
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.BookingMode);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();
      });
    });

    describe('startExtendStay', () => {
      it('should start the process with people with crc provided addresses', async () => {
        detailsMock.mocks.individuals[0].currentAddress.crcProvided = true;
        // inactive person filtered out
        detailsMock.mocks.individuals[3].currentAddress.crcProvided = true;
        await wrapper.vm.startExtendStay();
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.ExtendStay);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        detailsMock.mocks.individuals[1].currentAddress.crcProvided = true;
        await doMount();
        await wrapper.vm.startExtendStay();
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id, detailsMock.mocks.individuals[1].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.ExtendStay);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();
      });
    });

    describe('taskSaved', () => {
      it('hides the dialog and shows a confirmation', async () => {
        wrapper.vm.$toasted.global.success = jest.fn();
        await wrapper.setData({ showTaskDialog: true });
        wrapper.vm.taskSaved();
        expect(wrapper.vm.showTaskDialog).toBeFalsy();
        expect(wrapper.vm.$toasted.global.success).toHaveBeenCalledWith('impactedIndividuals.requestSent');
      });
    });

    describe('startEditAddress', () => {
      it('should start the process with people same addresses', async () => {
        detailsMock.mocks.individuals[0].currentAddress.crcProvided = true;
        await wrapper.vm.startEditAddress(detailsMock.mocks.individuals[0]);
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.EditCrcProvidedAsNonLodging);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        detailsMock.mocks.individuals[1].currentAddress.crcProvided = true;
        await doMount();
        await wrapper.vm.startEditAddress(detailsMock.mocks.individuals[0]);
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id, detailsMock.mocks.individuals[1].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.EditCrcProvidedAsNonLodging);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        detailsMock.mocks.individuals[0].currentAddress.crcProvided = false;
        await doMount();
        await wrapper.vm.startEditAddress(detailsMock.mocks.individuals[0]);
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.EditNotCrcProvided);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        detailsMock.mocks.individuals[0].currentAddress.crcProvided = true;
        detailsMock.mocks.individuals[0].currentAddress.takeover = true;
        await doMount();
        await wrapper.vm.startEditAddress(detailsMock.mocks.individuals[0]);
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.EditCrcProvidedAsNonLodging);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();

        await doMount();
        await wrapper.setData({ userCanProvideCrcAddress: true });
        await wrapper.vm.startEditAddress(detailsMock.mocks.individuals[0]);
        expect(wrapper.vm.selectedIndividuals).toEqual([detailsMock.mocks.individuals[0].id]);
        expect(wrapper.vm.lodgingMode).toEqual(LodgingMode.EditCrcProvidedAsLodging);
        expect(wrapper.vm.showMoveDialog).toBeTruthy();
      });
    });
  });
});
