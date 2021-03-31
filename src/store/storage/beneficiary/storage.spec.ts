import { mockStore } from '@/store';
import { mockAddresses, mockPersonalInformation } from '@/entities/beneficiary';
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
  });

  describe('>> Mutations', () => {
    it('should proxy setPersonalInformation', () => {
      const payload = mockPersonalInformation();
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
