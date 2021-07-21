/* eslint-disable */
import { CASE_REFERRAL_ENTITIES, CASE_REFERRAL_METADATA } from '@/constants/vuex-modules';
import { mockStore } from '@/store';
import { mockSearchParams } from '@/test/helpers';
import { CaseFileReferralStorage } from './storage';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockCaseFileReferralEntity } from '@/entities/case-file-referral';
import { mockCaseFileReferralMetadata } from './../../../entities/case-file-referral/case-file-referral.mock';

const entityModuleName = CASE_REFERRAL_ENTITIES;
const metadataModuleName = CASE_REFERRAL_METADATA;

const referralEntity1 =  mockCaseFileReferralEntity({id: '1', caseFileId: 'case-file-1'});
const referralEntity2 =  mockCaseFileReferralEntity({id: '2', caseFileId: 'case-file-2'});
const referralMetadata1 =  mockCaseFileReferralMetadata({id: '1'});
const referralMetadata2 =  mockCaseFileReferralMetadata({id: '2'});

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        types: mockOptionItemData(),
        outcomeStatuses: mockOptionItemData(),
        items: [referralEntity1, referralEntity2]
      },
    },
    [metadataModuleName]: {
      state: {
        items: [referralMetadata1, referralMetadata2]
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new CaseFileReferralStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Case File Storage', () => {
  describe('>> Getters', () => {
    describe('types', () => {
      it('should proxy types', () => {
        const storageGetter = storage.getters.types();
        const storeGetter = store.getters[`${entityModuleName}/types`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });

    describe('outcomeStatuses', () => {
      it('should proxy outcomeStatuses', () => {
        const storageGetter = storage.getters.outcomeStatuses();
        const storeGetter = store.getters[`${entityModuleName}/outcomeStatuses`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });


    describe('getByCaseFile', () => {
      it('should return all referrals of a case file, with entity and metadata', () => {
        const expected = storage.getters.getByCaseFile('case-file-1');
        expect(expected).toEqual([{entity: referralEntity1, metadata: referralMetadata1}]);
      });
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchTypes', () => {
      storage.actions.fetchTypes();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchTypes`);
    });

    it('should proxy fetchOutcomeStatuses', () => {
      storage.actions.fetchOutcomeStatuses();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchOutcomeStatuses`);
    });

    it('should proxy createReferral', () => {
      const payload = mockCaseFileReferralEntity();
      storage.actions.createReferral(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createReferral`, payload);
    });

    it('should proxy updateReferral', () => {
      const payload = mockCaseFileReferralEntity();
      storage.actions.updateReferral(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/updateReferral`, payload);
    });
  });
});
