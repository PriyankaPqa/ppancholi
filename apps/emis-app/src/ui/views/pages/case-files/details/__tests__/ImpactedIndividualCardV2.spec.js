import { shallowMount, createLocalVue } from '@/test/testSetup';
import { MembershipStatus, mockCaseFileIndividualEntity, mockReceivingAssistanceDetails } from '@libs/entities-lib/case-file-individual';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import { useMockCaseFileIndividualStore } from '@/pinia/case-file-individual/case-file-individual.mock';
import Component from '../case-file-impacted-individualsV2/components/ImpactedIndividualCardV2.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia } = useMockPersonStore();
const { caseFileIndividualStore } = useMockCaseFileIndividualStore(pinia);

describe('ImpactedIndividualCardV2.vue', () => {
  let wrapper;
  const doMount = async (otherComputed = {}, otherProps = {}, level = 5) => {
    const options = {
      localVue,
      pinia,
      propsData: {
        isPrimaryMember: false,
        individual: mockCaseFileIndividualEntity(),
        caseFileId: 'mock-cf-id',
        ...otherProps,
      },
      data() {
        return {
          showEditMemberDialog: false,
          showPreviousTemporaryAddress: false,
          isReceivingAssistance: false,
        };
      },
      computed: {
        ...otherComputed,
      },
      mocks: {
        $hasLevel: (lvl) => lvl <= `level${level}`,
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

  describe('Template', () => {
    describe('previous-address-section', () => {
      it('should not exist when there is no previous address data', async () => {
        await doMount({ reorderedAddressHistory: () => [] });
        const element = wrapper.findDataTest('previous-address-section');
        expect(element.exists()).toBeFalsy();
      });

      it('should exist when there is previous address data', async () => {
        await doMount();
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('previous-address-section');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('primary_member_label', () => {
      it('should not exist when isPrimaryMember is false', async () => {
        await wrapper.setProps({
          isPrimaryMember: false,
        });
        const element = wrapper.findDataTest('primary_member_label');
        expect(element.exists()).toBeFalsy();
      });

      it('should exist when isPrimaryMember is true', async () => {
        await wrapper.setProps({
          isPrimaryMember: true,
        });
        const element = wrapper.findDataTest('primary_member_label');
        expect(element.exists()).toBeTruthy();
      });
    });

    describe('impacted_individual_card_display_name', () => {
      it('should display proper full name', () => {
        const element = wrapper.findDataTest('impacted_individual_card_display_name');
        expect(element.text()).toEqual('Bob Smith');
      });
    });

    describe('previous-address-icon', () => {
      it('should be chevron-up when showPreviousTemporaryAddress is true. Should be chevron-down when its false', async () => {
        await wrapper.setData({
          showPreviousTemporaryAddress: true,
        });
        const icon = wrapper.findDataTest('previous-address-icon');
        expect(icon.text()).toEqual('mdi-chevron-up');

        await wrapper.setData({
          showPreviousTemporaryAddress: false,
        });
        expect(icon.text()).toEqual('mdi-chevron-down');
      });
    });

    describe('receiving_assistance_toggle', () => {
      it('should trigger onReceivingAssistanceChange when changed', async () => {
        wrapper.vm.onReceivingAssistanceChange = jest.fn();
        const toggle = wrapper.findDataTest('receiving_assistance_toggle');
        await toggle.vm.$emit('change');
        expect(wrapper.vm.onReceivingAssistanceChange).toHaveBeenCalled();
      });

      it('should be enabled when user has level 1', async () => {
        await doMount(null, null, 1);
        const toggle = wrapper.findDataTest('receiving_assistance_toggle');
        expect(toggle.attributes('disabled')).toBeFalsy();
      });

      it('should be disabled when user doesnt has level 1', async () => {
        await doMount(null, null, 0);
        const toggle = wrapper.findDataTest('receiving_assistance_toggle');
        expect(toggle.attributes('disabled')).toBeTruthy();
      });
    });
  });

  describe('Computed', () => {
    describe('displayName', () => {
      it('should return proper data', () => {
        expect(wrapper.vm.displayName).toEqual('Bob Smith');
      });
    });

    describe('reorderedAddressHistory', () => {
      it('should return reordered address history', () => {
        expect(wrapper.vm.reorderedAddressHistory).toEqual([mockCaseFileIndividualEntity().temporaryAddressHistory[1]]);
      });
    });

    describe('lastReceivingAssistanceChange', () => {
      it('should return the last detail if there is more than one', async () => {
        await wrapper.setProps({ individual: mockCaseFileIndividualEntity({ receivingAssistanceDetails: [mockReceivingAssistanceDetails()] }) });
        expect(wrapper.vm.lastReceivingAssistanceChange).toEqual(null);
        await wrapper.setProps({ individual: mockCaseFileIndividualEntity({ receivingAssistanceDetails: [
          mockReceivingAssistanceDetails({ detailDate: '2020-01-01' }),
          mockReceivingAssistanceDetails({ detailDate: '2020-07-01' }),
          mockReceivingAssistanceDetails({ detailDate: '2020-05-01' }),
        ] }) });
        expect(wrapper.vm.lastReceivingAssistanceChange).toEqual(mockReceivingAssistanceDetails({ detailDate: '2020-07-01' }));
      });
    });

    describe('disableEditing', () => {
      it('should be true when props disableEditingByStatus is true', async () => {
        expect(wrapper.vm.disableEditing).toEqual(false);
        await wrapper.setProps({
          disableEditingByStatus: true,
        });
        expect(wrapper.vm.disableEditing).toEqual(true);
      });

      it('should be true when member is removed is true', async () => {
        expect(wrapper.vm.disableEditing).toEqual(false);
        wrapper.vm.individual.membershipStatus = MembershipStatus.Removed;
        expect(wrapper.vm.disableEditing).toEqual(true);
      });

      it('should be true when user doesnt have L1', async () => {
        await doMount(null, null, 0);
        expect(wrapper.vm.disableEditing).toEqual(true);
      });

      it('should return false when user has L6', async () => {
        await doMount(null, null, 6);
        expect(wrapper.vm.disableEditing).toEqual(false);
      });
    });

    describe('disableEditingAddress', () => {
      it('based on disableEditing and pendingbooking request', async () => {
        await doMount({
          disableEditing() {
            return false;
          },
        });
        expect(wrapper.vm.disableEditingAddress).toEqual(false);

        await wrapper.setProps({
          pendingBookingRequest: {},
        });
        expect(wrapper.vm.disableEditingAddress).toEqual(true);

        await doMount({
          disableEditing() {
            return true;
          },
        });
        expect(wrapper.vm.disableEditingAddress).toEqual(true);
        await wrapper.setProps({
          pendingBookingRequest: {},
        });
        expect(wrapper.vm.disableEditingAddress).toEqual(true);
      });

      it('should be true when member is removed is true', async () => {
        expect(wrapper.vm.disableEditing).toEqual(false);
        wrapper.vm.individual.membershipStatus = MembershipStatus.Removed;
        expect(wrapper.vm.disableEditing).toEqual(true);
      });

      it('should be true when user doesnt have L1', async () => {
        await doMount(null, null, 0);
        expect(wrapper.vm.disableEditing).toEqual(true);
      });

      it('should return false when user has L6', async () => {
        await doMount(null, null, 6);
        expect(wrapper.vm.disableEditing).toEqual(false);
      });
    });
  });

  describe('lifecycle', () => {
    describe('created', () => {
      it('should load data', async () => {
        await wrapper.vm.$options.created.forEach((hook) => {
          hook.call(wrapper.vm);
        });
        await flushPromises();
        expect(wrapper.vm.isReceivingAssistance).toEqual(true);
      });
    });
  });

  describe('Method', () => {
    describe('openEditAddress', () => {
      it('should set newAddress and open dialog', () => {
        expect(wrapper.vm.newAddress).toBeFalsy();
        expect(wrapper.vm.showEditMemberDialog).toBeFalsy();
        wrapper.vm.openEditAddress(true);
        expect(wrapper.vm.newAddress).toBeTruthy();
        expect(wrapper.vm.showEditMemberDialog).toBeTruthy();
        wrapper.vm.openEditAddress(false);
        expect(wrapper.vm.newAddress).toBeFalsy();
        expect(wrapper.vm.showEditMemberDialog).toBeTruthy();
      });
    });

    describe('onReceivingAssistanceChange', () => {
      it('should show the dialog and save if answered', async () => {
        const answer = { answered: true, rationale: 'some rationale' };
        wrapper.vm.$refs.rationaleDialog.open = jest.fn(() => answer);
        wrapper.vm.$refs.rationaleDialog.close = jest.fn();
        await wrapper.setData({ isReceivingAssistance: true });
        await wrapper.vm.onReceivingAssistanceChange();

        expect(caseFileIndividualStore.addReceiveAssistanceDetails)
          .toHaveBeenCalledWith(wrapper.vm.caseFileId, wrapper.vm.individual.id, { receivingAssistance: true, rationale: 'some rationale' });
        expect(wrapper.vm.isReceivingAssistance).toEqual(true);
        expect(wrapper.vm.$refs.rationaleDialog.close).toHaveBeenCalled();
      });

      it('should show the dialog and reset isreceivingassistance if not answered', async () => {
        const answer = { answered: false, rationale: null };
        wrapper.vm.$refs.rationaleDialog.open = jest.fn(() => answer);
        wrapper.vm.$refs.rationaleDialog.close = jest.fn();
        await wrapper.setData({ isReceivingAssistance: true });
        await wrapper.vm.onReceivingAssistanceChange();

        expect(caseFileIndividualStore.addReceiveAssistanceDetails).not.toHaveBeenCalled();
        expect(wrapper.vm.isReceivingAssistance).toEqual(false);
      });
    });
  });
});
