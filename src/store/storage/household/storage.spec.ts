import { mockStore } from '@/store';
import _merge from 'lodash/merge';
import {
  mockAddress, mockCampGround, mockContactInformation, mockAdditionalMember, mockIdentitySet, mockMember,
} from '../../../entities/household-create';
import { makeStorage } from './storage';

const store = mockStore({}, { commit: true, dispatch: true });

const storage = makeStorage(store);

describe('>>> Registration Storage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('>> Getters', () => {
    it('should proxy household', () => {
      expect(storage.getters.householdCreate()).toEqual(store.getters['household/householdCreate']);
    });

    it('should proxy personalInformation', () => {
      expect(storage.getters.personalInformation()).toEqual(store.getters['household/personalInformation']);
    });
  });

  describe('>> Mutations', () => {
    it('should proxy setPersonalInformation', () => {
      const payload = _merge(mockContactInformation(), mockMember());
      storage.mutations.setPersonalInformation(payload);
      expect(store.commit).toBeCalledWith('household/setPersonalInformation', payload);
    });

    it('should proxy setPrimaryBeneficiary', () => {
      const payload = mockMember();
      storage.mutations.setPrimaryBeneficiary(payload);
      expect(store.commit).toBeCalledWith('household/setPrimaryBeneficiary', payload);
    });

    it('should proxy setIdentity', () => {
      const payload = mockIdentitySet();
      storage.mutations.setIdentity(payload);
      expect(store.commit).toBeCalledWith('household/setIdentity', payload);
    });

    it('should proxy setIndigenousIdentity', () => {
      const payload = mockIdentitySet();
      storage.mutations.setIndigenousIdentity(payload);
      expect(store.commit).toBeCalledWith('household/setIndigenousIdentity', payload);
    });

    it('should proxy setContactInformation', () => {
      const payload = mockContactInformation();
      storage.mutations.setContactInformation(payload);
      expect(store.commit).toBeCalledWith('household/setContactInformation', payload);
    });

    it('should proxy setHomeAddress', () => {
      const payload = mockAddress();
      storage.mutations.setHomeAddress(payload);
      expect(store.commit).toBeCalledWith('household/setHomeAddress', payload);
    });

    it('should proxy setCurrentAddress', () => {
      const payload = mockCampGround();
      storage.mutations.setCurrentAddress(payload);
      expect(store.commit).toBeCalledWith('household/setCurrentAddress', payload);
    });

    it('should proxy setNoFixedHome', () => {
      storage.mutations.setNoFixedHome(true);
      expect(store.commit).toBeCalledWith('household/setNoFixedHome', true);
    });

    it('should proxy addAdditionalMember', () => {
      storage.mutations.addAdditionalMember(mockAdditionalMember(), true);
      const params = { payload: mockAdditionalMember(), sameAddress: true };
      expect(store.commit).toBeCalledWith('household/addAdditionalMember', params);
    });

    it('should proxy removeAdditionalMember', () => {
      storage.mutations.removeAdditionalMember(1);
      expect(store.commit).toBeCalledWith('household/removeAdditionalMember', 1);
    });

    it('should proxy editAdditionalMember', () => {
      storage.mutations.editAdditionalMember(mockAdditionalMember(), 0, true);
      const params = { payload: mockAdditionalMember(), sameAddress: true, index: 0 };
      expect(store.commit).toBeCalledWith('household/editAdditionalMember', params);
    });

    it('should proxy resetState', () => {
      storage.mutations.resetState();
      expect(store.commit).toBeCalledWith('household/resetState');
    });
  });
});
