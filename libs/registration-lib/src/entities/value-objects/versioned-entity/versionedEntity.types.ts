import VueI18n from 'vue-i18n';
import { IEntity } from '@libs/core-lib/entities/base';
import { IMultilingual } from '../../../types';

export interface IVersionedEntity {
  versionId: uuid;
  timestamp: string |Date;
  userName: string;
  roleName: IMultilingual;
  entityType?: string;
  entity: IEntity ;
  previousEntity?: IEntity ;
}

export interface IVersionedEntityCombined {
  versionId: uuid;
  timestamp: string |Date;
  userName: string;
  roleName: IMultilingual;
  entityType?: string;
  entity: IEntity;
  previousEntity?: IEntity;
  metadata?: IEntity;
  previousMetadata?: IEntity;

  getLastActionName? (): string;
  getTemplateData?(historyItems: IVersionedEntityCombined[], isPreviousValue: boolean, i18n: VueI18n): {label: string; value: unknown}[];
}

export interface IHistoryItemTemplateData {
  label: string;
  value: unknown;
}
