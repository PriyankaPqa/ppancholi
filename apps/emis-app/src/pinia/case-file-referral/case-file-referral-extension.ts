import { BaseStoreComponents } from '@libs/stores-lib/base';
import { CaseFileReferralsService, ICaseFileReferralsServiceMock } from '@libs/services-lib/case-file-referrals/entity';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { ref, Ref } from 'vue';
import { filterAndSortActiveItems } from '@/store/modules/base';
import _cloneDeep from 'lodash/cloneDeep';
import { Status } from '@libs/entities-lib/base';
import { ICaseFileReferralEntity, IdParams } from '@libs/entities-lib/case-file-referral';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ICaseFileReferralEntity, IdParams>,
  service: CaseFileReferralsService | ICaseFileReferralsServiceMock,
  optionItemService: OptionItemsService | IOptionItemsServiceMock,
) {
  const types = ref([]) as Ref<IOptionItem[]>;
  const outcomeStatuses = ref([]) as Ref<IOptionItem[]>;
  const typesFetched = ref(false);
  const outcomeStatusesFetched = ref(false);

  function getAllTypes(filterOutInactive = true, actualValue?: string[] | string) {
 return filterAndSortActiveItems(types.value, filterOutInactive, actualValue);
}

  function getAllOutcomeStatuses(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(outcomeStatuses.value, filterOutInactive, actualValue);
  }

  function getByCaseFile(caseFileId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.caseFileId === caseFileId && x.status === Status.Active));
  }

  async function fetchTypes(): Promise<IOptionItem[]> {
    if (!typesFetched.value) {
      const data = await optionItemService.getOptionList(EOptionLists.ReferralTypes);
      types.value = data;
      typesFetched.value = true;
    }
    return getAllTypes();
  }

  async function fetchOutcomeStatuses(): Promise<IOptionItem[]> {
    if (!outcomeStatusesFetched.value) {
      const data = await optionItemService.getOptionList(EOptionLists.ReferralOutcomeStatus);
      outcomeStatuses.value = data;
      outcomeStatusesFetched.value = true;
    }
    return getAllOutcomeStatuses();
  }

  async function createReferral(payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> {
    const result = await service.createReferral(payload);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    return result;
  }

  async function updateReferral(payload: ICaseFileReferralEntity): Promise<ICaseFileReferralEntity> {
    const result = await service.updateReferral(payload);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  return {
    types,
    outcomeStatuses,
    typesFetched,
    outcomeStatusesFetched,
    getAllTypes,
    getAllOutcomeStatuses,
    getByCaseFile,
    fetchTypes,
    fetchOutcomeStatuses,
    createReferral,
    updateReferral,
  };
}
