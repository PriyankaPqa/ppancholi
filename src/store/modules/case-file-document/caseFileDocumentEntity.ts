import { ActionContext, ActionTree } from 'vuex';
import _cloneDeep from 'lodash/cloneDeep';
import { CaseFileDocumentsService } from '@/services/case-file-documents/entity';
import {
  EOptionLists,
  IOptionItem,
} from '@/entities/optionItem';
import { IOptionItemsService } from '@/services/optionItems';
import { ICaseFileDocumentEntity } from '@/entities/case-file-document';
import { Status } from '@/entities/base';
import { BaseModule, filterAndSortActiveItems } from '../base';
import { IRootState } from '../../store.types';
import { IState } from '../base/base.types';
import { ICaseFileDocumentEntityState } from './caseFileDocumentEntity.types';

export class CaseFileDocumentEntityModule extends BaseModule <ICaseFileDocumentEntity, { id: uuid, caseFileId: uuid }> {
  constructor(readonly service: CaseFileDocumentsService, readonly optionItemService: IOptionItemsService) {
    super(service);
  }

  public getModule = () => ({
    namespaced: true,
    state: this.state,
    getters: this.getters,
    mutations: this.mutations,
    actions: this.actions as unknown as ActionTree<IState<ICaseFileDocumentEntity>, IRootState>,
  })

  public state = {
    ...this.baseState,
    categories: []as IOptionItem[],
    categoriesFetched: false,
  }

  public getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    categories: (state:ICaseFileDocumentEntityState) => (filterOutInactive = true, actualValue?: string[] | string) => filterAndSortActiveItems(state.categories, filterOutInactive, actualValue),

    // eslint-disable-next-line
    getByCaseFile: (state: ICaseFileDocumentEntityState) => (caseFileId: uuid) => _cloneDeep(state.items.filter((x) => x.caseFileId === caseFileId && x.status === Status.Active)),
  }

  public mutations = {
    ...this.baseMutations,

    setCategories(state: ICaseFileDocumentEntityState, payload: Array<IOptionItem>) {
      state.categories = payload;
    },

    setCategoriesFetched(state: ICaseFileDocumentEntityState, payload: boolean) {
      state.categoriesFetched = payload;
    },
  }

  public actions = {
    ...this.baseActions,

    fetchCategories: async (context: ActionContext<ICaseFileDocumentEntityState, ICaseFileDocumentEntityState>): Promise<IOptionItem[]> => {
      if (!context.state.categoriesFetched) {
        const data = await this.optionItemService.getOptionList(EOptionLists.DocumentCategories);
        context.commit('setCategories', data);
        context.commit('setCategoriesFetched', true);
      }
      return context.getters.categories();
    },

    updateDocument: async (context: ActionContext<ICaseFileDocumentEntityState, ICaseFileDocumentEntityState>,
      payload: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity> => {
      const result = await this.service.updateDocument(payload);
      if (result) {
        context.commit('set', result);
      }
      return result;
    },

    downloadDocumentAsUrl: async (context: ActionContext<ICaseFileDocumentEntityState, ICaseFileDocumentEntityState>,
      payload: { item: ICaseFileDocumentEntity, saveDownloadedFile: boolean }): Promise<string> => {
      const result = await this.service.downloadDocumentAsUrl(payload.item, payload.saveDownloadedFile);
      return result;
    },

  }
}
