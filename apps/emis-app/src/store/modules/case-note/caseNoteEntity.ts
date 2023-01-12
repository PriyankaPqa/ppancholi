import { ActionContext, ActionTree } from 'vuex';
import { CaseNotesService } from '@libs/services-lib/case-notes/entity';
import {
  IOptionItem, EOptionLists,
} from '@libs/entities-lib/optionItem';
import { ICaseNoteEntityState } from '@/store/modules/case-note/caseNoteEntity.types';
import { IOptionItemsService } from '@libs/services-lib/optionItems';
import { ICaseNoteEntity } from '@libs/entities-lib/case-note';
import { SignalR } from '@/ui/plugins/signal-r';
import { ISignalRMock } from '@libs/shared-lib/signal-r';
import { BaseModule, filterAndSortActiveItems } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';

export class CaseNoteEntityModule extends BaseModule <ICaseNoteEntity, uuid> {
  constructor(readonly service: CaseNotesService, readonly optionItemService: IOptionItemsService, protected signalR: typeof SignalR | ISignalRMock) {
    super(service, signalR);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseNoteEntity>, IRootState>,
  });

  public state = {
    ...this.baseState,
    caseNoteCategories: [] as IOptionItem[],
    isSavingCaseNote: false,
    caseNoteCategoriesFetched: false,
  };

  public getters = {
    ...this.baseGetters,

    // eslint-disable-next-line max-len,vue/max-len
    caseNoteCategories: (state: ICaseNoteEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.caseNoteCategories, filterOutInactive, actualValue),

  };

  public mutations = {
    ...this.baseMutations,

    setCaseNoteCategories(state: ICaseNoteEntityState, payload: Array<IOptionItem>) {
      state.caseNoteCategories = payload;
    },

    setCaseNoteCategoriesFetched(state: ICaseNoteEntityState, payload: boolean) {
      state.caseNoteCategoriesFetched = payload;
    },

    setIsSavingCaseNote(state: ICaseNoteEntityState, payload: boolean) {
      state.isSavingCaseNote = payload;
    },
  };

  public actions = {
    ...this.baseActions,

    fetchCaseNoteCategories: async (context:ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.caseNoteCategoriesFetched) {
        const results = await this.optionItemService.getOptionList(EOptionLists.CaseNoteCategories);
        const categories = results ?? [];
        context.commit('setCaseNoteCategories', categories);
        context.commit('setCaseNoteCategoriesFetched', true);
      }
      return context.getters.caseNoteCategories;
    },

    addCaseNote: async (context:ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>, payload: { id: uuid; caseNote: ICaseNoteEntity })
    : Promise<ICaseNoteEntity> => {
      context.commit('setIsSavingCaseNote', true);
      const result = await this.service.addCaseNote(payload.id, payload.caseNote);
      if (result) {
        context.commit('addNewlyCreatedId', result);
        context.commit('set', result);
      }
      context.commit('setIsSavingCaseNote', false);
      return result;
    },

    pinCaseNote: async (
      context:ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>,
      payload: { caseFileId: uuid; caseNoteId: uuid, isPinned: boolean },
    ): Promise<ICaseNoteEntity> => {
      context.commit('setIsSavingCaseNote', true);
      const result = await this.service.pinCaseNote(payload.caseFileId, payload.caseNoteId, payload.isPinned);
      if (result) {
        context.commit('set', result);
      }
      context.commit('setIsSavingCaseNote', false);
      return result;
    },

    editCaseNote: async (
      context:ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>,
      payload: { caseFileId: uuid; caseNoteId: uuid, caseNote: ICaseNoteEntity },
    ): Promise<ICaseNoteEntity> => {
      context.commit('setIsSavingCaseNote', true);
      const result = await this.service.editCaseNote(payload.caseFileId, payload.caseNoteId, payload.caseNote);
      if (result) {
        context.commit('set', result);
      }
      context.commit('setIsSavingCaseNote', false);
      return result;
    },

  };
}
