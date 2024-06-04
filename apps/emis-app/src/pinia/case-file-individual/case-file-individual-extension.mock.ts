import { CaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';

export function getMockCaseFileIndividualExtensionComponents() {
  return {
    createIndividual: jest.fn((payload: CaseFileIndividualEntity) => payload),
    updateIndividual: jest.fn((payload: CaseFileIndividualEntity) => payload),
  };
}
