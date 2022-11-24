import { ActionContext, ActionTree } from 'vuex';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import {
  CaseFileStatus,
  CaseFileTriage,
  IAssignedTeamMembers,
  ICaseFileActivity,
  ICaseFileCount,
  ICaseFileDetailedCount,
  ICaseFileEntity,
  ICaseFileLabel,
  IIdentityAuthentication,
  IImpactStatusValidation,
} from '@libs/entities-lib/case-file';
import { CaseFilesService, ICreateCaseFileRequest } from '@libs/services-lib/case-files/entity';
import {
  IOptionItem, EOptionLists,
} from '@libs/entities-lib/optionItem';
import { ICaseFileEntityState } from '@/store/modules/case-file/caseFileEntity.types';
import { IOptionItemsService } from '@libs/services-lib/optionItems';
import { IListOption } from '@libs/shared-lib/types';
import { IUserAccountEntity } from '@libs/entities-lib/user-account';
import { SignalR, ISignalRMock } from '@/ui/plugins/signal-r';
import { BaseModule, filterAndSortActiveItems, IState } from '../base';
import { IRootState } from '../../store.types';

export class CaseFileEntityModule extends BaseModule <ICaseFileEntity, uuid> {
  constructor(readonly service: CaseFilesService, readonly optionItemService: IOptionItemsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseFileEntity>, IRootState>,
  });

  public state: ICaseFileEntityState = {
    ...this.baseState,
    tagsOptions: [] as IOptionItem[],
    inactiveReasons: [] as IOptionItem[],
    closeReasons: [] as IOptionItem[],
    allScreeningIds: [] as IOptionItem[],
    tagsOptionsFetched: false,
    inactiveReasonsFetched: false,
    closeReasonsFetched: false,
    screeningIdsFetched: false,
  };

  public getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    tagsOptions: (state: ICaseFileEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.tagsOptions, filterOutInactive, actualValue),

    // eslint-disable-next-line
    inactiveReasons: (state:ICaseFileEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.inactiveReasons, filterOutInactive, actualValue),

    // eslint-disable-next-line
    closeReasons: (state:ICaseFileEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.closeReasons, filterOutInactive, actualValue),

    // eslint-disable-next-line
    screeningIds: (state:ICaseFileEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.allScreeningIds, filterOutInactive, actualValue),
  };

  public mutations = {
    ...this.baseMutations,
    setTagsOptions(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.tagsOptions = payload;
    },

    setTagsOptionsFetched(state: ICaseFileEntityState, payload: boolean) {
      state.tagsOptionsFetched = payload;
    },

    setInactiveReasons(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.inactiveReasons = payload;
    },

    setInactiveReasonsFetched(state: ICaseFileEntityState, payload: boolean) {
      state.inactiveReasonsFetched = payload;
    },

    setScreeningIds(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.allScreeningIds = payload;
    },

    setScreeningIdsFetched(state: ICaseFileEntityState, payload: boolean) {
      state.screeningIdsFetched = payload;
    },

    setCloseReasons(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.closeReasons = payload;
    },

    setCloseReasonsFetched(state: ICaseFileEntityState, payload: boolean) {
      state.closeReasonsFetched = payload;
    },
  };

  public actions = {
    ...this.baseActions,

    fetchTagsOptions: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.tagsOptionsFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileTags);
        context.commit('setTagsOptions', data);
        context.commit('setTagsOptionsFetched', true);
      }

      return context.getters.tagsOptions();
    },

    fetchInactiveReasons: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.inactiveReasonsFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileInactiveReasons);
        context.commit('setInactiveReasons', data);
        context.commit('setInactiveReasonsFetched', true);
      }
      return context.getters.inactiveReasons();
    },

    fetchScreeningIds: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.screeningIdsFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.ScreeningId);
        context.commit('setScreeningIds', data);
        context.commit('setScreeningIdsFetched', true);
      }

      return context.getters.screeningIds();
    },

    fetchCloseReasons: async (context:ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.closeReasonsFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileCloseReasons);
        context.commit('setCloseReasons', data);
        context.commit('setCloseReasonFetched', true);
      }

      return context.getters.closeReasons();
    },

    fetchCaseFileActivities: async (context:ActionContext<ICaseFileEntityState, ICaseFileEntityState>, id: uuid)
    : Promise<ICaseFileActivity[]> => this.service.fetchCaseFileActivities(id),

    genericSetAction: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      { id, payload, element }: { id: uuid, payload: unknown, element: string },
    ): Promise<ICaseFileEntityState> => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const res = await this.service[`setCaseFile${element}`](id, payload);
        context.commit('set', res);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, {
          id, payload, element,
        }, 'module.caseFileEntity', 'genericSetAction');
        return null;
      }
    },

    async setCaseFileTags(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { tags: IListOption[]; id: uuid },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.tags, element: 'Tags' });
    },

    async setCaseFileStatus(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; status: CaseFileStatus; rationale: string; reason: IListOption },
    ): Promise<ICaseFileEntity> {
      const { id, ...payloadData } = payload;
      return context.dispatch('genericSetAction', { id, payload: payloadData, element: 'Status' });
    },

    async setCaseFileIsDuplicate(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; isDuplicate: boolean },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.isDuplicate, element: 'IsDuplicate' });
    },

    async setCaseFileLabels(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; labels: ICaseFileLabel[] },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.labels, element: 'Labels' });
    },

    async setCaseFileIdentityAuthentication(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; identityAuthentication: IIdentityAuthentication },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.identityAuthentication, element: 'IdentityAuthentication' });
    },

    async setCaseFileTriage(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; triage: CaseFileTriage },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.triage, element: 'Triage' });
    },

    async setCaseFileValidationOfImpact(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; impactStatusValidation: IImpactStatusValidation },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.impactStatusValidation, element: 'ValidationOfImpact' });
    },

    async setCaseFileAssign(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid, individuals: uuid[]; teams: uuid[] },
    ): Promise<ICaseFileEntity> {
      const { id, ...payloadData } = payload;
      return context.dispatch(
        'genericSetAction',
        { id, payload: payloadData, element: 'Assign' },
      );
    },

    createCaseFile: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: ICreateCaseFileRequest,
    ): Promise<IUserAccountEntity> => {
      try {
        const res = await this.service.createCaseFile(payload);
        if (res) {
          context.commit('addNewlyCreatedId', res);
          context.commit('set', res);
        }
        return res;
      } catch (e) {
        applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'createCaseFile');
        return null;
      }
    },

    fetchCaseFileAssignedCounts: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      { eventId, teamId }: { eventId: uuid; teamId: uuid },
    ): Promise<ICaseFileCount> => {
      try {
        const res = await this.service.getCaseFileAssignedCounts({
          eventId,
          teamId,
        });
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { eventId, teamId }, 'module.caseFileEntity', 'fetchCaseFileAssignedCounts');
        return null;
      }
    },

    fetchCaseFileDetailedCounts: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      eventId: uuid,
    ): Promise<ICaseFileDetailedCount> => {
      try {
        const res = await this.service.fetchCaseFileDetailedCounts(eventId);
        return res;
      } catch (e) {
        applicationInsights.trackException(e, { eventId }, 'module.caseFileEntity', 'fetchCaseFileDetailedCounts');
        return null;
      }
    },

    assignCaseFile: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid, teamMembers: IAssignedTeamMembers[]; teams: uuid[] },
    ): Promise<IUserAccountEntity> => {
      try {
        const { id, ...payloadData } = payload;
        const res = await this.service.assignCaseFile(id, payloadData);
        if (res) {
          context.commit('set', res);
        }
        return res;
      } catch (e) {
        applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'assignCaseFile');
        return null;
      }
    },
  };
}
