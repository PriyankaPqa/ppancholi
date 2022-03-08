import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import { MassActionType } from '@/entities/mass-action';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import Component from './FundingRequestDetails.vue';

const localVue = createLocalVue();

describe('FundingRequestDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct mass action type', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'massActionType';
      const expected = MassActionType.GenerateFundingRequest;

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.fundingRequest.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.fundingRequest.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.fundingRequest.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.fundingRequest.home.name;

      expect(component.props(props)).toEqual(expected);
    });

    it('should show valid download button', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'showValidDownload';
      const expected = true;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
