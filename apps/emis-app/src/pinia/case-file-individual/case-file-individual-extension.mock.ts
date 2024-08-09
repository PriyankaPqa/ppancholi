import { CaseFileIndividualEntity, mockCaseFileIndividualEntities, mockCaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';

export function getMockCaseFileIndividualExtensionComponents() {
  return {
    createIndividual: jest.fn((payload: CaseFileIndividualEntity) => payload),
    updateIndividual: jest.fn((payload: CaseFileIndividualEntity) => payload),
    getByCaseFile: jest.fn(() => mockCaseFileIndividualEntities()),
    addTemporaryAddress: jest.fn(() => mockCaseFileIndividualEntity()),
    addReceiveAssistanceDetails: jest.fn(() => mockCaseFileIndividualEntity()),
  };
}
