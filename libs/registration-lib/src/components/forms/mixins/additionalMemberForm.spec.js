import helpers from '@libs/entities-lib/src/helpers';
import { mockMember } from '@libs/entities-lib/src/household-create';
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address/index';
import { mockIdentitySet } from '@libs/entities-lib/value-objects/identity-set';
import { mockAdditionalMember } from '@libs/entities-lib/value-objects/member';
import { FeatureKeys } from '@libs/entities-lib/tenantSettings';
import { createLocalVue, shallowMount } from '../../../test/testSetup';
import additionalMemberForm from './additionalMemberForm';

const member = mockMember();

const Component = {
  render() {},
  data() {
    return {
      additionalMembers: [member],
      indexAdditionalMember: 0,
    };
  },
  mixins: [additionalMemberForm],
};

const localVue = createLocalVue();
let wrapper;

const doMount = (otherOptions = {}) => {
  wrapper = shallowMount(Component, {
    localVue,
    ...otherOptions,
  });
};

describe('additionalMemberForm.spec', () => {
  describe('Methods', () => {
    describe('makeShelterLocationsListForMember', () => {
      it('returns the shelter locations if the member in the argument has no shelter locations', async () => {
        const shelterLocations = [{ id: 'sl-1' }];
        const member = { currentAddress: { shelterLocation: null } };
        doMount({
          computed: {
            shelterLocations() {
              return shelterLocations;
            },
          },
        });
        const result = await wrapper.vm.makeShelterLocationsListForMember(member);
        expect(result).toEqual(shelterLocations);
      });

      it('adds the location of the member to the shelter locations if the member in the argument has no shelter locations', async () => {
        const shelterLocations = [{ id: 'sl-1' }];
        const member = { currentAddress: { shelterLocation: { id: 'sl-2' } } };
        doMount({
          computed: {
            shelterLocations() {
              return shelterLocations;
            },
          },
        });
        const result = await wrapper.vm.makeShelterLocationsListForMember(member);
        expect(result).toEqual([{ id: 'sl-2' }, { id: 'sl-1' }]);
      });
    });

    describe('makeCurrentAddressTypeItems', () => {
      it('calls enumToTranslatedCollection helper and filters out RemainingInHome', async () => {
        doMount();
        const member = { currentAddress: { shelterLocation: { id: 'sl-2' } } };
        helpers.enumToTranslatedCollection = jest.fn(() => [
          { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining at home' },
          { value: ECurrentAddressTypes.Campground, text: 'Campground' },
        ]);
        const result = await wrapper.vm.makeCurrentAddressTypeItems(member);
        expect(helpers.enumToTranslatedCollection).toHaveBeenCalledTimes(1);
        expect(result).toEqual([{ value: ECurrentAddressTypes.Campground, text: 'Campground' }]);
      });

      it('filters out filters out shelters if the user has no potential shelters to live in', async () => {
        doMount();
        const member = { currentAddress: { shelterLocation: { id: 'sl-2' } } };
        helpers.enumToTranslatedCollection = jest.fn(() => [
          { value: ECurrentAddressTypes.RemainingInHome, text: 'Remaining at home' },
          { value: ECurrentAddressTypes.Campground, text: 'Campground' },
          { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
        ]);
        wrapper.vm.makeShelterLocationsListForMember = jest.fn(() => []);
        const result = await wrapper.vm.makeCurrentAddressTypeItems(member);
        expect(result).toEqual([{ value: ECurrentAddressTypes.Campground, text: 'Campground' }]);
      });
    });

    describe('setIdentity', () => {
      it('calls setIdentity of the class IdentitySet ', async () => {
        doMount({ computed: { currentAdditionalMember() {
          return mockAdditionalMember();
        } } });
        jest.spyOn(wrapper.vm.currentAdditionalMember.identitySet, 'setIdentity');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.currentAdditionalMember.identitySet.setIdentity).toHaveBeenCalledWith(mockIdentitySet());
      });

      it('calls editAdditionalMember ', async () => {
        doMount({ computed: { currentAdditionalMember() {
          return mockAdditionalMember();
        } } });
        jest.spyOn(wrapper.vm.$registrationStore.householdCreate, 'editAdditionalMember');
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.$registrationStore.householdCreate.editAdditionalMember).toHaveBeenCalledWith(
          wrapper.vm.currentAdditionalMember,
          wrapper.vm.indexAdditionalMember,
          wrapper.vm.additionalMembers[wrapper.vm.indexAdditionalMember].sameAddress,
        );
      });

      it('calls checkDuplicates if the feature flag is on', async () => {
        doMount({ computed: { currentAdditionalMember() {
          return mockAdditionalMember();
        } } });
        wrapper.vm.checkDuplicates = jest.fn();
        wrapper.vm.$hasFeature = jest.fn((f) => f === FeatureKeys.ManageDuplicates);
        await wrapper.vm.setIdentity(mockIdentitySet());
        expect(wrapper.vm.checkDuplicates).toHaveBeenCalledWith(mockIdentitySet());
      });
    });

    describe('checkDuplicates', () => {
      it('calls store method checkDuplicates with the right params', async () => {
        doMount();
        wrapper.vm.$registrationStore.checkDuplicates = jest.fn();
        await wrapper.vm.checkDuplicates(mockIdentitySet());
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, 800));
        expect(wrapper.vm.$registrationStore.checkDuplicates).toHaveBeenCalledWith({ form: mockIdentitySet(), isPrimaryMember: false, index: wrapper.vm.indexAdditionalMember });
      });
    });
  });
});
