import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockCampGround, mockOther } from '@libs/entities-lib/value-objects/current-address';
import Component from '../case-file-impacted-individuals/components/ImpactedIndividualAddressTemplate.vue';

const localVue = createLocalVue();

describe('ImpactedIndividualAddressTemplate.vue', () => {
  let wrapper;
  const doMount = async (level = 5) => {
    const options = {
      localVue,
      propsData: {
        address: mockOther(),
      },
      data() {
        return {
          updatedAddress: mockCampGround(),
        };
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
    describe('current_temporary_address_title', () => {
      it('should display correct content', async () => {
        const element = wrapper.findDataTest('current_temporary_address_title');
        await wrapper.setProps({
          isPreviousTemporaryAddress: true,
        });
        expect(element.text()).toEqual('');

        await wrapper.setProps({
          isPreviousTemporaryAddress: false,
        });
        expect(element.text()).toEqual('impactedIndividuals.current_temporary_address');
      });
    });

    describe('edit_button', () => {
      it('should emit open-edit-temporary-address-dialog when click', async () => {
        await wrapper.setProps({
          showEditButton: true,
        });
        const button = wrapper.findDataTest('edit_button');
        await button.vm.$emit('click');
        expect(wrapper.emitted('open-edit-temporary-address-dialog')).toBeTruthy();
      });

      it('should be disabled when user doesnt have level 1 ', async () => {
        await doMount(0);
        await wrapper.setProps({
          showEditButton: true,
        });
        const button = wrapper.findDataTest('edit_button');
        expect(button.attributes('disabled')).toBeTruthy();
      });

      it('should be enabled when user has level 1 ', async () => {
        await doMount(1);
        await wrapper.setProps({
          showEditButton: true,
        });
        const button = wrapper.findDataTest('edit_button');
        expect(button.attributes('disabled')).toBeFalsy();
      });
    });

    describe('impacted_individuals_card_template_check_in', () => {
      it('should display proper content', async () => {
        await wrapper.setProps({
          address: mockOther(),
        });
        const element = wrapper.findDataTest('impacted_individuals_card_template_check_in');
        expect(element.text()).toEqual('-');

        await wrapper.setProps({
          address: mockCampGround(),
        });
        expect(element.text()).toEqual('May 1, 2023');
      });
    });

    describe('impacted_individuals_card_template_check_out', () => {
      it('should display proper content', async () => {
        await wrapper.setProps({
          address: mockOther(),
        });
        const element = wrapper.findDataTest('impacted_individuals_card_template_check_out');
        expect(element.text()).toEqual('-');

        await wrapper.setProps({
          address: mockCampGround(),
        });
        expect(element.text()).toEqual('May 31, 2023');
      });
    });
  });
});
