import { mockCaseFileIndividualEntities, mockCaseFileIndividualEntity } from '@libs/entities-lib/case-file-individual';
import { mockDomainBaseService } from '../base';
import { ICaseFileIndividualsServiceMock } from './case-file-individuals.types';

export const mockCaseFileIndividualsService = (): ICaseFileIndividualsServiceMock => ({
  ...mockDomainBaseService(mockCaseFileIndividualEntities()),
  createCaseFileIndividual: jest.fn(() => mockCaseFileIndividualEntity()),
  addReceiveAssistanceDetails: jest.fn(() => mockCaseFileIndividualEntity()),
  addTemporaryAddress: jest.fn(() => mockCaseFileIndividualEntity()),
  editTemporaryAddress: jest.fn(() => mockCaseFileIndividualEntity()),
});
