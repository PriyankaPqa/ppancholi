export enum Status {
  Active = 1,
  Inactive = 2
}

export interface IEntity {
  id: uuid;
  tenantId: uuid;
  created: Date | string;
  createdBy: uuid;
  lastUpdatedBy: uuid;
  timestamp: Date | string;
  status: Status;
  eTag: string;
}

export interface IEntityCombined <TEntity extends IEntity, TMetadata extends IEntity> {
  entity: TEntity,
  metadata: TMetadata,
}
