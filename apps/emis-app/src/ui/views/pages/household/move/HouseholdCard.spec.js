import { mockHouseholdCreate, CurrentAddress, ECurrentAddressTypes } from '@libs/entities-lib/household-create';
import { mockMember } from '@libs/entities-lib/value-objects/member/index';
import { mockShelterLocations } from '@libs/entities-lib/registration-event/registrationEvent.mock';
import libHelpers from '@libs/entities-lib/helpers';
import { createLocalVue, shallowMount } from '@/test/testSetup';
import helpers from '@/ui/helpers/helpers';
import routes from '@/constants/routes';

import Component from './HouseholdCard.vue';

const localVue = createLocalVue();

const mockMovingHouseholdCreate = (movingMembers = []) => ({ ...mockHouseholdCreate(), movingAdditionalMembers: movingMembers });
const shelterLocations = mockShelterLocations();

describe('HouseholdCard.vue', () => {
  let wrapper;
  libHelpers.getCanadianProvincesWithoutOther = jest.fn(() => [{ id: '1' }]);

  const mockAddressTypes = [
    { value: ECurrentAddressTypes.Campground, text: 'Campground' },
    { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
    { value: ECurrentAddressTypes.RemainingInHome, text: 'Ramining in home' },
  ];
  helpers.enumToTranslatedCollection = jest.fn(() => mockAddressTypes);

  describe('Computed', () => {
    describe('members', () => {
      it('returns the list of members of a household', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate([mockMember({ id: 'moving-member' })]),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });

        expect(wrapper.vm.members).toEqual(
          [mockHouseholdCreate().primaryBeneficiary, ...mockHouseholdCreate().additionalMembers, mockMember({ id: 'moving-member' })],
        );
      });
    });

    describe('showMoveButton', () => {
      it('returns false  if enabledMove is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: false,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });

        expect(wrapper.vm.showMoveButton(1)).toEqual(false);
      });
      it('returns true if moveSubmitted is false', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });

        expect(wrapper.vm.showMoveButton(1)).toEqual(true);
      });

      it('returns true for the primary member if enabledMove is true and the household has no additional members', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [mockMember()];
            },
          },

        });

        expect(wrapper.vm.showMoveButton(0)).toEqual(true);
      });

      it('returns false for the primary member if there are additional members', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [mockMember({ id: '1' }), mockMember({ id: '2' })];
            },
          },

        });

        expect(wrapper.vm.showMoveButton(0)).toEqual(false);
      });

      it('returns true for the additional members if there are additional members', () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [mockMember({ id: '1' }), mockMember({ id: '2' })];
            },
          },

        });

        expect(wrapper.vm.showMoveButton(0)).toEqual(false);
      });
    });

    describe('errorOutstandingPayments', () => {
      it('returns false if enabledMode is false', async () => {
        const h = mockMovingHouseholdCreate();
        h.hasOutstandingPayments = true;
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: h,
            position: 'left',
            shelterLocations,
            enabledMove: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [mockMember()];
            },
          },

        });

        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(false);

        await wrapper.setProps({ enabledMove: true });
        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(true);
      });

      it('returns false for the primary member if there are additional members', () => {
        const h = mockMovingHouseholdCreate();
        h.hasOutstandingPayments = true;
        const members = [mockMember({ id: '1' }), mockMember({ id: '2' })];
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: h,
            position: 'left',
            shelterLocations,
            enabledMove: true,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return members;
            },
          },

        });

        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(false);

        members.pop();

        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(true);
      });

      it('returns false if hasOutstandingPayments is false', async () => {
        const h = mockMovingHouseholdCreate();
        h.hasOutstandingPayments = false;
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: h,
            position: 'left',
            shelterLocations,
            enabledMove: true,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [mockMember({ id: '1' })];
            },
          },

        });

        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(false);

        h.hasOutstandingPayments = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.errorOutstandingPayments(0)).toEqual(true);
      });
    });

    describe('expandDisabled', () => {
      beforeEach(() => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });
      });
      it('returns true if the member was moved, and no selection was made for temporary address', async () => {
        const member = { ...mockMember(), id: 'moved-member', selectedCurrentAddress: { sameAddressSelected: null } };
        await wrapper.setData({ expand: ['moved-member'] });

        expect(wrapper.vm.expandDisabled(member)).toEqual(true);
      });

      it('returns false for all other cases', async () => {
        const member = { ...mockMember(), id: 'moved-member', selectedCurrentAddress: { sameAddressSelected: true } };

        expect(wrapper.vm.expandDisabled(member)).toEqual(false);
      });
    });

    describe('canadianProvincesItems', () => {
      it('returns the proper data', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });
        expect(wrapper.vm.canadianProvincesItems).toEqual([{ id: '1' }]);
      });
    });

    describe('currentAddressTypeItems', () => {
      it('returns the list of temporary addresses types excludes Remaining in home', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });
        const expectList = [
          { value: ECurrentAddressTypes.Campground, text: 'Campground' },
          { value: ECurrentAddressTypes.Shelter, text: 'Shelter' },
        ];
        expect(wrapper.vm.currentAddressTypeItems).toEqual(expectList);
      });

      it('excludes shelter', async () => {
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations: [],
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              apiKey: 'mock-api-key',
            };
          },
        });

        expect(wrapper.vm.currentAddressTypeItems).toEqual([{ value: ECurrentAddressTypes.Campground, text: 'Campground' }]);
      });
    });
  });

  describe('watch', () => {
    it('adds the id of the last added moving member when a moving member is added', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          household: mockMovingHouseholdCreate(),
          position: 'left',
          shelterLocations,
          enabledMove: true,
          moveSubmitted: false,
        },
        data() {
          return {
            expand: ['id-1'],
            apiKey: 'mock-api-key',
          };
        },

      });

      await wrapper.setProps({ household: mockMovingHouseholdCreate([mockMember({ id: 'moving-member-id' })]) });
      expect(wrapper.vm.expand).toEqual(['id-1', 'moving-member-id']);
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      wrapper = shallowMount(Component, {
        localVue,
        propsData: {
          household: mockMovingHouseholdCreate(),
          position: 'left',
          shelterLocations,
          enabledMove: true,
          moveSubmitted: false,
        },
        data() {
          return {
            apiKey: 'mock-api-key',
          };
        },
      });
    });

    describe('showHide', () => {
      it('should add the passed id if the id is not in the expand list', async () => {
        wrapper.setData({ expand: ['1'] });
        wrapper.vm.showHide('2');
        expect(wrapper.vm.expand).toEqual(['1', '2']);
      });
      it('should remove the passed id if the id is already in the expand list', async () => {
        wrapper.setData({ expand: ['1', '2'] });
        wrapper.vm.showHide('2');
        expect(wrapper.vm.expand).toEqual(['1']); // expand
      });
    });

    describe('move', () => {
      it('should emit event move with proper direction and the member', async () => {
        const direction = 'right';
        const member = mockMember();

        await wrapper.setProps({ position: 'left' });

        wrapper.vm.move(member);

        expect(wrapper.emitted('move')[0][0]).toEqual({ direction, member });
      });

      it('should emit event move with proper direction and the member', async () => {
        const direction = 'left';
        const member = mockMember();

        await wrapper.setProps({ position: 'right' });

        wrapper.vm.move(member);

        expect(wrapper.emitted('move')[0][0]).toEqual({ direction, member });
      });
    });

    describe('openNewAddressDialog', () => {
      it('sets the data into the right varibles', async () => {
        const member = { ...mockMember(), selectedCurrentAddress: { newAddress: { address: 'foo' }, sameAddressSelected: true } };
        await wrapper.vm.openNewAddressDialog(member);
        expect(wrapper.vm.selectedMember).toEqual(member);
        expect(wrapper.vm.newAddress).toEqual({ address: 'foo' });
        expect(wrapper.vm.showNewAddressDialog).toEqual(true);
      });
    });

    describe('updateAddress', () => {
      it('sets the data into newAddress', async () => {
        const address = new CurrentAddress({ address: 'foo' });
        await wrapper.vm.updateAddress(address);
        expect(wrapper.vm.newAddress).toEqual(address);
      });
    });

    describe('setAddress', () => {
      // eslint-disable-next-line max-len
      it(
        'sets the data from newAddress into the current address of the member that has been selected, if the form is valid and calls closeNewAddressDialog',
        async () => {
          const address = new CurrentAddress({ address: 'bar' });
          const member = { ...mockMember({ id: 'mock-member-id' }), selectedCurrentAddress: { newAddress: null } };
          wrapper = shallowMount(Component, {
            localVue,
            propsData: {
              household: mockMovingHouseholdCreate(),
              position: 'left',
              shelterLocations,
              enabledMove: true,
              moveSubmitted: false,
            },
            data() {
              return {
                selectedMember: member,
                newAddress: address,
                apiKey: 'mock-api-key',
              };
            },
            computed: {
              members() {
                return [member];
              },
            },

          });
          wrapper.vm.$refs.addressForm.validate = jest.fn(() => true);
          wrapper.vm.closeNewAddressDialog = jest.fn(() => {});

          await wrapper.vm.setAddress();
          expect(wrapper.vm.members[0].selectedCurrentAddress.newAddress).toEqual(address);
          expect(wrapper.vm.closeNewAddressDialog).toHaveBeenCalledTimes(1);
        },
      );
    });

    describe('closeNewAddressDialog', () => {
      it('sets the right data into the right variables', async () => {
        await wrapper.setData({ showNewAddressDialog: true, selectedMember: mockMember(), newAddress: new CurrentAddress() });
        await wrapper.vm.closeNewAddressDialog();
        expect(wrapper.vm.showNewAddressDialog).toBeFalsy();
        expect(wrapper.vm.selectedMember).toEqual(null);
        expect(wrapper.vm.newAddress).toEqual(null);
      });
    });

    describe('resetSelectNewAddress', () => {
      it('sets the address selection to null if there was no address set for the selected member', async () => {
        const address = new CurrentAddress({ address: 'bar' });
        const member = { ...mockMember({ id: 'mock-member-id' }), selectedCurrentAddress: { newAddress: null, selectedCurrentAddress: false } };
        wrapper = shallowMount(Component, {
          localVue,
          propsData: {
            household: mockMovingHouseholdCreate(),
            position: 'left',
            shelterLocations,
            enabledMove: true,
            moveSubmitted: false,
          },
          data() {
            return {
              selectedMember: member,
              newAddress: address,
              apiKey: 'mock-api-key',
            };
          },
          computed: {
            members() {
              return [member];
            },
          },
        });

        await wrapper.vm.resetSelectNewAddress();
        expect(wrapper.vm.members[0].selectedCurrentAddress.sameAddressSelected).toEqual(null);
      });
    });

    describe('goToHouseholdProfile', () => {
      it('should redirect to the household profile page', async () => {
        wrapper.vm.goToHouseholdProfile();
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.$router.replace).toHaveBeenCalledWith({
          name: routes.household.householdProfile.name,
          params: {
            id: wrapper.vm.household.id,
          },
        });
      });
    });
  });
});
