import { ActionContext } from 'vuex';
import _sortBy from 'lodash/sortBy';

import { httpClient } from '@/services/httpClient';
import { CaseFilesService } from '@/services/case-files/entity';
import { OptionItemsService } from '@/services/optionItems';
import {
  CaseFileStatus, CaseFileTriage, mockCaseFileActivities, mockTagsOptions, mockCaseFileEntity,
} from '@/entities/case-file';
import { EOptionLists, mockOptionItemData, OptionItem } from '@/entities/optionItem';
import { CaseFileEntityModule } from './caseFileEntity';
import { ICaseFileEntityState } from './caseFileEntity.types';

const service = new CaseFilesService(httpClient);
const optionItemService = new OptionItemsService(httpClient);
const module = new CaseFileEntityModule(service, optionItemService);

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: null,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<ICaseFileEntityState, ICaseFileEntityState>;

describe('Case file entity module', () => {
  describe('getters', () => {
    describe('tagsOptions', () => {
      it('returns the sorted tagsOptions', () => {
        module.mutations.setTagsOptions(module.state, mockTagsOptions());
        const res = module.getters.tagsOptions(module.state);
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
        const res = module.getters.inactiveReasons(module.state);
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
        const res = module.getters.closeReasons(module.state);
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

    describe('setInactiveReasons', () => {
      test('the setInactiveReasons mutation sets the inactiveReasons state', () => {
        const reasons = mockOptionItemData();
        module.mutations.setInactiveReasons(module.state, reasons);
        expect(module.state.inactiveReasons).toEqual(reasons);
      });
    });

    describe('setCloseReasons', () => {
      test('the setCloseReasons mutation sets the closeReasons state', () => {
        const reasons = mockOptionItemData();
        module.mutations.setCloseReasons(module.state, reasons);
        expect(module.state.closeReasons).toEqual(reasons);
      });
    });

    describe('setGetLoading', () => {
      test('the setGetLoading mutation sets the getLoading state', () => {
        expect(module.state.getLoading).toBe(false);
        module.mutations.setGetLoading(module.state, true);
        expect(module.state.getLoading).toBe(true);
      });
    });

    describe('setSearchLoading', () => {
      test('the setSearchLoading mutation sets the searchLoading state', () => {
        expect(module.state.searchLoading).toBe(false);
        module.mutations.setSearchLoading(module.state, true);
        expect(module.state.searchLoading).toBe(true);
      });
    });

    describe('setTriageLoading', () => {
      test('the setTriageLoading mutation sets the triageLoading state', () => {
        expect(module.state.triageLoading).toBe(false);
        module.mutations.setTriageLoading(module.state, true);
        expect(module.state.triageLoading).toBe(true);
      });
    });

    describe('setDuplicateLoading', () => {
      test('the setDuplicateLoading mutation sets the duplicateLoading state', () => {
        expect(module.state.duplicateLoading).toBe(false);
        module.mutations.setDuplicateLoading(module.state, true);
        expect(module.state.duplicateLoading).toBe(true);
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
  });
});
