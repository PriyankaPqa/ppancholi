import { Status } from '@libs/shared-lib/types';
import { IEntity } from './base.types';

export class BaseEntity implements IEntity {
  id: uuid;

  tenantId: uuid;

  created: Date | string;

  timestamp: Date | string;

  status: Status;

  createdBy: uuid;

  lastUpdatedBy: uuid;

  lastAction: string;

  lastActionCorrelationId: uuid;

  constructor(data?: IEntity) {
    this.id = data?.id ?? '';
    this.tenantId = data?.tenantId ?? '';
    this.created = data?.created ?? '';
    this.timestamp = data?.timestamp ?? '';
    this.status = data?.status ?? Status.Inactive;
    this.createdBy = data?.createdBy ?? '';
    this.lastUpdatedBy = data?.lastUpdatedBy ?? '';
    this.lastAction = data?.lastAction ?? '';
    this.lastActionCorrelationId = data?.lastActionCorrelationId ?? '';
  }
}
