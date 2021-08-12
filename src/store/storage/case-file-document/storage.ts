import { IStore, IState } from '@/store';
import { ICaseFileDocumentEntity, ICaseFileDocumentMetadata } from '@/entities/case-file-document';
import { IOptionItem } from '@/entities/optionItem';
import { IStorage } from './storage.types';
import { Base } from '../base';

export class CaseFileDocumentStorage
  extends Base<ICaseFileDocumentEntity, ICaseFileDocumentMetadata, { id: uuid, caseFileId: uuid }> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  private getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    categories: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/categories`](filterOutInactive, actualValue),

    getByCaseFile: (caseFileId: uuid) => {
      const entities = this.store.getters[`${this.entityModuleName}/getByCaseFile`](caseFileId) as Array<ICaseFileDocumentEntity>;
      const ids = entities.map((e) => e.id);
      const metadata = this.store.getters[`${this.metadataModuleName}/getByIds`](ids);

      return this.combinedCollections(entities, metadata);
    },
  }

  private actions = {
    ...this.baseActions,

    fetchCategories: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchCategories`),

    // eslint-disable-next-line
    updateDocument: (payload: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity> => this.store.dispatch(`${this.entityModuleName}/updateDocument`, payload),

    // eslint-disable-next-line
    downloadDocumentAsUrl: (item: ICaseFileDocumentEntity, saveDownloadedFile: boolean): Promise<string> => this.store.dispatch(`${this.entityModuleName}/downloadDocumentAsUrl`, { item, saveDownloadedFile }),

  }

  private mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
