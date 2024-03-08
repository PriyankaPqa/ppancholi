import { IMemberEntity } from '@libs/entities-lib/value-objects/member';
import { IDomainBaseService, IDomainBaseServiceMock } from '../../base';

export interface IPersonsService extends IDomainBaseService<IMemberEntity, uuid> {
}

export interface IPersonsServiceMock extends IDomainBaseServiceMock<IMemberEntity> {
}
