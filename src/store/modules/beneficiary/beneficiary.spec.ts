import { Store } from 'vuex';

import { mockStore, IRootState } from '@/store';
import _cloneDeep from 'lodash/cloneDeep';
import { mockAddresses, mockContactInformation, mockPerson } from '@/entities/beneficiary';
import _merge from 'lodash/merge';

describe('>>> Team Module', () => {
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

    describe('setAddresses', () => {
      it('sets addresses of the beneficiary', () => {
        store = mockStore();
        store.commit('beneficiary/setAddresses', mockAddresses());
        expect(store.state.beneficiary.beneficiary.addresses).toEqual(mockAddresses());
      });
    });
  });
});
