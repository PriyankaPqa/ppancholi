import { Store } from 'vuex';

import { mockStore, IRootState } from '@/store';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import {
  HouseholdCreate, mockAddress, mockContactInformation, mockAdditionalMember, mockIdentitySet, mockMember,
} from '../../../entities/household-create';

describe('>>> Household Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('household', () => {
      it('returns a deep clone of the household', () => {
        expect(store.getters['household/householdCreate']).toEqual(_cloneDeep(store.state.household.householdCreate));
      });
    });

    describe('personalInformation', () => {
      it('returns a aggregation of contact information and member', () => {
        const expected = _merge(
          _cloneDeep(store.state.household.householdCreate.primaryBeneficiary.contactInformation),
          _cloneDeep(store.state.household.householdCreate.primaryBeneficiary.identitySet),
        );

        expect(store.getters['household/personalInformation']).toEqual(expected);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setPersonalInformation', () => {
      it('sets both member identitySet and contact information', () => {
        store = mockStore();
        const payload = _merge(mockContactInformation(), mockIdentitySet());

        store.commit('household/setPersonalInformation', payload);

        expect(store.state.household.householdCreate.primaryBeneficiary.contactInformation).toEqual(mockContactInformation());
        expect(store.state.household.householdCreate.primaryBeneficiary.identitySet).toEqual(mockIdentitySet());
      });
    });

    describe('setPrimaryBeneficiary', () => {
      it('sets primary beneficiary of a household', () => {
        store = mockStore();
        const payload = mockMember();
        store.commit('household/setPrimaryBeneficiary', payload);
        expect(store.state.household.householdCreate.primaryBeneficiary).toEqual(mockMember());
      });
    });

    describe('setContactInformation', () => {
      it('sets contact information of a household', () => {
        store = mockStore();
        const payload = mockContactInformation();
        store.commit('household/setContactInformation', payload);
        expect(store.state.household.householdCreate.primaryBeneficiary.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('setHomeAddress', () => {
      it('sets home address of the household', () => {
        store = mockStore();
        store.commit('household/setHomeAddress', mockAddress());
        expect(store.state.household.householdCreate.homeAddress).toEqual(mockAddress());
      });
    });

    describe('setCurrentAddress', () => {
      it('sets current address of the household', () => {
        store = mockStore();
        store.commit('household/setCurrentAddress', mockAddress());
        expect(store.state.household.householdCreate.primaryBeneficiary.currentAddress).toEqual(mockAddress());
      });
    });

    describe('setNoFixedHome', () => {
      it('sets noFixedHome', () => {
        store = mockStore();
        store.commit('household/setNoFixedHome', true);
        expect(store.state.household.householdCreate.noFixedHome).toEqual(true);
      });
    });

    describe('addAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.household.householdCreate = new HouseholdCreate();
        jest.spyOn(store.state.household.householdCreate, 'addAdditionalMember');
        const params = { payload: mockAdditionalMember(), sameAddress: true };
        store.commit('household/addAdditionalMember', params);
        expect(store.state.household.householdCreate.addAdditionalMember).toHaveBeenCalledWith(params.payload, params.sameAddress);
      });
    });

    describe('removeAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.household.householdCreate = new HouseholdCreate();
        jest.spyOn(store.state.household.householdCreate, 'removeAdditionalMember');
        store.commit('household/removeAdditionalMember', 1);
        expect(store.state.household.householdCreate.removeAdditionalMember).toHaveBeenCalledWith(1);
      });
    });

    describe('editAdditionalMember', () => {
      it('should call method from household entity with proper parameters', () => {
        store.state.household.householdCreate = new HouseholdCreate();
        store.state.household.householdCreate.editAdditionalMember = jest.fn();
        const params = { payload: mockAdditionalMember(), sameAddress: true, index: 1 };
        store.commit('household/editAdditionalMember', params);
        expect(store.state.household.householdCreate.editAdditionalMember).toHaveBeenCalledWith(
          _cloneDeep(params.payload),
          params.index,
          params.sameAddress,
        );
      });
    });

    describe('resetState', () => {
      it('should reset the state to default', () => {
        store.commit('household/setPrimaryBeneficiary', mockMember());
        store.commit('household/resetState');
        expect(store.state.household).toEqual({
          householdCreate: new HouseholdCreate(),
        });
      });
    });
  });
});
