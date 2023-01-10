import { ref } from 'vue';
import { mockOptionItemData } from '@libs/entities-lib/optionItem';
import { ICaseFileDocumentEntity, mockCaseFileDocumentEntity } from '@libs/entities-lib/case-file-document';

export function getMockExtensionComponents() {
  return {
    categories: ref([]),
    categoriesFetched: ref([]),
    getCategories: jest.fn(() => mockOptionItemData()),
    getByCaseFile: jest.fn(() => mockCaseFileDocumentEntity()),
    fetchCategories: jest.fn(() => mockOptionItemData()),
    updateDocument: jest.fn((payload: ICaseFileDocumentEntity) => payload),
    downloadDocumentAsUrl: jest.fn(() => 'fake url'),
  };
}
