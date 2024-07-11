import { mockMember } from '@libs/entities-lib/src/household-create';
import { ECurrentAddressTypes } from '@libs/entities-lib/value-objects/current-address/index';
import { mockIdentitySet } from '@libs/entities-lib/value-objects/identity-set';
import { mockAdditionalMember } from '@libs/entities-lib/value-objects/member';
import { useAddresses } from '@libs/registration-lib/components/forms/mixins/useAddresses';
import { createLocalVue, shallowMount } from '../../../test/testSetup';
import additionalMemberForm from './additionalMemberForm';

jest.mock('@libs/registration-lib/components/forms/mixins/useAddresses');
const mockAddressTypes = [
  { value: ECurrentAddressTypes.Campground, text: 'Campground' },
  { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
  { value: ECurrentAddressTypes.RemainingInHome, text: 'RemainingInHome' },
];
useAddresses.mockImplementation(() => ({ getCurrentAddressTypeItems: jest.fn(() => mockAddressTypes) }));
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
      it('calls getCurrentAddressTypeItems with the right params and returns the right value', async () => {
        doMount();
        const member = { currentAddress: { shelterLocation: { id: 'sl-2' } } };

        const result = await wrapper.vm.makeCurrentAddressTypeItems(member);
        expect(wrapper.vm.getCurrentAddressTypeItems).toHaveBeenCalledWith(wrapper.vm.$i18n, wrapper.vm.householdCreate.noFixedHome, true);

        expect(result).toEqual(mockAddressTypes);
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

      it('calls checkDuplicates', async () => {
        doMount({ computed: { currentAdditionalMember() {
          return mockAdditionalMember();
        } } });
        wrapper.vm.checkDuplicates = jest.fn();
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
