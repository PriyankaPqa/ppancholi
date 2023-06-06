import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockMember } from '@libs/entities-lib/value-objects/member';
import { mockOther } from '@libs/entities-lib/value-objects/current-address';
import flushPromises from 'flush-promises';
import Component from '../case-file-impacted-individuals/components/ImpactedIndividualCard.vue';

const localVue = createLocalVue();

const mockImpactedIndividuals = [{ personId: 'mock-member-id', receivingAssistance: true }];

describe('ImpactedIndividualCard.vue', () => {
  let wrapper;
  const doMount = async (otherComputed = {}, level = 5) => {
    const options = {
      localVue,
      propsData: {
        isPrimaryMember: false,
        member: mockMember({ id: 'mock-member-id' }),
        impactedIndividuals: mockImpactedIndividuals,
        caseFileId: 'mock-cf-id',
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
      },
    };
    wrapper = shallowMount(Component, options);
    await wrapper.vm.$nextTick();
  };
  beforeEach(async () => {
    await doMount();
  });

  describe('Template', () => {
    describe('previous-address-row', () => {
      it('should not exist when there is no previous address data', async () => {
        await doMount({ reorderedAddressHistory: () => [] });
        const element = wrapper.findDataTest('previous-address-row');
        expect(element.exists()).toBeFalsy();
      });

      it('should exist when there is previous address data', async () => {
        await doMount({ reorderedAddressHistory: () => [mockOther()] });
        await wrapper.vm.$nextTick();
        const element = wrapper.findDataTest('previous-address-row');
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
        await doMount(null, 1);
        const toggle = wrapper.findDataTest('receiving_assistance_toggle');
        expect(toggle.attributes('disabled')).toBeFalsy();
      });

      it('should be enabled when user doesnt has level 1', async () => {
        await doMount(null, 0);
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
        expect(wrapper.vm.reorderedAddressHistory).toEqual([mockOther()]);
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
});
