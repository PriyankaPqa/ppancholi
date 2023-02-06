import { getBaseStoreComponents } from '@libs/stores-lib/base';
import { defineStore, setActivePinia } from 'pinia';
import { createTestingPinia } from '@pinia/testing';
import { mockCaseFilesService } from '@libs/services-lib/case-files/entity';
import { mockOptionItemsService } from '@libs/services-lib/optionItems';
import {
  CaseFileStatus, CaseFileTriage,
  ICaseFileEntity, IdentityAuthenticationMethod, IdentityAuthenticationStatus,
  IdParams,
  IIdentityAuthentication, IImpactStatusValidation, ImpactValidationMethod, mockAssignedTeamMembers,
  mockCaseFileActivities,
  mockCaseFileEntity,
  mockTagsOptions, ValidationOfImpactStatus,
} from '@libs/entities-lib/case-file';
import { getExtensionComponents } from '@/pinia/case-file/case-file-extension';
import _sortBy from 'lodash/sortBy';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { mockDetailedRegistrationResponse } from '@libs/entities-lib/household';

const entityService = mockCaseFilesService();
const optionItemService = mockOptionItemsService();
const baseComponents = getBaseStoreComponents<ICaseFileEntity, IdParams>(entityService);

const getPinia = () => {
  const pinia = createTestingPinia({ stubActions: false });
  setActivePinia(pinia);
  return pinia;
};

const useCaseFileTestStore = (opts = {}) => {
  const newBaseComponents = {
    ...baseComponents,
    ...opts,
  };

  const extensionComponents = getExtensionComponents(newBaseComponents, entityService, optionItemService);

  const useStore = defineStore('test-case-file', () => ({
    ...newBaseComponents,
    ...extensionComponents,
  }));
  return useStore();
};

const createTestStore = (bComponents = {}) => {
  getPinia();
  const store = useCaseFileTestStore(bComponents);
  return store;
};

describe('>>> Case File Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTagsOptions', () => {
    it('returns the sorted tagsOptions', () => {
      const store = createTestStore();
      store.tagsOptions = mockTagsOptions();
      const res = store.getTagsOptions();
      expect(res).toEqual(
        _sortBy(
          mockTagsOptions().map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('inactiveReasons', () => {
    test('the getter returns the sorted inactive reasons', () => {
      const store = createTestStore();
      store.inactiveReasons = mockOptionItemData();
      const res = store.getInactiveReasons();
      expect(res).toEqual(
        _sortBy(
          [mockOptionItemData()[0], mockOptionItemData()[1]].map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('closeReasons', () => {
    test('the getter returns the sorted inactive reasons', () => {
      const store = createTestStore();
      store.closeReasons = mockOptionItemData();
      const res = store.getCloseReasons();
      expect(res).toEqual(
        _sortBy(
          [mockOptionItemData()[0], mockOptionItemData()[1]].map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('screeningIds', () => {
    test('the getter returns the sorted screening Ids', () => {
      const store = createTestStore();
      store.screeningIds = mockOptionItemData();
      const res = store.getScreeningIds();
      expect(res).toEqual(
        _sortBy(
          [mockOptionItemData()[0], mockOptionItemData()[1]].map((e) => new OptionItem(e)),
          'orderRank',
        ),
      );
    });
  });

  describe('fetchTagsOptions', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      await store.fetchTagsOptions();
      expect(optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileTags);
      expect(store.tagsOptions).toEqual(mockOptionItemData());
    });
  });

  describe('fetchInactiveReasons', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      await store.fetchInactiveReasons();
      expect(optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileInactiveReasons);
      expect(store.inactiveReasons).toEqual(mockOptionItemData());
    });
  });

  describe('fetchScreeningIds', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      await store.fetchScreeningIds();
      expect(optionItemService.getOptionList).toBeCalledWith(EOptionLists.ScreeningId);
      expect(store.screeningIds).toEqual(mockOptionItemData());
    });
  });

  describe('fetchCloseReasons', () => {
    it('should call optionItemService getOptionList and commit the result', async () => {
      const store = createTestStore();
      await store.fetchCloseReasons();
      expect(optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileCloseReasons);
      expect(store.closeReasons).toEqual(mockOptionItemData());
    });
  });

  describe('fetchCaseFileActivities', () => {
    it('should call service fetchCaseFileActivities and commit the result', async () => {
      const store = createTestStore();
      const id = 'mock_id';
      const activities = await store.fetchCaseFileActivities(id);
      expect(entityService.fetchCaseFileActivities).toBeCalledWith(id);
      expect(activities).toEqual(mockCaseFileActivities());
    });
  });

  describe('genericSetAction', () => {
    it('calls the right service and commits the result', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const payload = 'mock-payload';
      const element = 'Tags';
      const response = await store.genericSetAction({ id, payload, element });
      expect(entityService.setCaseFileTags).toBeCalledWith(id, payload);
      expect(JSON.stringify(response)).toEqual(JSON.stringify(mockCaseFileEntity()));
    });
  });

  describe('setCaseFileTags', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const tags = [{ optionItemId: '1', specifiedOther: '' }];
      await store.setCaseFileTags(id, tags);

      expect(entityService.setCaseFileTags).toBeCalledWith(id, tags);
    });
  });

  describe('setCaseFileStatus', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const status = CaseFileStatus.Inactive;
      const rationale = 'mock-rationale';
      const reason = { optionItemId: '1', specifiedOther: '' };
      await store.setCaseFileStatus({
        id, status, rationale, reason,
      });
      expect(entityService.setCaseFileStatus).toBeCalledWith(id, { status, reason, rationale });
    });
  });

  describe('setCaseFileIsDuplicate', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const isDuplicate = true;
      await store.setCaseFileIsDuplicate(id, isDuplicate);
      expect(entityService.setCaseFileIsDuplicate).toBeCalledWith(id, isDuplicate);
    });
  });

  describe('setCaseFileLabels', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const labels = [
        {
          name: 'Label One',
          order: 1,
        },
        {
          name: 'Label Two',
          order: 2,
        },
      ];
      await store.setCaseFileLabels(id, labels);
      expect(entityService.setCaseFileLabels).toBeCalledWith(id, labels);
    });
  });

  describe('setCaseFileIdentityAuthentication', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const identityAuthentication: IIdentityAuthentication = {
        identificationIds: [],
        status: IdentityAuthenticationStatus.Failed,
        method: IdentityAuthenticationMethod.System,
      };
      await store.setCaseFileIdentityAuthentication(id, identityAuthentication);
      expect(entityService.setCaseFileIdentityAuthentication).toBeCalledWith(id, identityAuthentication);
    });
  });

  describe('setCaseFileValidationOfImpact', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const impactStatusValidation: IImpactStatusValidation = {
        method: ImpactValidationMethod.Manual,
        status: ValidationOfImpactStatus.Impacted,
      };
      await store.setCaseFileValidationOfImpact(id, impactStatusValidation);
      expect(entityService.setCaseFileValidationOfImpact).toBeCalledWith(id, impactStatusValidation);
    });
  });

  describe('setCaseFileTriage', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const triage = CaseFileTriage.Tier1;
      await store.setCaseFileTriage(id, triage);
      expect(entityService.setCaseFileTriage).toBeCalledWith(id, triage);
    });
  });

  describe('setCaseFileAssign', () => {
    it('dispatches the right action with the right payload', async () => {
      const store = createTestStore();
      const id = 'mock-id';
      const individuals = ['mock-individual-id'];
      const teams = ['mock-teams-id'];

      await store.setCaseFileAssign({ individuals, teams, id });
      expect(entityService.setCaseFileAssign).toBeCalledWith(id, { individuals, teams });
    });
  });

  describe('createCaseFile', () => {
    it('should call createCaseFile service with proper params', async () => {
      const bComponents = { ...baseComponents, addNewlyCreatedId: jest.fn(), set: jest.fn() };
      const store = createTestStore(bComponents);
      const payload = {
        householdId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        eventId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        consentInformation: {
          registrationMethod: 1,
          registrationLocationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          crcUserName: 'string',
          privacyDateTimeConsent: '2021-07-06T19:37:10.185Z',
        },
      };
      const res = mockDetailedRegistrationResponse();
      await store.createCaseFile(payload);

      expect(entityService.createCaseFile).toBeCalledWith(payload);
      expect(bComponents.addNewlyCreatedId).toBeCalledWith(res.caseFile);
      expect(bComponents.set).toBeCalledWith(res.caseFile);
    });
  });

  describe('fetchCaseFileAssignedCounts', () => {
    it('should call getCaseFileAssignedCounts service with proper params', async () => {
      const params = {
        eventId: '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3',
        teamId: '76ca164f-a181-4a0c-8cf1-5967841b3981',
      };

      const store = createTestStore();
      await store.fetchCaseFileAssignedCounts(params.eventId, params.teamId);
      expect(entityService.getCaseFileAssignedCounts).toBeCalledWith(params);
    });
  });

  describe('fetchCaseFileDetailedCounts', () => {
    it('should call fetchCaseFileDetailedCounts service with proper params', async () => {
      const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';
      const store = createTestStore();

      await store.fetchCaseFileDetailedCounts(eventId);

      expect(entityService.fetchCaseFileDetailedCounts).toBeCalledWith(eventId);
    });
  });

  describe('assignCaseFile', () => {
    it('should call assignCaseFile service with proper params', async () => {
      const id = '1';
      const store = createTestStore();
      const payload = { teamMembers: mockAssignedTeamMembers(), teams: ['1'] };

      await store.assignCaseFile({ id, ...payload });

      expect(entityService.assignCaseFile).toBeCalledWith(id, payload);
    });
  });
});
