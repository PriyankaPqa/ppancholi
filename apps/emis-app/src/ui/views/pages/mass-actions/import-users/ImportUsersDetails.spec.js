import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';

import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import Component from './ImportUsersDetails.vue';

const localVue = createLocalVue();

describe('ImportUsersDetails.vue', () => {
  let wrapper;

  describe('Template', () => {
    it('should pass correct pre processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massActions.importUsers.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massActions.importUsers.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massActions.importUsers.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct massActionBaseDetailsLabels', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'massActionBaseDetailsLabels';
      const massActionBaseDetailsLabels = {
        preProcessingWaitTitle: '',
        preProcessingWaitLabelOne: 'massActions.importUsers.preProcessing.info1',
        preProcessingWaitLabelTwo: 'massActions.importUsers.preProcessing.info2',
        processingWaitTitle: 'massActions.importUsers.processing.accounts',
        processingWaitLabelOne: 'massActions.importUsers.processing.info1',
        processingWaitLabelTwo: 'massActions.importUsers.processing.info2',
        preProcessedTotalLabel: 'massAction.importUsers.pre_processed.title.1',
        preProcessedSuccessesLabel: 'massAction.importUsers.pre_processed.title.2',
        preProcessedFailuresLabel: 'massAction.importUsers.pre_processed.title.3',
        processedTotalLabel: 'massAction.importUsers.processed.title.1',
        processedSuccessesLabel: 'massAction.importUsers.processed.title.2',
        processedFailuresLabel: 'massAction.importUsers.processed.title.3',
      };

      expect(component.props(props)).toMatchObject(massActionBaseDetailsLabels);
    });

    it('should pass correct backRouteName', () => {
      wrapper = shallowMount(Component, { localVue });
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.importUsers.home.name;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
