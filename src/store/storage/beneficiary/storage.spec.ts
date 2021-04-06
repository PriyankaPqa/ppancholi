import { mockStore } from '@/store';
import {
  ETemporaryAddressTypes, mockAddress, mockContactInformation, mockPerson,
} from '@/entities/beneficiary';
import _merge from 'lodash/merge';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('>> Getters', () => {
    it('should proxy beneficiary', () => {
      expect(storage.getters.beneficiary()).toEqual(store.getters['beneficiary/beneficiary']);
    });

    it('should proxy personalInformation', () => {
      expect(storage.getters.personalInformation()).toEqual(store.getters['beneficiary/personalInformation']);
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setPersonalInformation', () => {
      const payload = _merge(mockContactInformation(), mockPerson());
      storage.mutations.setPersonalInformation(payload);
      expect(store.commit).toBeCalledWith('beneficiary/setPersonalInformation', payload);
    });

    it('should proxy setHomeAddress', () => {
      const payload = mockAddress();
      storage.mutations.setHomeAddress(payload);
      expect(store.commit).toBeCalledWith('beneficiary/setHomeAddress', payload);
    });

    it('should proxy setTemporaryAddress', () => {
      const payload = mockAddress();
      storage.mutations.setTemporaryAddress(payload);
      expect(store.commit).toBeCalledWith('beneficiary/setTemporaryAddress', payload);
    });

    it('should proxy setNoFixedHome', () => {
      storage.mutations.setNoFixedHome(true);
      expect(store.commit).toBeCalledWith('beneficiary/setNoFixedHome', true);
    });

    it('should proxy resetTemporaryAddress', () => {
      storage.mutations.resetTemporaryAddress(ETemporaryAddressTypes.HotelMotel);
      expect(store.commit).toBeCalledWith('beneficiary/resetTemporaryAddress', ETemporaryAddressTypes.HotelMotel);
    });
  });
});
