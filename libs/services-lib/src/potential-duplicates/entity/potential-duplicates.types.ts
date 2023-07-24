import { IPotentialDuplicateEntity, IDuplicateHousehold, DuplicateReason } from '@libs/entities-lib/potential-duplicate';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IPotentialDuplicatesService extends IDomainBaseService<IPotentialDuplicateEntity, uuid> {
  getHouseholds(id: uuid): Promise<IDuplicateHousehold[]>;
  getDuplicates(id: uuid): Promise<IPotentialDuplicateEntity[]>;
  flagNewDuplicate(payload: { householdIds: uuid[], duplicateReasons: DuplicateReason[], memberFirstName: string, memberLastName: string, rationale: string })
  : Promise<IPotentialDuplicateEntity>;
  flagDuplicate(id: string, rationale: string): Promise<IPotentialDuplicateEntity>;
  resolveDuplicate(id: string, rationale: string): Promise<IPotentialDuplicateEntity>;
}

export interface IPotentialDuplicatesServiceMock extends IDomainBaseServiceMock<IPotentialDuplicateEntity> {
  getHouseholds: jest.Mock<IDuplicateHousehold[]>;
  getDuplicates: jest.Mock<IPotentialDuplicateEntity[]>;
  flagNewDuplicate: jest.Mock<IPotentialDuplicateEntity>;
  flagDuplicate: jest.Mock<IPotentialDuplicateEntity>;
  resolveDuplicate: jest.Mock<IPotentialDuplicateEntity>;
}
