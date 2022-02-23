import {
  CaseFileStatus, ICaseFileEntity, CaseFileTriage, ICaseFileActivity, ICaseFileLabel, ICaseFileMetadata, IIdentityAuthentication,
  IImpactStatusValidation,
  ICaseFileDetailedCount,
  ICaseFileCount,
  ICaseFileCombined,
} from '@/entities/case-file/case-file.types';
import { IStore, IState } from '@/store';
import { IStorage } from '@/store/storage/case-file/storage.types';
import { IOptionItem } from '@/entities/optionItem';
import { IListOption } from '@/types';

import { ICreateCaseFileRequest } from '@/services/case-files/entity';
import { EEventStatus } from '@/entities/event';
import { Base } from '../base';

export class CaseFileStorage
  extends Base<ICaseFileEntity, ICaseFileMetadata, uuid> implements IStorage {
  constructor(readonly pStore: IStore<IState>, readonly pEntityModuleName: string, readonly pMetadataModuleName: string) {
    super(pStore, pEntityModuleName, pMetadataModuleName);
  }

  protected combinedCollections(entities: Array<ICaseFileEntity>, metadata: Array<ICaseFileMetadata>,
    pinnedIds: Array<string> = []): Array<ICaseFileCombined> {
    const result = super.combinedCollections(entities, metadata, pinnedIds) as Array<ICaseFileCombined>;
    if (result) {
      result.forEach((e) => {
        e.readonly = e.entity?.caseFileStatus !== CaseFileStatus.Open
          || +e.metadata?.event?.status !== +EEventStatus.Open;
      });
    }
    return result;
  }

  private getters = {
    ...this.baseGetters,

    // eslint-disable-next-line
    tagsOptions: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/tagsOptions`](filterOutInactive, actualValue),

    // eslint-disable-next-line
    inactiveReasons: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/inactiveReasons`](filterOutInactive, actualValue),

    // eslint-disable-next-line
    screeningIds: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/screeningIds`](filterOutInactive, actualValue),

    // eslint-disable-next-line
    closeReasons: (filterOutInactive = true, actualValue?: string[] | string): Array<IOptionItem> => this.store.getters[`${this.entityModuleName}/closeReasons`](filterOutInactive, actualValue),
  }

  private actions = {
    ...this.baseActions,

    fetchTagsOptions: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchTagsOptions`),

    fetchInactiveReasons: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchInactiveReasons`),

    fetchScreeningIds: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchScreeningIds`),

    fetchCloseReasons: (): Promise<IOptionItem[]> => this.store.dispatch(`${this.entityModuleName}/fetchCloseReasons`),

    fetchCaseFileActivities: (id: uuid): Promise<ICaseFileActivity[]> => this.store.dispatch(`${this.entityModuleName}/fetchCaseFileActivities`, id),

    fetchCaseFileAssignedCounts: (eventId: uuid, teamId: uuid):
      Promise<ICaseFileCount> => this.store.dispatch(`${this.entityModuleName}/fetchCaseFileAssignedCounts`, { eventId, teamId }),

    fetchCaseFileDetailedCounts: (eventId: uuid):
      Promise<ICaseFileDetailedCount> => this.store.dispatch(`${this.entityModuleName}/fetchCaseFileDetailedCounts`, eventId),

    setCaseFileTags: (id: uuid, tags: IListOption[]):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileTags`, { id, tags }),

    setCaseFileStatus: (id: uuid, status: CaseFileStatus, rationale?: string, reason?: IListOption):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileStatus`,
      {
        id,
        status,
        rationale,
        reason,
      }),

    setCaseFileLabels: (id: uuid, labels: ICaseFileLabel[]):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileLabels`, { id, labels }),

    setCaseFileIsDuplicate: (id: uuid, isDuplicate: boolean):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileIsDuplicate`, { id, isDuplicate }),

    setCaseFileIdentityAuthentication: (id: uuid, identityAuthentication: IIdentityAuthentication):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileIdentityAuthentication`, { id, identityAuthentication }),

    setCaseFileTriage: (id: uuid, triage: CaseFileTriage):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileTriage`, { id, triage }),

    setCaseFileValidationOfImpact: (id: uuid, impactStatusValidation: IImpactStatusValidation):
    Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileValidationOfImpact`, { id, impactStatusValidation }),

    setCaseFileAssign: (id: uuid, individuals: uuid[], teams: uuid[]):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/setCaseFileAssign`, { id, individuals, teams }),

    createCaseFile: (payload: ICreateCaseFileRequest):
      Promise<ICaseFileEntity> => this.store.dispatch(`${this.entityModuleName}/createCaseFile`, payload),
  }

  private mutations = {
    ...this.baseMutations,

    setTagsOptionsFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setTagsOptionsFetched`, payload),

    setInactiveReasonsFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setInactiveReasonsFetched`, payload),

    setScreeningIdsFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setScreeningIdsFetched`, payload),

    setCloseReasonsFetched: (payload: boolean) => this.store.commit(`${this.entityModuleName}/setCloseReasonsFetched`, payload),
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
