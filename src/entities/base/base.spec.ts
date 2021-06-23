import { BaseEntity, mockBaseEntity } from './index';

const mock = mockBaseEntity();

describe('>>> Base Entity', () => {
  describe('>> constructor', () => {
    describe('If data is passed', () => {
      it('should instantiate id', () => {
        const entity = new BaseEntity(mock);
        expect(entity.id).toBe(mock.id);
      });

      it('should instantiate tenantId', () => {
        const entity = new BaseEntity(mock);
        expect(entity.tenantId).toBe(mock.tenantId);
      });

      it('should instantiate created', () => {
        const entity = new BaseEntity(mock);
        expect(entity.created).toBe(mock.created);
      });

      it('should instantiate timestamp', () => {
        const entity = new BaseEntity(mock);
        expect(entity.timestamp).toBe(mock.timestamp);
      });

      it('should instantiate status', () => {
        const entity = new BaseEntity(mock);
        expect(entity.status).toBe(mock.status);
      });

      it('should instantiate eTag', () => {
        const entity = new BaseEntity(mock);
        expect(entity.eTag).toBe(mock.eTag);
      });

      it('should instantiate createdBy', () => {
        const entity = new BaseEntity(mock);
        expect(entity.createdBy).toBe(mock.createdBy);
      });

      it('should instantiate lastUpdatedBy', () => {
        const entity = new BaseEntity(mock);
        expect(entity.lastUpdatedBy).toBe(mock.lastUpdatedBy);
      });
    });
    describe('If no data is passed', () => {
      it('should instantiate id', () => {
        const entity = new BaseEntity();
        expect(entity.id).toBe('');
      });

      it('should instantiate tenantId', () => {
        const entity = new BaseEntity();
        expect(entity.tenantId).toBe('');
      });

      it('should instantiate created', () => {
        const entity = new BaseEntity();
        expect(entity.created).toBe('');
      });

      it('should instantiate timestamp', () => {
        const entity = new BaseEntity();
        expect(entity.timestamp).toBe('');
      });

      it('should instantiate status', () => {
        const entity = new BaseEntity();
        expect(entity.status).toBe(null);
      });

      it('should instantiate eTag', () => {
        const entity = new BaseEntity();
        expect(entity.eTag).toBe('');
      });

      it('should instantiate createdBy', () => {
        const entity = new BaseEntity();
        expect(entity.createdBy).toBe('');
      });

      it('should instantiate lastUpdatedBy', () => {
        const entity = new BaseEntity();
        expect(entity.lastUpdatedBy).toBe('');
      });
    });
  });
});
