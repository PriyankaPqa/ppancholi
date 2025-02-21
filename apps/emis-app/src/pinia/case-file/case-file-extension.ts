import { BaseStoreComponents } from '@libs/stores-lib/base/base.types';
import _cloneDeep from 'lodash/cloneDeep';
import {
  CaseFileSearchOptimized,
  CaseFileStatus,
  CaseFileTriage, IAssignedTeamMembers,
  ICaseFileEntity,
  ICaseFileLabel,
  IdParams,
  IIdentityAuthentication,
  IImpactStatusValidation,
  SearchOptimizedResults,
} from '@libs/entities-lib/case-file';
import { CaseFilesService, ICaseFilesServiceMock, ICreateCaseFileRequest } from '@libs/services-lib/case-files/entity';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { Ref, ref } from 'vue';
import { filterAndSortActiveItems } from '@libs/stores-lib/base';
import applicationInsights from '@libs/shared-lib/plugins/applicationInsights/applicationInsights';
import { IListOption, ISearchParams } from '@libs/shared-lib/types';
import { IUserAccountEntity } from '@libs/entities-lib/user-account';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';

// eslint-disable-next-line max-lines-per-function
export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ICaseFileEntity, IdParams>,
  entityService: CaseFilesService | ICaseFilesServiceMock,
  optionService: OptionItemsService | IOptionItemsServiceMock,
) {
  const tagsOptions = ref([]) as Ref<IOptionItem[]>;
  const inactiveReasons = ref([]) as Ref<IOptionItem[]>;
  const closeReasons = ref([]) as Ref<IOptionItem[]>;
  const screeningIds = ref([]) as Ref<IOptionItem[]>;
  const tagsOptionsFetched = ref(false);
  const inactiveReasonsFetched = ref(false);
  const closeReasonsFetched = ref(false);
  const screeningIdsFetched = ref(false);
  const recentlyViewedCaseFileIds = ref([]) as Ref<string[]>;
  const searchOptimizedItems = ref([]) as Ref<CaseFileSearchOptimized[]>;

  function getSearchOptimizedByIds(ids: uuid[]): CaseFileSearchOptimized[] {
    if (!ids?.length) {
      return [];
    }
    return ids.map((id) => _cloneDeep(searchOptimizedItems.value.find((e) => e.id === id)));
  }

  function getTagsOptions(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(tagsOptions.value, filterOutInactive, actualValue);
  }

  function getInactiveReasons(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(inactiveReasons.value, filterOutInactive, actualValue);
  }

  function getCloseReasons(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(closeReasons.value, filterOutInactive, actualValue);
  }

  function getScreeningIds(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(screeningIds.value, filterOutInactive, actualValue);
  }

  async function fetchTagsOptions() {
    if (!tagsOptionsFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.CaseFileTags);
      tagsOptions.value = data;
      tagsOptionsFetched.value = true;
    }

    return getTagsOptions();
  }

  async function fetchInactiveReasons() {
    if (!inactiveReasonsFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.CaseFileInactiveReasons);
      inactiveReasons.value = data;
      inactiveReasonsFetched.value = true;
    }
    return getInactiveReasons();
  }

  async function fetchScreeningIds() {
    if (!screeningIdsFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.ScreeningId);
      screeningIds.value = data;
      screeningIdsFetched.value = true;
    }

    return getScreeningIds();
  }

  async function fetchCloseReasons() {
    if (!closeReasonsFetched.value) {
      const data = await optionService.getOptionList(EOptionLists.CaseFileCloseReasons);
      closeReasons.value = data;
      closeReasonsFetched.value = true;
    }

    return getCloseReasons();
  }
  async function fetchCaseFileActivities(id: uuid) {
    return entityService.fetchCaseFileActivities(id);
  }

  async function genericSetAction(
      { id, payload, element }:
        { id: uuid, payload: unknown, element: 'Tags' | 'Status' | 'IsDuplicate' | 'Labels' | 'IdentityAuthentication' | 'Triage' | 'ValidationOfImpact' },
  ) {
    try {
      const res = await (entityService[`setCaseFile${element}`] as any)(id, payload);
      baseComponents.set(res);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { id, payload, element }, 'module.caseFileEntity', 'genericSetAction');
      return null;
    }
  }

  async function setCaseFileTags(id: uuid, tags: IListOption[]) {
    return genericSetAction({ id, payload: tags, element: 'Tags' });
  }

  async function setCaseFileStatus({ id, status, rationale, reason }: { id: uuid; status: CaseFileStatus; rationale: string; reason: IListOption }) {
    return genericSetAction({ id, payload: { status, rationale, reason }, element: 'Status' });
  }

  async function setCaseFileIsDuplicate(id: uuid, isDuplicate: boolean) {
    return genericSetAction({ id, payload: isDuplicate, element: 'IsDuplicate' });
  }

  async function setCaseFileLabels(id: uuid, labels: ICaseFileLabel[]) {
    return genericSetAction({ id, payload: labels, element: 'Labels' });
  }

  async function setCaseFileIdentityAuthentication(id: uuid, identityAuthentication: IIdentityAuthentication) {
    return genericSetAction({ id, payload: identityAuthentication, element: 'IdentityAuthentication' });
  }

  async function setCaseFileTriage(id: uuid, triage: CaseFileTriage) {
    return genericSetAction({ id, payload: triage, element: 'Triage' });
  }

  async function setCaseFileValidationOfImpact(id: uuid, impactStatusValidation: IImpactStatusValidation) {
    return genericSetAction({ id, payload: impactStatusValidation, element: 'ValidationOfImpact' });
  }

  async function createCaseFile(payload: ICreateCaseFileRequest) {
    try {
      const res = await entityService.createCaseFile(payload, false);
      if (res) {
        baseComponents.addNewlyCreatedId(res.caseFile);
        baseComponents.set(res.caseFile);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'createCaseFile');
      return null;
    }
  }

  async function fetchCaseFileAssignedCounts(eventId: uuid, teamId: uuid) {
    try {
      const res = await entityService.getCaseFileAssignedCounts({
        eventId,
        teamId,
      });
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { eventId, teamId }, 'module.caseFileEntity', 'fetchCaseFileAssignedCounts');
      return null;
    }
  }

  async function fetchCaseFileDetailedCounts(eventId: uuid) {
    try {
      const res = await entityService.fetchCaseFileDetailedCounts(eventId);
      return res;
    } catch (e) {
      applicationInsights.trackException(e, { eventId }, 'module.caseFileEntity', 'fetchCaseFileDetailedCounts');
      return null;
    }
  }

  async function assignCaseFile({ id, teamMembers, teams }:{ id: uuid, teamMembers: IAssignedTeamMembers[]; teams: uuid[] }): Promise<IUserAccountEntity> {
    try {
      const res = await entityService.assignCaseFile(id, { teams, teamMembers });
      if (res) {
        baseComponents.set(res);
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'assignCaseFile');
      return null;
    }
  }

  async function searchOptimized(params: ISearchParams, includeCaseFile?: boolean, includeCaseFileAndMetadata?: boolean): Promise<SearchOptimizedResults> {
    const res = await entityService.searchOptimized(params, includeCaseFile, includeCaseFileAndMetadata);
    if (res) {
      res.value.map((r) => r.searchItem).forEach((s) => {
        const index = searchOptimizedItems.value.findIndex((x) => x?.id === s.id);
        if (index > -1) {
          searchOptimizedItems.value[index] = s;
        } else {
          searchOptimizedItems.value.push(s);
        }
      });
      baseComponents.setAll(res.value.map((x) => x.entity).filter((x) => x));
    }
    return res;
  }

  async function fetchRecentlyViewed(): Promise<string[]> {
    try {
      const res = await entityService.getRecentlyViewed();
      if (res) {
        recentlyViewedCaseFileIds.value = res;
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'fetchRecentlyViewed');
      return [];
    }
  }

  async function addRecentlyViewed(id: uuid): Promise<string[]> {
    try {
      const res = await entityService.addRecentlyViewed(id);
      if (res) {
        recentlyViewedCaseFileIds.value = res;
      }
      return res;
    } catch (e) {
      applicationInsights.trackException(e, {}, 'module.caseFileEntity', 'addRecentlyViewed');
      return [];
    }
  }

  return {
    tagsOptions,
    inactiveReasons,
    closeReasons,
    screeningIds,
    tagsOptionsFetched,
    inactiveReasonsFetched,
    closeReasonsFetched,
    screeningIdsFetched,
    recentlyViewedCaseFileIds,
    searchOptimizedItems,
    getTagsOptions,
    getInactiveReasons,
    getCloseReasons,
    getScreeningIds,
    fetchTagsOptions,
    fetchInactiveReasons,
    fetchScreeningIds,
    fetchCloseReasons,
    fetchCaseFileActivities,
    setCaseFileTags,
    setCaseFileStatus,
    setCaseFileIsDuplicate,
    setCaseFileLabels,
    setCaseFileIdentityAuthentication,
    setCaseFileTriage,
    setCaseFileValidationOfImpact,
    createCaseFile,
    fetchCaseFileAssignedCounts,
    fetchCaseFileDetailedCounts,
    assignCaseFile,
    genericSetAction,
    fetchRecentlyViewed,
    addRecentlyViewed,
    searchOptimized,
    getSearchOptimizedByIds,
  };
}
