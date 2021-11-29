/* eslint-disable */
import { CASE_FILE_ENTITIES, CASE_FILE_METADATA } from '@/constants/vuex-modules';
import {
  CaseFileTriage, ICaseFileLabel, CaseFileStatus, IIdentityAuthentication, IdentityAuthenticationMethod,
  IdentityAuthenticationStatus, IImpactStatusValidation, ImpactValidationMethod, ValidationOfImpactStatus,
  ICaseFileCombined,
  mockCaseFileEntity,
  mockCaseFileMetadata,
} from '@/entities/case-file';
import { mockOptionItemData } from '@/entities/optionItem';
import { mockStore } from '@/store';
import { IListOption } from '@/types';
import { ICreateCaseFileRequest } from '@/services/case-files/entity';
import { CaseFileStorage } from './storage';
import { EEventStatus } from '@/entities/event';

const entityModuleName = CASE_FILE_ENTITIES;
const metadataModuleName = CASE_FILE_METADATA;

const store = mockStore({
  modules: {
    [entityModuleName]: {
      state: {
        tagsOptions: mockOptionItemData(),
        searchLoading: false,
        getLoading: false,
        duplicateLoading: false,
        inactiveReasons: mockOptionItemData(),
        closeReasons: mockOptionItemData(),
        triageLoading: false,
        items: [mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Open } as any),
          mockCaseFileEntity({ caseFileStatus: CaseFileStatus.Inactive } as any)],
      },
    },
    [metadataModuleName]: {
      state: {
        items: [mockCaseFileMetadata()],
      },
    },
  },
}, { commit: true, dispatch: true });

const storage = new CaseFileStorage(store, entityModuleName, metadataModuleName).make();

describe('>>> Case File Storage', () => {
  describe('>> Getters', () => {
    describe('base getters - combinedCollections overload', () => {
      it('should set readonly on the combined entry based on caseFileStatus', () => {
        const storageGetter = storage.getters.getAll() as ICaseFileCombined[];
        expect(storageGetter[0].readonly).toEqual(false);
        expect(storageGetter[1].readonly).toEqual(true);
      });

      it('should set readonly on the combined entry based on event.status', () => {
        let storageGetter = storage.getters.getAll() as ICaseFileCombined[];
        expect(storageGetter[0].readonly).toEqual(false);
        store.state.caseFileMetadata.items[0].event.status = EEventStatus.OnHold;
        storageGetter = storage.getters.getAll() as ICaseFileCombined[];
        expect(storageGetter[0].readonly).toEqual(true);
      });
    });

    describe('tagsOptions', () => {
      it('should proxy tagsOptions', () => {
        const storageGetter = storage.getters.tagsOptions();
        const storeGetter = store.getters[`${entityModuleName}/tagsOptions`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });

    describe('inactiveReasons', () => {
      it('should proxy inactiveReasons', () => {
        const storageGetter = storage.getters.inactiveReasons();
        const storeGetter = store.getters[`${entityModuleName}/inactiveReasons`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });

    describe('screeningIds', () => {
      it('should proxy screeningIds', () => {
        const storageGetter = storage.getters.screeningIds();
        const storeGetter = store.getters[`${entityModuleName}/screeningIds`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });

    describe('closeReasons', () => {
      it('should proxy closeReasons', () => {
        const storageGetter = storage.getters.closeReasons();
        const storeGetter = store.getters[`${entityModuleName}/closeReasons`]();
        expect(storageGetter).toEqual(storeGetter);
      });
    });
  });

  describe('>> Actions', () => {
    it('should proxy fetchTagsOptions', () => {
      storage.actions.fetchTagsOptions();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchTagsOptions`);
    });

    it('should proxy fetchCaseFileActivities', () => {
      storage.actions.fetchCaseFileActivities('TEST_ID');
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCaseFileActivities`, 'TEST_ID');
    });

    it('should proxy fetchInactiveReasons', () => {
      storage.actions.fetchInactiveReasons();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchInactiveReasons`);
    });

    it('should proxy fetchCloseReasons', () => {
      storage.actions.fetchCloseReasons();
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCloseReasons`);
    });

    it('should proxy fetchCaseFileAssignedCounts', () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      const teamId = '76ca164f-a181-4a0c-8cf1-5967841b3981';
      storage.actions.fetchCaseFileAssignedCounts(eventId, teamId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCaseFileAssignedCounts`, { eventId, teamId });
    });

    it('should proxy fetchCaseFileDetailedCounts', () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      storage.actions.fetchCaseFileDetailedCounts(eventId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/fetchCaseFileDetailedCounts`, eventId);
    });

    it('should proxy setCaseFileTags', () => {
      const id = '1';
      const tags: IListOption[] = [{ optionItemId: 'foo', specifiedOther: null }];
      storage.actions.setCaseFileTags(id, tags);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileTags`, { id, tags });
    });

    it('should proxy setCaseFileStatus', () => {
      const id = '2';
      const status: CaseFileStatus = CaseFileStatus.Inactive;
      const rationale = 'Some rationale';
      const reason: IListOption = { optionItemId: 'foo', specifiedOther: null };
      storage.actions.setCaseFileStatus(id, status, rationale, reason);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileStatus`, {
        id,
        status,
        rationale,
        reason,
      });
    });

    it('should proxy setCaseFileLabels', () => {
      const id = '3';

      const labels: ICaseFileLabel[] = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];
      storage.actions.setCaseFileLabels(id, labels);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileLabels`, { id, labels });
    });

    it('should proxy setCaseFileIsDuplicate', () => {
      const id = '4';
      const isDuplicate = true;
      storage.actions.setCaseFileIsDuplicate(id, isDuplicate);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileIsDuplicate`, { id, isDuplicate });
    });

    it('should proxy setCaseFileIdentityAuthentication', () => {
      const id = '5';
      const identityAuthentication = {
        identificationIds: [{ optionItemId: '1', specifiedOther: null }],
        method: IdentityAuthenticationMethod.InPerson,
        status: IdentityAuthenticationStatus.Passed,
      } as IIdentityAuthentication;
      storage.actions.setCaseFileIdentityAuthentication(id, identityAuthentication);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileIdentityAuthentication`, { id, identityAuthentication });
    });

    it('should proxy setCaseFileValidationOfImpact', () => {
      const id = '5';
      const impactStatusValidation: IImpactStatusValidation = {
        method: ImpactValidationMethod.Manual,
        status: ValidationOfImpactStatus.Impacted,
      };
      storage.actions.setCaseFileValidationOfImpact(id, impactStatusValidation);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileValidationOfImpact`, { id, impactStatusValidation });
    });

    it('should proxy setCaseFileTriage', () => {
      const id = '5';
      const triage = CaseFileTriage.Tier1;
      storage.actions.setCaseFileTriage(id, triage);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileTriage`, { id, triage });
    });

    it('should proxy setCaseFileAssign', () => {
      const id = '5';
      const individuals = ['mock-individual-id'];
      const teams = ['mock-teams-id'];

      storage.actions.setCaseFileAssign(id, individuals, teams);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/setCaseFileAssign`, { id, individuals, teams });
    });

    it('should proxy createCaseFile', () => {
      const payload = {} as ICreateCaseFileRequest;
      storage.actions.createCaseFile(payload);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/createCaseFile`, payload);
    });
  });
});
