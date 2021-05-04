import { Store } from 'vuex';

import { mockStore, IRootState } from '@/store';
import _cloneDeep from 'lodash/cloneDeep';
import _merge from 'lodash/merge';
import {
  Beneficiary,
  mockAddress,
  mockContactInformation, mockHouseholdMember,
  mockPerson,
} from '../../../entities/beneficiary';

describe('>>> Beneficiary Module', () => {
  let store: Store<IRootState>;

  beforeEach(() => {
    store = mockStore();
  });

  describe('>> Getters', () => {
    describe('beneficiary', () => {
      it('returns a deep clone of the beneficiary', () => {
        expect(store.getters['beneficiary/beneficiary']).toEqual(_cloneDeep(store.state.beneficiary.beneficiary));
      });
    });

    describe('personalInformation', () => {
      it('returns a aggregation of contact information and person', () => {
        const expected = _merge(
          _cloneDeep(store.state.beneficiary.beneficiary.contactInformation),
          _cloneDeep(store.state.beneficiary.beneficiary.person),
        );

        expect(store.getters['beneficiary/personalInformation']).toEqual(expected);
      });
    });
  });

  describe('>> Mutations', () => {
    describe('setPersonalInformation', () => {
      it('sets both person and contact information of a beneficiary', () => {
        store = mockStore();
        const payload = _merge(mockContactInformation(), mockPerson());

        store.commit('beneficiary/setPersonalInformation', payload);

        expect(store.state.beneficiary.beneficiary.contactInformation).toEqual(mockContactInformation());
        expect(store.state.beneficiary.beneficiary.person).toEqual(mockPerson());
      });
    });

    describe('setPerson', () => {
      it('sets person of a beneficiary', () => {
        store = mockStore();
        const payload = mockPerson();
        store.commit('beneficiary/setPerson', payload);
        expect(store.state.beneficiary.beneficiary.person).toEqual(mockPerson());
      });
    });

    describe('setContactInformation', () => {
      it('sets contact information of a beneficiary', () => {
        store = mockStore();
        const payload = mockContactInformation();
        store.commit('beneficiary/setContactInformation', payload);
        expect(store.state.beneficiary.beneficiary.contactInformation).toEqual(mockContactInformation());
      });
    });

    describe('setHomeAddress', () => {
      it('sets home address of the beneficiary', () => {
        store = mockStore();
        store.commit('beneficiary/setHomeAddress', mockAddress());
        expect(store.state.beneficiary.beneficiary.homeAddress).toEqual(mockAddress());
      });
    });

    describe('setTemporaryAddress', () => {
      it('sets temporary address of the beneficiary', () => {
        store = mockStore();
        store.commit('beneficiary/setTemporaryAddress', mockAddress());
        expect(store.state.beneficiary.beneficiary.person.temporaryAddress).toEqual(mockAddress());
      });
    });

    describe('setNoFixedHome', () => {
      it('sets noFixedHome', () => {
        store = mockStore();
        store.commit('beneficiary/setNoFixedHome', true);
        expect(store.state.beneficiary.beneficiary.noFixedHome).toEqual(true);
      });
    });

    describe('addHouseholdMember', () => {
      it('should call method from beneficiary entity with proper parameters', () => {
        store.state.beneficiary.beneficiary = new Beneficiary();
        jest.spyOn(store.state.beneficiary.beneficiary, 'addHouseholdMember');
        const params = { payload: mockHouseholdMember(), sameAddress: true };
        store.commit('beneficiary/addHouseholdMember', params);
        expect(store.state.beneficiary.beneficiary.addHouseholdMember).toHaveBeenCalledWith(params.payload, params.sameAddress);
      });
    });

    describe('removeHouseholdMember', () => {
      it('should call method from beneficiary entity with proper parameters', () => {
        store.state.beneficiary.beneficiary = new Beneficiary();
        jest.spyOn(store.state.beneficiary.beneficiary, 'removeHouseholdMember');
        store.commit('beneficiary/removeHouseholdMember', 1);
        expect(store.state.beneficiary.beneficiary.removeHouseholdMember).toHaveBeenCalledWith(1);
      });
    });

    describe('editHouseholdMember', () => {
      it('should call method from beneficiary entity with proper parameters', () => {
        store.state.beneficiary.beneficiary = new Beneficiary();
        jest.spyOn(store.state.beneficiary.beneficiary, 'editHouseholdMember');
        const params = { payload: mockHouseholdMember(), sameAddress: true, index: 1 };
        store.commit('beneficiary/editHouseholdMember', params);
        expect(store.state.beneficiary.beneficiary.editHouseholdMember).toHaveBeenCalledWith(params.payload, params.index, params.sameAddress);
      });
    });
  });
});
