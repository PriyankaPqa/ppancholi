import _sortBy from 'lodash/sortBy';

import { ActionContext, ActionTree } from 'vuex';
import { CaseNotesService } from '@/services/case-notes/entity';
import {
  OptionItem, IOptionItem, EOptionLists,
} from '@/entities/optionItem';
import { ICaseNoteEntityState } from '@/store/modules/case-note/caseNoteEntity.types';
import { IOptionItemsService } from '@/services/optionItems';
import { ICaseNoteEntity } from '@/entities/case-note';
import { BaseModule } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';

import { Status } from '@/entities/base';

export class CaseNoteEntityModule extends BaseModule <ICaseNoteEntity, uuid> {
  constructor(readonly service: CaseNotesService, readonly optionItemService: IOptionItemsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseNoteEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
    caseNoteCategories: []as IOptionItem[],
    isSavingCaseNote: false,
    isLoadingCaseNotes: false,
    caseNoteCategoriesFetched: false,
  }

  public getters = {
    ...this.baseGetters,
    caseNoteCategories: (state:ICaseNoteEntityState) => _sortBy(
      state.caseNoteCategories.map((e) => new OptionItem(e)),
      'orderRank',
    ).filter((i) => i.status === Status.Active),
  }

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

    setIsLoadingCaseNotes(state: ICaseNoteEntityState, payload: boolean) {
      state.isLoadingCaseNotes = payload;
    },
  }

  public actions = {
    ...this.baseActions,

    fetchCaseNoteCategories: async (context:ActionContext<ICaseNoteEntityState, ICaseNoteEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.caseNoteCategoriesFetched) {
        context.commit('setIsLoadingCaseNotes', true);
        const results = await this.optionItemService.getOptionList(EOptionLists.CaseNoteCategories);
        context.commit('setIsLoadingCaseNotes', false);
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
      context.commit('setIsLoadingCaseNotes', true);
      const result = await this.service.pinCaseNote(payload.caseFileId, payload.caseNoteId, payload.isPinned);
      if (result) {
        context.commit('set', result);
      }
      context.commit('setIsLoadingCaseNotes', false);
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

  }
}
