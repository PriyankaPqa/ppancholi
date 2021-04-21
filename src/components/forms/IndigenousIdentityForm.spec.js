import { MAX_LENGTH_MD } from '@/constants/validations';
import _merge from 'lodash/merge';
import { enumToTranslatedCollection } from '../../ui/utils';
import { ECanadaProvinces } from '../../types';
import {
  mockContactInformation,
  mockPerson,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems, EIndigenousTypes,
} from '../../entities/beneficiary';
import { createLocalVue, shallowMount } from '../../tests/testSetup';
import Component from './IndigenousIdentityForm.vue';

const localVue = createLocalVue();

describe('IndigenousIdentityForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: _merge(mockContactInformation(), mockPerson()),
        canadianProvincesItems: enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'),
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
          required: wrapper.vm.formCopy.indigenousProvince !== null,
        });
      });

      test('indigenousCommunityId', () => {
        expect(wrapper.vm.rules.indigenousCommunityId).toEqual({
          required: wrapper.vm.formCopy.indigenousType !== null,
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

    describe('indigenousCommunityId', () => {
      it('is linked to proper rules', () => {
        const element = wrapper.findDataTest('personalInfo__indigenousCommunityId');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityId);
      });
    });

    describe('indigenousCommunityOther', () => {
      it('is linked to proper rules', async () => {
        wrapper.vm.formCopy.indigenousType = EIndigenousTypes.Other;

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__indigenousCommunityOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityOther);
      });
    });

    test('change event is emitted when form changes', async () => {
      wrapper.vm.formCopy.indigenousCommunityId = 'test';
      expect(wrapper.emitted('change')[0]).toEqual([wrapper.vm.formCopy]);
    });
  });

  describe('Methods', () => {
    describe('onIndigenousProvinceChange', () => {
      it('emits province-change event with provinceCode', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(wrapper.emitted('province-change')[0]).toEqual([ECanadaProvinces.ON]);
      });
    });

    describe('onIndigenousTypeChange', () => {
      it('clears the community id and other field', async () => {
        wrapper.vm.formCopy.indigenousCommunityId = 'test';
        wrapper.vm.formCopy.indigenousCommunityOther = 'test';
        await wrapper.vm.onIndigenousTypeChange();
        expect(wrapper.vm.formCopy.indigenousCommunityId).toBeNull();
        expect(wrapper.vm.formCopy.indigenousCommunityOther).toBeNull();
      });
    });
  });
});
