import { Store } from 'vuex';

import { mockStore, IRootState } from '@/store';
import _cloneDeep from 'lodash/cloneDeep';
import { mockAddresses, mockPersonalInformation } from '@/entities/beneficiary';

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
  });

  describe('>> Mutations', () => {
    describe('setPersonalInformation', () => {
      it('sets personal information of the beneficiary', () => {
        store = mockStore();
        store.commit('beneficiary/setPersonalInformation', mockPersonalInformation());
        expect(store.state.beneficiary.beneficiary.personalInformation).toEqual(mockPersonalInformation());
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
