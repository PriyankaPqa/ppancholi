import { IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';

export const mockVersionedEntity = (type?: string, force?: Partial<IVersionedEntity>): IVersionedEntity => ({
  versionId: '60983874-18bb-467d-b55a-94dc55818151',
  timestamp: '2021-01-01',
  userName: 'Jane Smith',
  roleName: { translation: { en: 'Admin' } },
  entity: null,
  previousEntity: null,
  ...force,
});

export const mockVersionedEntityCombined = (
  entityType? : string,
  force? : Partial<IVersionedEntityCombined>,
): IVersionedEntityCombined => ({
  versionId: '60983874-18bb-467d-b55a-94dc55818151',
  timestamp: '2021-01-01',
  userName: 'John Smith',
  roleName: { translation: { en: 'Admin' } },
  entityType,
  entity: null,
  previousEntity: null,
  metadata: null,
  previousMetadata: null,
  getTemplateData: jest.fn(),
  getLastActionName: jest.fn(),
  ...force,
});
