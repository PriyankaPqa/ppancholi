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

  function setCaseNoteCategories(payload: Array<IOptionItem>) {
    caseNoteCategories.value = payload;
  }

  function setCaseNoteCategoriesFetched(payload: boolean) {
    caseNoteCategoriesFetched.value = payload;
  }

  function setIsSavingCaseNote(payload: boolean) {
    isSavingCaseNote.value = payload;
  }

  async function fetchCaseNoteCategories(): Promise<IOptionItem[]> {
    if (!caseNoteCategoriesFetched.value) {
      const results = await optionItemService.getOptionList(EOptionLists.CaseNoteCategories);
      const categories = results ?? [];
      setCaseNoteCategories(categories);
      setCaseNoteCategoriesFetched(true);
    }
    return caseNoteCategories.value;
  }

  async function addCaseNote(payload: { id: uuid; caseNote: ICaseNoteEntity }) : Promise<ICaseNoteEntity> {
    setIsSavingCaseNote(true);
    const result = await service.addCaseNote(payload.id, payload.caseNote);
    if (result) {
      baseComponents.addNewlyCreatedId(result);
      baseComponents.set(result);
    }
    setIsSavingCaseNote(false);
    return result;
  }

  async function pinCaseNote(payload: { caseFileId: uuid; caseNoteId: uuid, isPinned: boolean }): Promise<ICaseNoteEntity> {
    setIsSavingCaseNote(true);
    const result = await service.pinCaseNote(payload.caseFileId, payload.caseNoteId, payload.isPinned);
    if (result) {
      baseComponents.set(result);
    }
    setIsSavingCaseNote(false);
    return result;
  }

  async function editCaseNote(payload: { caseFileId: uuid; caseNoteId: uuid, caseNote: ICaseNoteEntity }): Promise<ICaseNoteEntity> {
    setIsSavingCaseNote(true);
    const result = await service.editCaseNote(payload.caseFileId, payload.caseNoteId, payload.caseNote);
    if (result) {
      baseComponents.set(result);
    }
    setIsSavingCaseNote(false);
    return result;
  }

  return {
    caseNoteCategories,
    isSavingCaseNote,
    caseNoteCategoriesFetched,
    getCaseNoteCategories,
    setCaseNoteCategories,
    setCaseNoteCategoriesFetched,
    setIsSavingCaseNote,
    fetchCaseNoteCategories,
    addCaseNote,
    pinCaseNote,
    editCaseNote,
  };
}
