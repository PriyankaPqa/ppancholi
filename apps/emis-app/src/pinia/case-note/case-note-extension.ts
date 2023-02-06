import { BaseStoreComponents, filterAndSortActiveItems } from '@libs/stores-lib/base';
import { IOptionItemsServiceMock, OptionItemsService } from '@libs/services-lib/optionItems';
import { EOptionLists, IOptionItem } from '@libs/entities-lib/optionItem';
import { ref, Ref } from 'vue';
import { ICaseNoteEntity, IdParams } from '@libs/entities-lib/case-note';
import { CaseNotesService, ICaseNotesServiceMock } from '@libs/services-lib/case-notes/entity';

export function getExtensionComponents(
  baseComponents: BaseStoreComponents<ICaseNoteEntity, IdParams>,
  service: CaseNotesService | ICaseNotesServiceMock,
  optionItemService: OptionItemsService | IOptionItemsServiceMock,
) {
  const caseNoteCategories = ref([]) as Ref<IOptionItem[]>;
  const isSavingCaseNote = ref(false);
  const caseNoteCategoriesFetched = ref(false);

  function getCaseNoteCategories(filterOutInactive = true, actualValue?: string[] | string) {
    return filterAndSortActiveItems(caseNoteCategories.value, filterOutInactive, actualValue);
  }

  async function fetchCaseNoteCategories(): Promise<IOptionItem[]> {
    if (!caseNoteCategoriesFetched.value) {
      const results = await optionItemService.getOptionList(EOptionLists.CaseNoteCategories);
      const categories = results ?? [];
      caseNoteCategories.value = categories;
      caseNoteCategoriesFetched.value = true;
    }
    return caseNoteCategories.value;
  }

  async function addCaseNote(payload: { id: uuid; caseNote: ICaseNoteEntity }) : Promise<ICaseNoteEntity> {
    isSavingCaseNote.value = true;
    const result = await service.addCaseNote(payload.id, payload.caseNote);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    isSavingCaseNote.value = false;
    return result;
  }

  async function pinCaseNote(payload: { caseFileId: uuid; caseNoteId: uuid, isPinned: boolean }): Promise<ICaseNoteEntity> {
    isSavingCaseNote.value = true;
    const result = await service.pinCaseNote(payload.caseFileId, payload.caseNoteId, payload.isPinned);
    if (result) {
      baseComponents.set(result);
    }
    isSavingCaseNote.value = false;
    return result;
  }

  async function editCaseNote(payload: { caseFileId: uuid; caseNoteId: uuid, caseNote: ICaseNoteEntity }): Promise<ICaseNoteEntity> {
    isSavingCaseNote.value = true;
    const result = await service.editCaseNote(payload.caseFileId, payload.caseNoteId, payload.caseNote);
    if (result) {
      baseComponents.set(result);
    }
    isSavingCaseNote.value = false;
    return result;
  }

  return {
    caseNoteCategories,
    isSavingCaseNote,
    caseNoteCategoriesFetched,
    getCaseNoteCategories,
    fetchCaseNoteCategories,
    addCaseNote,
    pinCaseNote,
    editCaseNote,
  };
}
