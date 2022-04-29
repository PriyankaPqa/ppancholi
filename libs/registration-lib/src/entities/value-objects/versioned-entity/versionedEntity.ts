import { IEntity } from '@libs/core-lib/entities/base';
import { IHistoryItemTemplateData, IVersionedEntity, IVersionedEntityCombined } from './versionedEntity.types';
import { IMultilingual } from '../../../types';

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
    this.roleName = data.roleName;
    this.entityType = data.entityType;
    this.entity = data.entity;
    this.previousEntity = data.previousEntity;
    this.metadata = metadata?.entity;
    this.previousMetadata = metadata?.previousEntity;
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
