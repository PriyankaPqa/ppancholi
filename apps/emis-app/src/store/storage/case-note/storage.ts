import { IStorage } from '@/store/storage/case-note/storage.types';
import { IOptionItem } from '@libs/entities-lib/optionItem';
import { ICaseNoteEntity, ICaseNoteMetadata } from '@libs/entities-lib/case-note';
import { ICombinedIndex, IAzureCombinedSearchResult, IAzureSearchParams } from '@libs/core-lib/types';
import { IStore, IState } from '../../store.types';

import { Base } from '../base';

export class CaseNoteStorage
  extends Base<ICaseNoteEntity, ICaseNoteMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    caseNoteCategories: (filterOutInactive = true, actualValue?: string[] | string)
    : Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/caseNoteCategories`](filterOutInactive, actualValue),

  }

  private actions = {
    ...this.baseActions,

    fetchCaseNoteCategories: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchCaseNoteCategories`),

    addCaseNote: (id: uuid, caseNote: ICaseNoteEntity):
    Promise<ICaseNoteEntity> => this.store.dispatch(`${this.entityModuleName}/addCaseNote`, { id, caseNote }),

    pinCaseNote: (caseFileId: uuid, caseNoteId: uuid, isPinned: boolean):
    Promise<ICaseNoteEntity> => this.store.dispatch(`${this.entityModuleName}/pinCaseNote`, { caseFileId, caseNoteId, isPinned }),

    editCaseNote: (caseFileId: uuid, caseNoteId: uuid, caseNote: ICaseNoteEntity):
    Promise<ICaseNoteEntity> => this.store.dispatch(`${this.entityModuleName}/editCaseNote`, { caseFileId, caseNoteId, caseNote }),

    searchCaseNotes: async (params: IAzureSearchParams, searchEndpoint: string):
    Promise<IAzureCombinedSearchResult<ICaseNoteEntity, ICaseNoteMetadata>> => {
      try {
        this.store.commit(`${this.entityModuleName}/setSearchLoading`, true);

        const res = await this.store.dispatch(`${this.entityModuleName}/search`,
          { params, searchEndpoint });

        const data = res?.value;
        if (data) {
          const value = data.map((res: ICombinedIndex<ICaseNoteEntity, ICaseNoteMetadata>) => {
            const entity = { ...res.entity };
            const metadata = { ...res.metadata };

            return { entity, metadata };
          });

          return {
            ...res,
            value,
          };
        }
        return null;
      } finally {
        this.store.commit(`${this.entityModuleName}/setSearchLoading`, false);
      }
    },

  }

  private mutations = {
    ...this.baseMutations,

    setCaseNoteCategoriesFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setCaseNoteCategoriesFetched`, payload),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
