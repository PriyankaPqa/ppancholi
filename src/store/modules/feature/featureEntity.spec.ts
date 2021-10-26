import { httpClient } from '@/services/httpClient';
import { FeatureEntityModule } from './featureEntity';
import { FeaturesService } from '@/services/features/entity';
import { mockFeatureEntity } from '@/entities/feature';

const service = new FeaturesService(httpClient);
let module: FeatureEntityModule;

describe('>>> Feature entity module', () => {
  beforeEach(() => {
    module = new FeatureEntityModule(service);
  });

  describe('>> Getters', () => {
    describe('feature', () => {
      it('finds the correct feature', () => {
        const feature = mockFeatureEntity();

        module.state.items = [feature];

        expect(module.getters.feature(module.state)(feature.name)).toEqual(feature);

        expect(module.getters.feature(module.state)('nothing')).toEqual(undefined);
      });
    });
  });
});
