import { mockStore } from '@/store';
import { mockAddresses, mockContactInformation, mockPerson } from '@/entities/beneficiary';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
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

    it('should proxy setAddresses', () => {
      const payload = mockAddresses();
      storage.mutations.setAddresses(payload);
      expect(store.commit).toBeCalledWith('beneficiary/setAddresses', payload);
    });
  });
});
