import { IDomainBaseService } from '@/services/base';
import { IMassActionEntity } from '@/entities/mass-action/massActions.types';

export interface IMassActionService extends IDomainBaseService<IMassActionEntity, uuid> {

}

export interface IMassActionServiceMock {

}
