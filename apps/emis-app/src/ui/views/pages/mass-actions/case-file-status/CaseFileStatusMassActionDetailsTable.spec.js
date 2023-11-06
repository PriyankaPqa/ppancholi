import { createLocalVue, shallowMount } from '@/test/testSetup';
import { mockCombinedMassAction, mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockCaseFileStore } from '@/pinia/case-file/case-file.mock';
import { CaseFileStatus } from '@libs/entities-lib/case-file';
import { mockListOption } from '@libs/entities-lib/user-account';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import { mockProvider } from '@/services/provider';
import Component from './CaseFileStatusMassActionDetailsTable.vue';

const localVue = createLocalVue();
const services = mockProvider();

const { caseFileStore, pinia } = useMockCaseFileStore();

describe('CaseFileStatusMassActionDetailsTable.vue', () => {
  let wrapper;

  const doMount = (otherData) => {
    const massAction = mockMassActionEntity();
    massAction.details.status = CaseFileStatus.Open;
    massAction.details.reason = mockListOption();
    massAction.details.rationale = 'rationale';

    const options = {
      localVue,
      pinia,
      propsData: {
        massAction,
      },
      data() {
        return {
          ...otherData,
        };
      },
      mocks: {
        $services: services,
      },
    };

    wrapper = shallowMount(Component, options);
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        event: mockEventEntity(),
      });
    });
    describe('rows', () => {
      it('should return proper rows if there is a reason and a rationale', () => {
        wrapper.vm.reason = { translation: { en: 'mock-reason' } };
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massAction.caseFileStatus.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massAction.caseFileStatus.create.status.label',
            value: 'enums.CaseFileStatus.Open',
            dataTest: 'status',
          },
          {
            label: 'massAction.caseFileStatus.reason.label',
            value: 'mock-reason',
            dataTest: 'reason',
          }, {
            label: 'caseFile.changeStatusConfirm.Rationale',
            value: 'rationale',
            dataTest: 'rationale',
          },
        ]);
      });

      it('should return proper rows if there is no reason and no rationale', async () => {
        wrapper.vm.reason = null;
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Open } }) });
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massAction.caseFileStatus.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massAction.caseFileStatus.create.status.label',
            value: 'enums.CaseFileStatus.Open',
            dataTest: 'status',
          },
        ]);
      });

      it('should return proper rows if there is a reason and other reason', () => {
        wrapper.vm.reason = { translation: { en: 'mock-reason' } };
        wrapper.vm.otherReason = 'other-reason';
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massAction.caseFileStatus.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massAction.caseFileStatus.create.status.label',
            value: 'enums.CaseFileStatus.Open',
            dataTest: 'status',
          },
          {
            label: 'massAction.caseFileStatus.reason.label',
            value: 'mock-reason',
            dataTest: 'reason',
          }, {
            label: 'massAction.caseFileStatus.otherReason.label',
            value: 'other-reason',
            dataTest: 'otherReason',
          }, {
            label: 'caseFile.changeStatusConfirm.Rationale',
            value: 'rationale',
            dataTest: 'rationale',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(wrapper.vm.$services.publicApi.searchEventsById).toHaveBeenCalledWith([id]);
      });
    });

    describe('makeReasonLabels', () => {
      it('sets correct reason name when status is closed', async () => {
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Closed, reason: { optionItemId: 'mock-id-2' } } }) });
        caseFileStore.getCloseReasons = jest.fn(() => [mockOptionItem({ id: 'mock-id-1', name: 'mock-name-1' }), mockOptionItem({ id: 'mock-id-2', name: 'mock-name-2' })]);
        await wrapper.vm.makeReasonLabels();
        expect(wrapper.vm.reason).toEqual('mock-name-2');
      });

      it('sets correct reason name when status is inactive', async () => {
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Inactive, reason: { optionItemId: 'mock-id-3' } } }) });
        caseFileStore.getInactiveReasons = jest.fn(() => [mockOptionItem({ id: 'mock-id-3', name: 'mock-name-3' }), mockOptionItem({ id: 'mock-id-4', name: 'mock-name-4' })]);
        await wrapper.vm.makeReasonLabels();
        expect(wrapper.vm.reason).toEqual('mock-name-3');
      });

      it('sets correct otherReason name when option item isOther is true', async () => {
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Inactive,
          reason: { optionItemId: 'mock-id-1', specifiedOther: 'mock-other' } } }) });
        caseFileStore.getInactiveReasons = jest.fn(() => [mockOptionItem({ id: 'mock-id-1', name: 'mock-name-1' }), mockOptionItem({ id: 'mock-id-4', name: 'mock-name-4' })]);
        await wrapper.vm.makeReasonLabels();
        expect(wrapper.vm.otherReason).toEqual('mock-other');
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('created', () => {
      it('calls fetch event', async () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvent = jest.fn();

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.fetchEvent).toHaveBeenCalledTimes(1);
      });

      it('calls fetchInactiveReasons if status is inactive', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Inactive } }) });

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(caseFileStore.fetchInactiveReasons).toHaveBeenCalledTimes(1);
      });

      it('calls fetchCloseReasons if status is closed', async () => {
        jest.clearAllMocks();
        await wrapper.setProps({ massAction: mockMassActionEntity({ details: { status: CaseFileStatus.Closed } }) });

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(caseFileStore.fetchCloseReasons).toHaveBeenCalledTimes(1);
      });
    });
  });
});
