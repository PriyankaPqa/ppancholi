import { Status } from '@libs/shared-lib/types';

export interface IEntity {
  id: uuid;
  tenantId: uuid;
  created: Date | string;
  createdBy: uuid;
  lastUpdatedBy: uuid;
  timestamp: Date | string;
  status: Status;
  lastAction: string;
  lastActionCorrelationId: uuid;
  pinned?: boolean;
}

export interface IEntityCombined <TEntity extends IEntity, TMetadata extends IEntity> {
  entity: TEntity,
  metadata: TMetadata,
  pinned?: boolean;
}
