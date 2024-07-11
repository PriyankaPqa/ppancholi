import { shallowMount, createLocalVue } from '@/test/testSetup';
import { MembershipStatus, mockCaseFileIndividualEntity, mockReceivingAssistanceDetails } from '@libs/entities-lib/case-file-individual';
import flushPromises from 'flush-promises';
import { mockProvider } from '@/services/provider';
import { useMockPersonStore } from '@/pinia/person/person.mock';
import Component from '../case-file-impacted-individualsV2/components/ImpactedIndividualCardV2.vue';

const localVue = createLocalVue();
const services = mockProvider();
const { pinia } = useMockPersonStore();

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
      it('should trigger onToggleChange when changed', async () => {
        wrapper.vm.onToggleChange = jest.fn();
        const toggle = wrapper.findDataTest('receiving_assistance_toggle');
        await toggle.vm.$emit('change');
        expect(wrapper.vm.onToggleChange).toHaveBeenCalled();
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
    describe('onToggleChange', () => {
      it('should set isReceivingAssistance to proper value and showRequireRationaleDialog to true ', () => {
        wrapper.vm.$services.caseFiles.setPersonReceiveAssistance = jest.fn();
        wrapper.vm.onToggleChange(true);
        expect(wrapper.vm.isReceivingAssistance).toEqual(true);
        expect(wrapper.vm.showRequireRationaleDialog).toEqual(true);
      });
    });

    describe('onCloseDialog', () => {
      it('should reset isReceivingAssistance and set showRequireRationaleDialog to false', async () => {
        await wrapper.setData({
          backUpIsReceivingAssistance: true,
          isReceivingAssistance: false,
          showRequireRationaleDialog: true,
        });
        wrapper.vm.onCloseDialog();
        expect(wrapper.vm.isReceivingAssistance).toEqual(true);
        expect(wrapper.vm.showRequireRationaleDialog).toEqual(false);
      });
    });
  });
});
