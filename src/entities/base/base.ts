import { IEntity, Status } from './base.types';

export class BaseEntity implements IEntity {
  id: uuid;

  tenantId: uuid;

  created: Date | string;

  timestamp: Date | string;

  status: Status;

  eTag: string;

  createdBy: uuid;

  lastUpdatedBy: uuid;

  constructor(data?: IEntity) {
    this.id = data?.id ?? '';
    this.tenantId = data?.tenantId ?? '';
    this.created = data?.created ?? '';
    this.timestamp = data?.timestamp ?? '';
    this.status = data?.status ?? null;
    this.eTag = data?.eTag ?? '';
    this.createdBy = data?.createdBy ?? '';
    this.lastUpdatedBy = data?.lastUpdatedBy ?? '';
  }
}
