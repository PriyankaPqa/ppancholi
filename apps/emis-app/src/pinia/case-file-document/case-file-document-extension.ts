import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { ICaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';
import { ICaseFileDocumentsService, ICaseFileDocumentsServiceMock } from '@libs/services-lib/case-file-documents/entity';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { ref, Ref } from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { Status } from '@libs/shared-lib/types';
import { BaseStoreComponents, filterAndSortActiveItems } from '@libs/stores-lib/base';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ICaseFileDocumentEntity, { id: uuid, caseFileId: uuid }>,
  entityService: ICaseFileDocumentsService | ICaseFileDocumentsServiceMock,
  optionsService: OptionItemsService | IOptionItemsServiceMock,
) {
  const categories = ref([]) as Ref<IOptionItem[]>;
  const categoriesFetched = ref(false);

  function getCategories(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(categories.value, filterOutInactive, actualValue);
  }

  function getByCaseFile(caseFileId: uuid) {
    return _cloneDeep(baseComponents.items.value.filter((x) => x.caseFileId === caseFileId && x.status === Status.Active));
  }

  async function fetchCategories(): Promise<IOptionItem[]> {
    if (!categoriesFetched.value) {
      const data = await optionsService.getOptionList(EOptionLists.DocumentCategories);
      categories.value = data;
      categoriesFetched.value = true;
    }
    return getCategories();
  }

  async function updateDocument(payload: ICaseFileDocumentEntity): Promise<ICaseFileDocumentEntity> {
    const result = await entityService.updateDocument(payload);
    if (result) {
      baseComponents.set(result);
    }
    return result;
  }

  async function downloadDocumentAsUrl(payload: { item: ICaseFileDocumentEntity, saveDownloadedFile: boolean }): Promise<string> {
    const result = await entityService.downloadDocumentAsUrl(payload.item, payload.saveDownloadedFile);
    return result;
  }

  return {
    categories,
    categoriesFetched,
    getCategories,
    getByCaseFile,
    fetchCategories,
    updateDocument,
    downloadDocumentAsUrl,
  };
}
