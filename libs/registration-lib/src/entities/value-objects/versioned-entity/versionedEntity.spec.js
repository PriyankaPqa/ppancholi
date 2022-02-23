import { i18n } from '../../../ui/plugins/i18n';
import { mockBaseEntity } from '../../base/base.mock';

import { VersionedEntityCombined } from '.';
import { mockVersionedEntity } from './versionedEntity.mock';
import { mockMemberMetadata } from '../member';

const mockEntity = mockVersionedEntity();
const mockMetadata = mockVersionedEntity('householdMetadata');

describe('>>> Versioned Entity', () => {
  describe('>> constructor', () => {
    it('should instantiate versionId', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.versionId).toBe(mockEntity.versionId);
    });

    it('should instantiate timestamp', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.timestamp).toBe(mockEntity.timestamp);
    });

    it('should instantiate userName', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.userName).toBe(mockEntity.userName);
    });

    it('should instantiate roleName', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.roleName).toBe(mockEntity.roleName);
    });

    it('should instantiate entityType', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entityType).toBe(mockEntity.entityType);
    });

    it('should instantiate entity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entity).toBe(mockEntity.entity);
    });

    it('should instantiate previousEntity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousEntity).toBe(mockEntity.previousEntity);
    });

    it('should instantiate metadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.metadata).toBe(mockMetadata.entity);
    });

    it('should instantiate previousMetadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousMetadata).toBe(mockMetadata.previousEntity);
    });
  });

  describe('getTemplateData', () => {
    it('calls makeEmptyTemplate for the current entity if entity type is not known', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseEntity(), lastAction: 'foo' } });
      const entity = new VersionedEntityCombined(entityData, mockMetadata);
      entity.makeEmptyTemplate = jest.fn();
      entity.getTemplateData([entity], false, i18n);
      expect(entity.makeEmptyTemplate).toHaveBeenCalled();
    });
  });

  describe('makeEmptyTemplate', () => {
    it('returns the right data', () => {
      const entityData = mockVersionedEntity('householdMember', {
        entityType: 'householdMember',
      });
      const versionedEntity = new VersionedEntityCombined(entityData, mockMemberMetadata());

      expect(versionedEntity.makeEmptyTemplate(entityData.entity)).toEqual([
        { label: '—', value: '' },
      ]);
    });
  });
});
