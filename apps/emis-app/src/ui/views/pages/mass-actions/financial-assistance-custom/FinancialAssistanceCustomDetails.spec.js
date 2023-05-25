import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import Component from './FinancialAssistanceCustomDetails.vue';

const localVue = createLocalVue();

describe('FinancialAssistanceCustomDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.financialAssistanceCustomCreate.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.financialAssistanceCustomCreate.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.financialAssistanceCustomCreate.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.financialAssistanceCustom.home.name;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
