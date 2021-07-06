import _sortBy from 'lodash/sortBy';
import {
  CaseFileStatus, CaseFileTriage, ICaseFileActivity, ICaseFileEntity, ICaseFileLabel,
} from '@/entities/case-file';
import { CaseFilesService } from '@/services/case-files/entity';
import { ActionContext, ActionTree } from 'vuex';
import {
  EOptionListItemStatus, OptionItem, IOptionItem, EOptionLists,
} from '@/entities/optionItem';
import { ICaseFileEntityState } from '@/store/modules/case-file/caseFileEntity.types';
import { IOptionItemsService } from '@/services/optionItems';
import { IListOption } from '@/types';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';

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

  public state = {
    ...this.baseState,
    tagsOptions: [] as IOptionItem[],
    searchLoading: false,
    getLoading: false,
    duplicateLoading: false,
    inactiveReasons: [] as IOptionItem[],
    closeReasons: [] as IOptionItem[],
    triageLoading: false,
  }

  public getters = {
    ...this.baseGetters,

    tagsOptions: (state:ICaseFileEntityState) => _sortBy(
      state.tagsOptions.map((e) => new OptionItem(e)),
      'orderRank',
    ),

    inactiveReasons: (state:ICaseFileEntityState) => _sortBy(
      state.inactiveReasons.map((e) => new OptionItem(e)),
      'orderRank',
    ).filter((i) => i.status === EOptionListItemStatus.Active),

    closeReasons: (state:ICaseFileEntityState) => _sortBy(
      state.closeReasons.map((e) => new OptionItem(e)),
      'orderRank',
    ).filter((i) => i.status === EOptionListItemStatus.Active),
  }

  public mutations = {
    ...this.baseMutations,
    setTagsOptions(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.tagsOptions = payload;
    },

    setInactiveReasons(state: ICaseFileEntityState, payload: Array<IOptionItem>) {
      state.inactiveReasons = payload;
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

      return context.getters.tagsOptions;
    },

    fetchInactiveReasons: async (context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileInactiveReasons);
      context.commit('setInactiveReasons', data);
      // context.commit('setInactiveReasons', true);

      return context.getters.inactiveReasons;
    },

    fetchCloseReasons: async (context:ActionContext<ICaseFileEntityState, ICaseFileEntityState>): Promise<IOptionItem[]> => {
      // if (!context.state.tagsOptionsFetched) { disable caching until signalR events are implemented
      const data = await this.optionItemService.getOptionList(EOptionLists.CaseFileCloseReasons);
      context.commit('setCloseReasons', data);
      // context.commit('setCloseReasons', true);

      return context.getters.closeReasons;
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

    async setCaseFileTriage(
      context: ActionContext<ICaseFileEntityState, ICaseFileEntityState>,
      payload: { id: uuid; triage: CaseFileTriage },
    ): Promise<ICaseFileEntity> {
      return context.dispatch('genericSetAction', { id: payload.id, payload: payload.triage, element: 'Triage' });
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
