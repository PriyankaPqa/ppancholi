import { createLocalVue, shallowMount } from '../../tests/testSetup';
import personalInformationMixin from './personalInformation';
import { mockStorage } from '../../store/storage/storage.mock';
import helpers from '../helpers';
import { ECanadaProvinces } from '../../types';

import {
  mockPerson,
  mockContactInformation,
  mockBeneficiary,
  mockPreferredLanguages,
  mockPrimarySpokenLanguages,
  mockGenders,
  mockIndigenousTypesItems,
  mockIndigenousCommunitiesItems,
} from '../../entities/beneficiary';

const Component = {
  render() {},
  mixins: [personalInformationMixin],
};

const localVue = createLocalVue();

const storage = mockStorage();
let wrapper;

describe('personalInformationMixin', () => {
  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $storage: storage,
      },
    });
  });
  describe('Methods', () => {
    describe('onIndigenousProvinceChange', () => {
      it('dispatches the action to fetch indigenous identities by province', async () => {
        await wrapper.vm.onIndigenousProvinceChange(ECanadaProvinces.ON);
        expect(storage.registration.actions.fetchIndigenousIdentitiesByProvince).toHaveBeenCalledWith(ECanadaProvinces.ON);
      });
    });

    describe('setIndigenousIdentity', () => {
      it('triggers mutations setPerson', async () => {
        await wrapper.vm.setIndigenousIdentity(mockPerson());
        expect(storage.beneficiary.mutations.setIndigenousIdentity).toHaveBeenCalledWith(mockPerson());
      });
    });

    describe('setIdentity', () => {
      it('triggers mutations setIdentity', async () => {
        await wrapper.vm.setIdentity(mockPerson());
        expect(storage.beneficiary.mutations.setIdentity).toHaveBeenCalledWith(mockPerson());
      });
    });

    describe('setContactInformation', () => {
      it('triggers mutations setContactInformation', async () => {
        await wrapper.vm.setContactInformation(mockContactInformation());
        expect(storage.beneficiary.mutations.setContactInformation).toHaveBeenCalledWith(mockContactInformation());
      });
    });
  });

  describe('Computed', () => {
    describe('person', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.person).toEqual(mockPerson());
      });
    });

    describe('contactInformation', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('beneficiary', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.beneficiary).toEqual(mockBeneficiary());
      });
    });

    describe('preferredLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.preferredLanguagesItems).toEqual(mockPreferredLanguages());
      });
    });

    describe('primarySpokenLanguagesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.primarySpokenLanguagesItems).toEqual(mockPrimarySpokenLanguages());
      });
    });

    describe('genderItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.genderItems).toEqual(mockGenders());
      });
    });

    describe('indigenousTypesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousTypesItems).toEqual(mockIndigenousTypesItems());
      });
    });

    describe('indigenousCommunitiesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.indigenousCommunitiesItems).toEqual(mockIndigenousCommunitiesItems());
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        expect(wrapper.vm.canadianProvincesItems).toEqual(helpers.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces'));
      });
    });
  });
});
