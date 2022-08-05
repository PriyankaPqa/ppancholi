import { mockBaseData } from '../../base';
import { VersionedEntityCombined } from './index';
import { mockVersionedEntity } from './versionedEntity.mock';
import { mockMemberMetadata } from '../member';

const mockEntity = mockVersionedEntity();
const mockMetadata = mockVersionedEntity('householdMetadata');

const i18n = {
  t: jest.fn((p) => p),
};

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
      expect(entity.roleName).toEqual(mockEntity.roleName);
    });

    it('should instantiate entityType', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entityType).toBe(mockEntity.entityType);
    });

    it('should instantiate entity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.entity).toEqual(mockEntity.entity);
    });

    it('should instantiate previousEntity', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousEntity).toEqual(mockEntity.previousEntity);
    });

    it('should instantiate metadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.metadata).toEqual(mockMetadata.entity);
    });

    it('should instantiate previousMetadata', () => {
      const entity = new VersionedEntityCombined(mockEntity, mockMetadata);
      expect(entity.previousMetadata).toEqual(mockMetadata.previousEntity);
    });
  });

  describe('getTemplateData', () => {
    it('calls makeEmptyTemplate for the current entity if entity type is not known', () => {
      const entityData = mockVersionedEntity('household', { entityType: 'household', entity: { ...mockBaseData(), lastAction: 'foo' } });
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
