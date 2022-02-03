import { IEntity, Status } from './base.types';

export const mockBaseEntity = (force?: Partial<IEntity>): IEntity => ({
  id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  tenantId: 'b70bbe71-0683-4a18-bc3e-c9747aafcea3',
  created: '2021-04-06 06:39:04',
  timestamp: '2021-04-06 06:39:04',
  status: Status.Active,
  eTag: 'd421da48-18c8-40ea-8fa3-5a818990ee73',
  createdBy: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  lastUpdatedBy: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  lastAction: 'Create',
  lastActionCorrelationId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  ...force,
});

export const mockBaseEntities = (): IEntity[] => [mockBaseEntity({ id: '1' }), mockBaseEntity({ id: '2' })];
// eslint-disable-next-line
export const mockBaseMetadata = (force?: any) => ({
  ...mockBaseEntity(),
  propA: 'propA',
  ...force,
});

export const mockBaseMetadatum = () => [mockBaseMetadata({ id: '1' }), mockBaseMetadata({ id: '2' })];

export const mockBaseData = (force?: Partial<IEntity>): IEntity => ({
  id: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  tenantId: 'b70bbe71-0683-4a18-bc3e-c9747aafcea3',
  created: '2021-04-06 06:39:04',
  timestamp: '2021-04-06 06:39:04',
  status: Status.Active,
  eTag: 'd421da48-18c8-40ea-8fa3-5a818990ee73',
  createdBy: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  lastUpdatedBy: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  lastAction: 'Created',
  lastActionCorrelationId: '1dea3c36-d6a5-4e6c-ac36-078677b7da5f',
  ...force,
});
