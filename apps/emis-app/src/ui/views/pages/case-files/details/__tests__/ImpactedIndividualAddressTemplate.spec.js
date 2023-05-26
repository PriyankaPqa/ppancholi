import { shallowMount, createLocalVue } from '@/test/testSetup';
import { mockCampGround, mockOther } from '@libs/entities-lib/value-objects/current-address';
import Component from '../case-file-impacted-individuals/components/ImpactedIndividualAddressTemplate.vue';

const localVue = createLocalVue();

describe('ImpactedIndividualAddressTemplate.vue', () => {
  let wrapper;
  const doMount = async () => {
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
          canEdit: true,
        });
        const button = wrapper.findDataTest('edit_button');
        await button.vm.$emit('click');
        expect(wrapper.emitted('open-edit-temporary-address-dialog')).toBeTruthy();
      });
    });
  });
});
