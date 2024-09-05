import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { createTestingPinia } from '@pinia/testing';
import { useMockMassActionStore } from '@/pinia/mass-action/mass-action.mock';
import Component from './DataCorrectionDetails.vue';

const localVue = createLocalVue();

const pinia = createTestingPinia({ stubActions: false });
useMockMassActionStore(pinia);
describe('DataCorrectionDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue, pinia });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.dataCorrection.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue, pinia });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.dataCorrection.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue, pinia });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.dataCorrection.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue, pinia });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.dataCorrection.home.name;

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct disable-name', () => {
      wrapper = shallowMount(Component, { localVue, pinia });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'disableName';
      const expected = true;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
