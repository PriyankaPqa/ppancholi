import { BaseEntity, mockBaseData } from './index';
import { Status } from './base.types';

const mock = mockBaseData();

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

      it('should instantiate lastAction', () => {
        const entity = new BaseEntity(mock);
        expect(entity.lastAction).toBe(mock.lastAction);
      });

      it('should instantiate lastActionCorrelationId', () => {
        const entity = new BaseEntity(mock);
        expect(entity.lastActionCorrelationId).toBe(mock.lastActionCorrelationId);
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
        expect(entity.status).toBe(Status.Inactive);
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
      it('should instantiate lastAction', () => {
        const entity = new BaseEntity();
        expect(entity.lastAction).toBe('');
      });

      it('should instantiate lastActionCorrelationId', () => {
        const entity = new BaseEntity();
        expect(entity.lastActionCorrelationId).toBe('');
      });
    });
  });
});
