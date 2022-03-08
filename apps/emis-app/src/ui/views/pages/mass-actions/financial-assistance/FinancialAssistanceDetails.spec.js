import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { MassActionType } from '@/entities/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import Component from './FinancialAssistanceDetails.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct mass action type', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'massActionType';
      const expected = MassActionType.FinancialAssistance;

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.financialAssistance.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.financialAssistance.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.financialAssistance.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.financialAssistance.home.name;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
