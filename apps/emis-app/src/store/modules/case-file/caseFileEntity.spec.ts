import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFilesService } from '@/services/case-files/entity';
import { OptionItemsService } from '@/services/optionItems';
import {
  CaseFileStatus, CaseFileTriage, mockCaseFileActivities, mockTagsOptions, mockCaseFileEntity,
  IIdentityAuthentication, IdentityAuthenticationStatus, IdentityAuthenticationMethod, IImpactStatusValidation,
  ImpactValidationMethod, ValidationOfImpactStatus, ICaseFileEntity, mockAssignedTeamMembers,
} from '@/entities/case-file';
import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { CaseFileEntityModule } from './caseFileEntity';
import { ICaseFileEntityState } from './caseFileEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();
const service = new CaseFilesService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const module = new CaseFileEntityModule(service, optionItemService, signalR);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as ICaseFileEntityState,
  getters: {
    tagsOptions: jest.fn(), inactiveReasons: jest.fn(), closeReasons: jest.fn(), screeningIds: jest.fn(),
  },
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseFileEntityState, ICaseFileEntityState>;

describe('Case file entity module', () => {
  describe('getters', () => {
    describe('tagsOptions', () => {
      it('returns the sorted tagsOptions', () => {
        module.mutations.setTagsOptions(module.state, mockTagsOptions());
        const res = module.getters.tagsOptions(module.state)();
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
        module.mutations.setInactiveReasons(module.state, mockOptionItemData());
        const res = module.getters.inactiveReasons(module.state)();
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
        module.mutations.setCloseReasons(module.state, mockOptionItemData());
        const res = module.getters.closeReasons(module.state)();
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
        module.mutations.setScreeningIds(module.state, mockOptionItemData());
        const res = module.getters.screeningIds(module.state)();
        expect(res).toEqual(
          _sortBy(
            [mockOptionItemData()[0], mockOptionItemData()[1]].map((e) => new OptionItem(e)),
            'orderRank',
          ),
        );
      });
    });
  });

  describe('mutations', () => {
    describe('setTagsOptions', () => {
      test('the setTagsOptions mutation sets the tagsOptions state', () => {
        const options = mockTagsOptions();
        module.mutations.setTagsOptions(module.state, options);
        expect(module.state.tagsOptions).toEqual(options);
      });
    });

    describe('setTagsOptionsFetched', () => {
      test('the setTagsOptionsFetched mutation sets the tagsOptionsFetched state', () => {
        module.mutations.setTagsOptionsFetched(module.state, true);
        expect(module.state.tagsOptionsFetched).toEqual(true);
      });
    });

    describe('setInactiveReasons', () => {
      test('the setInactiveReasons mutation sets the inactiveReasons state', () => {
        const reasons = mockOptionItemData();
        module.mutations.setInactiveReasons(module.state, reasons);
        expect(module.state.inactiveReasons).toEqual(reasons);
      });
    });

    describe('setInactiveReasonsFetched', () => {
      test('the setInactiveReasonsFetched mutation sets the inactiveReasonsFetched state', () => {
        module.mutations.setInactiveReasonsFetched(module.state, true);
        expect(module.state.inactiveReasonsFetched).toEqual(true);
      });
    });

    describe('setCloseReasons', () => {
      test('the setCloseReasons mutation sets the closeReasons state', () => {
        const reasons = mockOptionItemData();
        module.mutations.setCloseReasons(module.state, reasons);
        expect(module.state.closeReasons).toEqual(reasons);
      });
    });

    describe('setCloseReasonsFetched', () => {
      test('the setCloseReasonsFetched mutation sets the closeReasonsFetched state', () => {
        module.mutations.setCloseReasonsFetched(module.state, true);
        expect(module.state.closeReasonsFetched).toEqual(true);
      });
    });

    describe('setScreeningIds', () => {
      test('the setScreeningIds mutation sets the screeningIds state', () => {
        const i = mockOptionItemData();
        module.mutations.setScreeningIds(module.state, i);
        expect(module.state.allScreeningIds).toEqual(i);
      });
    });

    describe('setScreeningIdsFetched', () => {
      test('the setScreeningIdsFetched mutation sets the screeningIdsFetched state', () => {
        module.mutations.setScreeningIdsFetched(module.state, true);
        expect(module.state.screeningIdsFetched).toEqual(true);
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        expect(module.state.searchLoading).toBe(false);
        module.mutations.setSearchLoading(module.state, true);
        expect(module.state.searchLoading).toBe(true);
      });
    });
  });

  describe('actions', () => {
    describe('fetchTagsOptions', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchTagsOptions(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileTags);
        expect(actionContext.commit).toBeCalledWith('setTagsOptions', res);
      });
    });

    describe('fetchInactiveReasons', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchInactiveReasons(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileInactiveReasons);
        expect(actionContext.commit).toBeCalledWith('setInactiveReasons', res);
      });
    });

    describe('fetchScreeningIds', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchScreeningIds(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ScreeningId);
        expect(actionContext.commit).toBeCalledWith('setScreeningIds', res);
      });
    });

    describe('fetchCloseReasons', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        module.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await module.actions.fetchCloseReasons(actionContext);

        expect(module.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileCloseReasons);
        expect(actionContext.commit).toBeCalledWith('setCloseReasons', res);
      });
    });

    describe('fetchCaseFileActivities', () => {
      it('should call service fetchCaseFileActivities and commit the result', async () => {
        const serviceRes = mockCaseFileActivities();
        const id = 'mock_id';
        module.service.fetchCaseFileActivities = jest.fn(() => Promise.resolve(serviceRes));
        const activities = await module.actions.fetchCaseFileActivities(actionContext, id);

        expect(module.service.fetchCaseFileActivities).toBeCalledWith(id);
        expect(activities).toEqual(serviceRes);
      });
    });

    describe('genericSetAction', () => {
      it('calls the right service and commits the result', async () => {
        const id = 'mock-id';
        const payload = 'mock-payload';
        const element = 'Tags';
        const serviceRes = mockCaseFileEntity();
        module.service.setCaseFileTags = jest.fn(() => Promise.resolve(serviceRes));
        const response = await module.actions.genericSetAction(actionContext, { id, payload, element });

        expect(module.service.setCaseFileTags).toBeCalledWith(id, payload);
        expect(response).toEqual(serviceRes);
      });
    });

    describe('setCaseFileTags', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const tags = [{ optionItemId: '1', specifiedOther: '' }];
        await module.actions.setCaseFileTags(actionContext, { tags, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: tags, element: 'Tags' });
      });
    });

    describe('setCaseFileStatus', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const status = CaseFileStatus.Inactive;
        const rationale = 'mock-rationale';
        const reason = { optionItemId: '1', specifiedOther: '' };
        await module.actions.setCaseFileStatus(actionContext, {
          id, status, rationale, reason,
        });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', {
          id,
          payload: { status, reason, rationale },
          element: 'Status',
        });
      });
    });

    describe('setCaseFileIsDuplicate', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const isDuplicate = true;
        await module.actions.setCaseFileIsDuplicate(actionContext, { isDuplicate, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: isDuplicate, element: 'IsDuplicate' });
      });
    });

    describe('setCaseFileLabels', () => {
      it('dispatches the right action with the right payload', async () => {
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
        await module.actions.setCaseFileLabels(actionContext, { labels, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: labels, element: 'Labels' });
      });
    });

    describe('setCaseFileIdentityAuthentication', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const identityAuthentication: IIdentityAuthentication = {
          identificationIds: [],
          status: IdentityAuthenticationStatus.Failed,
          method: IdentityAuthenticationMethod.System,
        };
        await module.actions.setCaseFileIdentityAuthentication(actionContext, { identityAuthentication, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: identityAuthentication, element: 'IdentityAuthentication' });
      });
    });

    describe('setCaseFileValidationOfImpact', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const impactStatusValidation: IImpactStatusValidation = {
          method: ImpactValidationMethod.Manual,
          status: ValidationOfImpactStatus.Impacted,
        };
        await module.actions.setCaseFileValidationOfImpact(actionContext, { impactStatusValidation, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: impactStatusValidation, element: 'ValidationOfImpact' });
      });
    });

    describe('setCaseFileTriage', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const triage = CaseFileTriage.Tier1;
        await module.actions.setCaseFileTriage(actionContext, { triage, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: triage, element: 'Triage' });
      });
    });

    describe('setCaseFileAssign', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const individuals = ['mock-individual-id'];
        const teams = ['mock-teams-id'];

        await module.actions.setCaseFileAssign(actionContext, { individuals, teams, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: { individuals, teams }, element: 'Assign' });
      });
    });

    describe('createCaseFile', () => {
      it('should call createCaseFile service with proper params', async () => {
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
        const res = {} as ICaseFileEntity;
        module.service.createCaseFile = jest.fn(() => Promise.resolve(res));
        await module.actions.createCaseFile(actionContext, payload);

        expect(module.service.createCaseFile).toBeCalledWith(payload);
        expect(actionContext.commit).toBeCalledWith('addNewlyCreatedId', res);
        expect(actionContext.commit).toBeCalledWith('set', res);
      });
    });

    describe('fetchCaseFileAssignedCounts', () => {
      it('should call getCaseFileAssignedCounts service with proper params', async () => {
        const params = {
          eventId: '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3',
          teamId: '76ca164f-a181-4a0c-8cf1-5967841b3981',
        };

        module.service.getCaseFileAssignedCounts = jest.fn();

        await module.actions.fetchCaseFileAssignedCounts(actionContext, params);

        expect(module.service.getCaseFileAssignedCounts).toBeCalledWith(params);
      });
    });

    describe('fetchCaseFileDetailedCounts', () => {
      it('should call fetchCaseFileDetailedCounts service with proper params', async () => {
        const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

        module.service.fetchCaseFileDetailedCounts = jest.fn();

        await module.actions.fetchCaseFileDetailedCounts(actionContext, eventId);

        expect(module.service.fetchCaseFileDetailedCounts).toBeCalledWith(eventId);
      });
    });

    describe('assignCaseFile', () => {
      it('should call assignCaseFile service with proper params', async () => {
        const id = '1';
        const payload = { teamMembers: mockAssignedTeamMembers(), teams: ['1'] };

        module.service.assignCaseFile = jest.fn();

        await module.actions.assignCaseFile(actionContext, { id, ...payload });

        expect(module.service.assignCaseFile).toBeCalledWith(id, payload);
      });
    });
  });
});
