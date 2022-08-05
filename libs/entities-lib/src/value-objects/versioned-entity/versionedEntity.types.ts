import VueI18n from 'vue-i18n';
import { IMultilingual } from '@libs/core-lib/src/types';
import { IEntity } from '../../base';

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
