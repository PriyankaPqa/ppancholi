import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { MassActionType } from '@/entities/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import Component from './ImportPaymentStatusDetails.vue';

const localVue = createLocalVue();

describe('ImportPaymentStatusDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct mass action type', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'massActionType';
      const expected = MassActionType.ImportPaymentStatuses;

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.importPaymentStatus.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.importPaymentStatus.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.importPaymentStatus.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.importPaymentStatus.home.name;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
