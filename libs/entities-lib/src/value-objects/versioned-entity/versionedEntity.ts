import _cloneDeep from 'lodash/cloneDeep';
import { IMultilingual } from '@libs/shared-lib/types';
import utils from '../../utils';
import { IEntity } from '../../base';
import { IHistoryItemTemplateData, IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';

export class VersionedEntityCombined implements IVersionedEntityCombined {
  versionId: string;

  timestamp: string | Date;

  userName: string;

  roleName: IMultilingual;

  entityType?: string;

  entity: IEntity;

  previousEntity?: IEntity;

  metadata?: IEntity;

  previousMetadata?: IEntity;

  constructor(data: IVersionedEntity, metadata?: IVersionedEntity) {
    this.versionId = data.versionId;
    this.timestamp = data.timestamp;
    this.userName = data.userName;
    this.roleName = utils.initMultilingualAttributes(data.roleName);
    this.entityType = data.entityType;
    this.entity = _cloneDeep(data.entity);
    this.previousEntity = _cloneDeep(data.previousEntity);
    this.metadata = _cloneDeep(metadata?.entity);
    this.previousMetadata = _cloneDeep(metadata?.previousEntity);
  }

  getLastActionName(): string {
    switch (this.entityType) {
      default:
        return '';
    }
  }

  getTemplateData(): IHistoryItemTemplateData[] {
    switch (this.entityType) {
      default:
        return this.makeEmptyTemplate();
    }
  }

  /** Private methods */

  makeEmptyTemplate(): IHistoryItemTemplateData[] {
    return [{ label: '—', value: '' }];
  }
}
