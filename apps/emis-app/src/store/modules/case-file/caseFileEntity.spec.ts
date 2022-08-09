import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFilesService } from '@libs/services-lib/case-files/entity';
import { OptionItemsService } from '@libs/services-lib/optionItems';
import {
  CaseFileStatus, CaseFileTriage, mockCaseFileActivities, mockTagsOptions, mockCaseFileEntity,
  IIdentityAuthentication, IdentityAuthenticationStatus, IdentityAuthenticationMethod, IImpactStatusValidation,
  ImpactValidationMethod, ValidationOfImpactStatus, ICaseFileEntity, mockAssignedTeamMembers,
} from '@libs/entities-lib/case-file';
import { EOptionLists, mockOptionItemData, OptionItem } from '@libs/entities-lib/optionItem';
import { CaseFileEntityModule } from './caseFileEntity';
import { ICaseFileEntityState } from './caseFileEntity.types';
import { mockSignalR } from '../../../ui/plugins/signal-r';

const signalR = mockSignalR();
const service = new CaseFilesService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const myModule = new CaseFileEntityModule(service, optionItemService, signalR);

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
        myModule.mutations.setTagsOptions(myModule.state, mockTagsOptions());
        const res = myModule.getters.tagsOptions(myModule.state)();
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
        myModule.mutations.setInactiveReasons(myModule.state, mockOptionItemData());
        const res = myModule.getters.inactiveReasons(myModule.state)();
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
        myModule.mutations.setCloseReasons(myModule.state, mockOptionItemData());
        const res = myModule.getters.closeReasons(myModule.state)();
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
        myModule.mutations.setScreeningIds(myModule.state, mockOptionItemData());
        const res = myModule.getters.screeningIds(myModule.state)();
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
        myModule.mutations.setTagsOptions(myModule.state, options);
        expect(myModule.state.tagsOptions).toEqual(options);
      });
    });

    describe('setTagsOptionsFetched', () => {
      test('the setTagsOptionsFetched mutation sets the tagsOptionsFetched state', () => {
        myModule.mutations.setTagsOptionsFetched(myModule.state, true);
        expect(myModule.state.tagsOptionsFetched).toEqual(true);
      });
    });

    describe('setInactiveReasons', () => {
      test('the setInactiveReasons mutation sets the inactiveReasons state', () => {
        const reasons = mockOptionItemData();
        myModule.mutations.setInactiveReasons(myModule.state, reasons);
        expect(myModule.state.inactiveReasons).toEqual(reasons);
      });
    });

    describe('setInactiveReasonsFetched', () => {
      test('the setInactiveReasonsFetched mutation sets the inactiveReasonsFetched state', () => {
        myModule.mutations.setInactiveReasonsFetched(myModule.state, true);
        expect(myModule.state.inactiveReasonsFetched).toEqual(true);
      });
    });

    describe('setCloseReasons', () => {
      test('the setCloseReasons mutation sets the closeReasons state', () => {
        const reasons = mockOptionItemData();
        myModule.mutations.setCloseReasons(myModule.state, reasons);
        expect(myModule.state.closeReasons).toEqual(reasons);
      });
    });

    describe('setCloseReasonsFetched', () => {
      test('the setCloseReasonsFetched mutation sets the closeReasonsFetched state', () => {
        myModule.mutations.setCloseReasonsFetched(myModule.state, true);
        expect(myModule.state.closeReasonsFetched).toEqual(true);
      });
    });

    describe('setScreeningIds', () => {
      test('the setScreeningIds mutation sets the screeningIds state', () => {
        const i = mockOptionItemData();
        myModule.mutations.setScreeningIds(myModule.state, i);
        expect(myModule.state.allScreeningIds).toEqual(i);
      });
    });

    describe('setScreeningIdsFetched', () => {
      test('the setScreeningIdsFetched mutation sets the screeningIdsFetched state', () => {
        myModule.mutations.setScreeningIdsFetched(myModule.state, true);
        expect(myModule.state.screeningIdsFetched).toEqual(true);
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        expect(myModule.state.searchLoading).toBe(false);
        myModule.mutations.setSearchLoading(myModule.state, true);
        expect(myModule.state.searchLoading).toBe(true);
      });
    });
  });

  describe('actions', () => {
    describe('fetchTagsOptions', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchTagsOptions(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileTags);
        expect(actionContext.commit).toBeCalledWith('setTagsOptions', res);
      });
    });

    describe('fetchInactiveReasons', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchInactiveReasons(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileInactiveReasons);
        expect(actionContext.commit).toBeCalledWith('setInactiveReasons', res);
      });
    });

    describe('fetchScreeningIds', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchScreeningIds(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.ScreeningId);
        expect(actionContext.commit).toBeCalledWith('setScreeningIds', res);
      });
    });

    describe('fetchCloseReasons', () => {
      it('should call optionItemService getOptionList and commit the result', async () => {
        const res = mockOptionItemData();
        myModule.optionItemService.getOptionList = jest.fn(() => Promise.resolve(res));
        await myModule.actions.fetchCloseReasons(actionContext);

        expect(myModule.optionItemService.getOptionList).toBeCalledWith(EOptionLists.CaseFileCloseReasons);
        expect(actionContext.commit).toBeCalledWith('setCloseReasons', res);
      });
    });

    describe('fetchCaseFileActivities', () => {
      it('should call service fetchCaseFileActivities and commit the result', async () => {
        const serviceRes = mockCaseFileActivities();
        const id = 'mock_id';
        myModule.service.fetchCaseFileActivities = jest.fn(() => Promise.resolve(serviceRes));
        const activities = await myModule.actions.fetchCaseFileActivities(actionContext, id);

        expect(myModule.service.fetchCaseFileActivities).toBeCalledWith(id);
        expect(activities).toEqual(serviceRes);
      });
    });

    describe('genericSetAction', () => {
      it('calls the right service and commits the result', async () => {
        const id = 'mock-id';
        const payload = 'mock-payload';
        const element = 'Tags';
        const serviceRes = mockCaseFileEntity();
        myModule.service.setCaseFileTags = jest.fn(() => Promise.resolve(serviceRes));
        const response = await myModule.actions.genericSetAction(actionContext, { id, payload, element });

        expect(myModule.service.setCaseFileTags).toBeCalledWith(id, payload);
        expect(response).toEqual(serviceRes);
      });
    });

    describe('setCaseFileTags', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const tags = [{ optionItemId: '1', specifiedOther: '' }];
        await myModule.actions.setCaseFileTags(actionContext, { tags, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: tags, element: 'Tags' });
      });
    });

    describe('setCaseFileStatus', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const status = CaseFileStatus.Inactive;
        const rationale = 'mock-rationale';
        const reason = { optionItemId: '1', specifiedOther: '' };
        await myModule.actions.setCaseFileStatus(actionContext, {
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
        await myModule.actions.setCaseFileIsDuplicate(actionContext, { isDuplicate, id });

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
        await myModule.actions.setCaseFileLabels(actionContext, { labels, id });

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
        await myModule.actions.setCaseFileIdentityAuthentication(actionContext, { identityAuthentication, id });

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
        await myModule.actions.setCaseFileValidationOfImpact(actionContext, { impactStatusValidation, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: impactStatusValidation, element: 'ValidationOfImpact' });
      });
    });

    describe('setCaseFileTriage', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const triage = CaseFileTriage.Tier1;
        await myModule.actions.setCaseFileTriage(actionContext, { triage, id });

        expect(actionContext.dispatch).toBeCalledWith('genericSetAction', { id, payload: triage, element: 'Triage' });
      });
    });

    describe('setCaseFileAssign', () => {
      it('dispatches the right action with the right payload', async () => {
        const id = 'mock-id';
        const individuals = ['mock-individual-id'];
        const teams = ['mock-teams-id'];

        await myModule.actions.setCaseFileAssign(actionContext, { individuals, teams, id });

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
        myModule.service.createCaseFile = jest.fn(() => Promise.resolve(res));
        await myModule.actions.createCaseFile(actionContext, payload);

        expect(myModule.service.createCaseFile).toBeCalledWith(payload);
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

        myModule.service.getCaseFileAssignedCounts = jest.fn();

        await myModule.actions.fetchCaseFileAssignedCounts(actionContext, params);

        expect(myModule.service.getCaseFileAssignedCounts).toBeCalledWith(params);
      });
    });

    describe('fetchCaseFileDetailedCounts', () => {
      it('should call fetchCaseFileDetailedCounts service with proper params', async () => {
        const eventId = '0ea8ebda-d0c8-4482-85cb-6f5f4447d3c3';

        myModule.service.fetchCaseFileDetailedCounts = jest.fn();

        await myModule.actions.fetchCaseFileDetailedCounts(actionContext, eventId);

        expect(myModule.service.fetchCaseFileDetailedCounts).toBeCalledWith(eventId);
      });
    });

    describe('assignCaseFile', () => {
      it('should call assignCaseFile service with proper params', async () => {
        const id = '1';
        const payload = { teamMembers: mockAssignedTeamMembers(), teams: ['1'] };

        myModule.service.assignCaseFile = jest.fn();

        await myModule.actions.assignCaseFile(actionContext, { id, ...payload });

        expect(myModule.service.assignCaseFile).toBeCalledWith(id, payload);
      });
    });
  });
});
