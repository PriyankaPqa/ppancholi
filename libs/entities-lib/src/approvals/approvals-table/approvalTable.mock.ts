import { mockBaseApprovalData } from '../approvals-base';
import { IApprovalTableCombined, IApprovalTableEntity, IApprovalTableEntityData } from './approvalTable.types';
import { ApprovalTableEntity } from './approvalTable';
import { IEntity, mockBaseData } from '../../base';

export const mockApprovalTableData = (force? : Partial<IApprovalTableEntityData>): IApprovalTableEntityData => ({
  ...mockBaseApprovalData(force),
  eventId: '',
  programId: '',
  ...force,
});

export const mockApprovalTablesData = () => ([
  mockApprovalTableData(),
  mockApprovalTableData(),
]);

export const mockApprovalTableEntity = (force = mockApprovalTableData()): IApprovalTableEntity => new ApprovalTableEntity(force);

export const mockApprovalTableEntities = () => [
  mockApprovalTableEntity(),
  mockApprovalTableEntity(),
];

export const mockApprovalTableMetadata = () => ({
  ...mockBaseData(),
  programId: '1',
  programName: { translation: { en: 'Prog A en', fr: 'Prog A fr' } },
  approvalTableStatusName: { translation: { en: 'Active', fr: 'Actif' } },
});

export const mockApprovalTableMetadatum = () => [
  mockApprovalTableMetadata(),
  mockApprovalTableMetadata(),
];

export const mockCombinedApprovalTable = (force?: Partial<IEntity>): IApprovalTableCombined => ({
  entity: new ApprovalTableEntity(mockApprovalTableData(force)),
  metadata: mockApprovalTableMetadata(),
});

export const mockCombinedApprovalsTables = (): IApprovalTableCombined[] => [
  mockCombinedApprovalTable(),
  mockCombinedApprovalTable(),
];
