import { i18n } from '@/ui/plugins/i18n';
import { MAX_LENGTH_MD } from '@/constants/validations';
import _merge from 'lodash/merge';
import helpers from '@libs/entities-lib/helpers';
import {
  mockContactInformation,
  mockMember,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, EIndigenousTypes,
} from '@libs/entities-lib/household-create';
import { createLocalVue, shallowMount } from '../../test/testSetup';
import Component from './IndigenousIdentityForm.vue';

const localVue = createLocalVue();

describe('IndigenousIdentityForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: _merge(mockContactInformation(), mockMember()),
        canadianProvincesItems: helpers.getCanadianProvincesWithoutOther(i18n),
        indigenousTypesItems: mockIndigenousTypesItems(),
        indigenousCommunitiesItems: mockIndigenousCommunitiesItems(),
        loading: false,
      },
    });
  });

  describe('Computed', () => {
    describe('rules', () => {
      test('indigenousType', () => {
        expect(wrapper.vm.rules.indigenousType).toEqual({
          required: false,
        });
      });

      test('indigenousCommunityId', () => {
        expect(wrapper.vm.rules.indigenousCommunityId).toEqual({
          required: wrapper.vm.formCopy.indigenousType != null,
        });
      });

      test('indigenousCommunityOther', () => {
        expect(wrapper.vm.rules.indigenousCommunityOther).toEqual({
          required: true,
          max: MAX_LENGTH_MD,
        });
      });
    });
  });

  describe('Template', () => {
    describe('indigenousType', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__indigenousType');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousType);
      });
    });

    // describe('indigenousCommunityId', () => {
    //   it('is linked to proper rules', () => {
    //     const element = wrapper.findDataTest('personalInfo__indigenousCommunityId');
    //     expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityId);
    //   });
    // });

    // describe('indigenousCommunityOther', () => {
    //   it('is linked to proper rules', async () => {
    //     await wrapper.setData({
    //       formCopy: {
    //         indigenousType: EIndigenousTypes.Other,
    //       },
    //     });
    //
    //     const element = wrapper.findDataTest('personalInfo__indigenousCommunityOther');
    //     expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityOther);
    //   });
    // });

    test('change event is emitted when form changes', async () => {
      wrapper.vm.formCopy.indigenousCommunityId = 'test';
      expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.formCopy]);
    });
  });

  describe('Methods', () => {
    describe('onIndigenousTypeChange', () => {
      it('sets the community id if other has been picked ', async () => {
        wrapper.vm.formCopy.indigenousCommunityId = 'test';
        await wrapper.vm.onIndigenousTypeChange(EIndigenousTypes.Other);
        const otherCommunity = mockIndigenousCommunitiesItems()[0];
        expect(wrapper.vm.formCopy.indigenousCommunityId).toBe(otherCommunity.value);
      });

      it('should default the choice to other for all types', async () => {
        wrapper.vm.formCopy.indigenousCommunityId = 'test';
        await wrapper.vm.onIndigenousTypeChange(EIndigenousTypes.Metis);
        const otherCommunity = mockIndigenousCommunitiesItems().find((i) => i.text === 'Other');
        expect(wrapper.vm.formCopy.indigenousCommunityId).toBe(otherCommunity.value);
      });
    });
  });
});
