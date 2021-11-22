import { ActionContext } from 'vuex';
import { httpClient } from '@/services/httpClient';
import { FeatureEntityModule } from './featureEntity';
import { FeaturesService } from '@/services/features/entity';
import { mockFeatureEntity } from '@/entities/feature';
import { IFeatureEntityState } from './featureEntity.types';

const service = new FeaturesService(httpClient);
let module: FeatureEntityModule;

const actionContext = {
  commit: jest.fn(),
  dispatch: jest.fn(),
  state: {} as IFeatureEntityState,
  getters: {},
  rootState: null,
  rootGetters: {},
} as ActionContext<IFeatureEntityState, IFeatureEntityState>;

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

  describe('>> Actions', () => {
    describe('enableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        module.service.enableFeature = jest.fn(() => Promise.resolve(mockFeatureEntity()));

        await module.actions.enableFeature(actionContext, featureId);

        expect(module.service.enableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        module.service.enableFeature = jest.fn(() => Promise.resolve(mockFeatureEntity()));

        await module.actions.enableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('set', mockFeatureEntity());
      });
    });

    describe('disableFeature', () => {
      it('calls the service', async () => {
        const featureId = 'id';

        module.service.disableFeature = jest.fn(() => Promise.resolve(mockFeatureEntity()));

        await module.actions.disableFeature(actionContext, featureId);

        expect(module.service.disableFeature).toHaveBeenCalledWith(featureId);
      });

      it('updates the entity', async () => {
        const featureId = 'id';

        module.service.disableFeature = jest.fn(() => Promise.resolve(mockFeatureEntity()));

        await module.actions.disableFeature(actionContext, featureId);

        expect(actionContext.commit).toBeCalledWith('set', mockFeatureEntity());
      });
    });
  });
});
