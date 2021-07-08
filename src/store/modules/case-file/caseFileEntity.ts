import {
  CaseFileStatus, CaseFileTriage, ICaseFileActivity, ICaseFileEntity, ICaseFileLabel, IIdentityAuthentication,
  IImpactStatusValidation,
} from '@/entities/case-file';
import { CaseFilesService } from '@/services/case-files/entity';
import { ActionContext, ActionTree } from 'vuex';
import {
  IOptionItem, EOptionLists,
} from '@/entities/optionItem';
import { ICaseFileEntityState } from '@/store/modules/case-file/caseFileEntity.types';
import { IOptionItemsService } from '@/services/optionItems';
import { IListOption } from '@/types';
import { BaseModule, filterAndSortActiveItems, IState } from '../base';
import { IRootState } from '../../store.types';

export class CaseFileEntityModule extends BaseModule <ICaseFileEntity> {
  constructor(readonly service: CaseFilesService, readonly optionItemService: IOptionItemsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseFileEntity>, IRootState>,
  })

  public state: ICaseFileEntityState = {
    ...this.baseState,
    tagsOptions: [] as IOptionItem[],
    searchLoading: false,
    getLoading: false,
    duplicateLoading: false,
    inactiveReasons: [] as IOptionItem[],
    closeReasons: [] as IOptionItem[],
    triageLoading: false,
    allScreeningIds: [] as IOptionItem[],
    screeningIdsFetched: false,
  }

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
  }

  public mutations = {
    ...this.baseMutations,
    setTagsOptions(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.tagsOptions = payload;
    },

    setInactiveReasons(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.inactiveReasons = payload;
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

    setGetLoading(state: ICaseFileEntityState, payload: boolean) {
      state.getLoading = payload;
    },

    setSearchLoading(state: ICaseFileEntityState, payload: boolean) {
      state.searchLoading = payload;
    },

    setDuplicateLoading(state: ICaseFileEntityState, payload: boolean) {
      state.duplicateLoading = payload;
    },

    setTriageLoading(state: ICaseFileEntityState, payload: boolean) {
      state.triageLoading = payload;
    },
  }

  public actions = {
    ...this.baseActions,

    fetchTagsOptions: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileTags);
      context.commit('setTagsOptions', data);
      // context.commit('setTagsOptionsFetched', true);

      return context.getters.tagsOptions();
    },

    fetchInactiveReasons: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileInactiveReasons);
      context.commit('setInactiveReasons', data);
      // context.commit('setInactiveReasons', true);

      return context.getters.inactiveReasons();
    },

    fetchScreeningIds: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.setScreeningIdsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.ScreeningId);
      context.commit('setScreeningIds', data);
      context.commit('setScreeningIdsFetched', true);

      return context.getters.screeningIds();
    },

    fetchCloseReasons: async (context:ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileCloseReasons);
      context.commit('setCloseReasons', data);
      // context.commit('setCloseReasons', true);

      return context.getters.closeReasons();
    },

    fetchCaseFileActivities: async (context:ActionContext<ICaseFileEntityState, ICaseFileEntityState>, id: uuid)
    : Promise<ICaseFileActivity[]> => this.service.fetchCaseFileActivities(id),

    genericSetAction: async (
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      { id, payload, element }: {id: uuid, payload: unknown, element: string},
    ): Promise<ICaseFileEntityState> => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const res = await this.service[`setCaseFile${element}`](id, payload);
        context.commit('set', res);
        return res;
      } catch (e) {
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
      return context.dispatch('genericSetAction',
        { id, payload: payloadData, element: 'Assign' });
    },

  }
}
