import { FeatureEntity } from './feature';
import { mockFeatureEntityData } from './feature.mock';

const mock = mockFeatureEntityData();

describe('>>> FeatureEntity', () => {
  describe('>> constructor', () => {
    describe('if data is passed', () => {
      it('should instantiate name', () => {
        const entity = new FeatureEntity(mock);
        expect(entity.name).toBe(mock.name);
      });

      it('should instantiate description', () => {
        const entity = new FeatureEntity(mock);
        expect(entity.description).toBe(mock.description);
      });

      it('should instantiate enabled', () => {
        const entity = new FeatureEntity(mock);
        expect(entity.enabled).toBe(mock.enabled);
      });
    });
  });
});
