import { createLocalVue, shallowMount } from '@/test/testSetup';

import utils from '@/entities/utils';
import { ECanadaProvinces } from '@/types';
import {
  mockContactInformation,
  mockPerson,
  mockIndigenousCommunitiesItems,
  mockIndigenousTypesItems,
} from '@/entities/beneficiary';
import { MAX_LENGTH_MD } from '@/constants/validations';
import { mockStorage } from '@/store/storage';
import _merge from 'lodash/merge';
import Component from './IndigenousIdentityForm.vue';

const localVue = createLocalVue();
const storage = mockStorage();

describe('IndigenousIdentityForm.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      propsData: {
        form: _merge(mockContactInformation(), mockPerson()),
      },
      mocks: {
        $storage: storage,
      },
    });
  });

  describe('Computed', () => {
    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(utils.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('mockIndigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('rules', () => {
      test('indigenousType', () => {
        expect(wrapper.vm.rules.indigenousType).toEqual({
          required: wrapper.vm.form.indigenousProvince !== null,
        });
      });

      test('indigenousCommunityId', () => {
        expect(wrapper.vm.rules.indigenousCommunityId).toEqual({
          required: wrapper.vm.form.indigenousType !== null,
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
        wrapper.vm.form.indigenousType = 'Other';

        await wrapper.vm.$nextTick();

        const element = wrapper.findDataTest('personalInfo__indigenousCommunityOther');
        expect(element.props('rules')).toEqual(wrapper.vm.rules.indigenousCommunityOther);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      wrapper = shallowMount(Component, {
        localVue,
        computed: {
          loadingIndigenousIdentities() { return false; },
        },
        propsData: {
          form: _merge(mockContactInformation(), mockPerson()),
        },
        mocks: {
          $storage: storage,
        },
      });
    });

    describe('onIndigenousProvinceChange', () => {
      it('dispatches the action to fetch indigenous identities by province', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledTimes(1);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
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
