import helpers from '@libs/entities-lib/src/helpers';
import { mockMember } from '@libs/entities-lib/src/household-create';
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address/index';
import { createLocalVue, shallowMount } from '../../../test/testSetup';
import additionalMemberForm from './additionalMemberForm';

const member = mockMember();

const Component = {
  render() {},
  data() {
    return {
      additionalMembers: [member],
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
  });
});
