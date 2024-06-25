import { mockCaseFileIndividualsService } from '@libs/services-lib/case-file-individuals';
import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { createTestingPinia } from '@pinia/testing';
import { defineStore, setActivePinia } from 'pinia';
import { ICaseFileIndividualEntity, mockCaseFileIndividualEntity, IdParams } from '@libs/entities-lib/case-file-individual';
import { getExtensionComponents } from '@/pinia/case-file-individual/case-file-individual-extension';

import { Status } from '@libs/shared-lib/types';

const entityService = mockCaseFileIndividualsService();
const baseComponents = getBaseStoreComponents<ICaseFileIndividualEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({
    initialState: {
      'test-case-file-individual': {
      },
    },
    stubActions: false,
  });
  setActivePinia(pinia);
  return pinia;
};

const useCaseFileIndividualTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService);

  const useCaseFileIndividualStore = defineStore('test-case-file-individual', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useCaseFileIndividualStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  return useCaseFileIndividualTestStore(bComponents);
};

describe('>>> Case File Individual Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('getByCaseFile', () => {
    test('the getter returns the individuals that have the id passed in the argument', () => {
      const store = createTestStore();
      const individual1 = mockCaseFileIndividualEntity({ id: '1', caseFileId: 'case-file-1' });
      const individual2 = mockCaseFileIndividualEntity({ id: '2', caseFileId: 'case-file-2' });
      store.setAll([individual1, individual2]);
      const res = store.getByCaseFile('case-file-1');
      expect(res).toEqual([individual1]);
    });
    test('the getter ignores inactive items', () => {
      const store = createTestStore();
      const item1 = mockCaseFileIndividualEntity({ id: '1', caseFileId: 'case-file-1', status: Status.Inactive });
      const item2 = mockCaseFileIndividualEntity({ id: '2', caseFileId: 'case-file-2', status: Status.Active });
      store.setAll([item1, item2]);
      const res = store.getByCaseFile('case-file-2');
      expect(JSON.stringify(res)).toEqual(JSON.stringify([item2]));
    });
  });

  describe('createIndividual', () => {
    it('should call createIndividual service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {} as ICaseFileIndividualEntity;
      const res = {} as ICaseFileIndividualEntity;
      entityService.createCaseFileIndividual = jest.fn(() => res);
      await store.createIndividual(payload);

      expect(entityService.createCaseFileIndividual).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res);
      expect(bComponents.set).toBeCalledWith(res);
    });
  });
});
