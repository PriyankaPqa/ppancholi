/**
 * @group ui/plugins
 */

import { createLocalVue } from '@/test/testSetup';
import features from '../features';

const localVue = createLocalVue();
localVue.use(features);

describe('Has features plugin', () => {
  describe('Plugin is correctly installed', () => {
    test('adds an $hasFeature method to the Vue prototype', () => {
      expect(typeof localVue.prototype.$hasFeature).toBe('function');
    });
  });
});
