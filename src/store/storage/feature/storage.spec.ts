import { mockStore } from '@/store';
import { FeatureStorage } from './storage';
import { FEATURE_ENTITIES } from '@/constants/vuex-modules';
import { mockFeatureEntity } from '@/entities/feature';

const entityModuleName = FEATURE_ENTITIES;

const store = mockStore(
  {
    modules: {
      [entityModuleName]: {
        state: {},
      },
    },
  },
  { commit: true, dispatch: true },
);

const storage = new FeatureStorage(store, entityModuleName).make();

describe('>>> Feature Storage', () => {
  describe('>> Getters', () => {
    it('should proxy feature', () => {
      const feature = mockFeatureEntity();

      const storageGetter = storage.getters.feature(feature.name);
      const storeGetter = store.getters[`${entityModuleName}/feature`](feature.name);

      expect(storageGetter).toEqual(storeGetter);
    });
  });

  describe('>> Actions', () => {
    it('should proxy enableFeature', async () => {
      const featureId = 'id';

      await storage.actions.enableFeature(featureId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/enableFeature`, featureId);
    });

    it('should proxy disableFeature', async () => {
      const featureId = 'id';

      await storage.actions.disableFeature(featureId);
      expect(store.dispatch).toBeCalledWith(`${entityModuleName}/disableFeature`, featureId);
    });
  });
});
