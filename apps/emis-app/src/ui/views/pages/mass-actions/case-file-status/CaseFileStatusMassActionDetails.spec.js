import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { mockMassActionEntity } from '@libs/entities-lib/mass-action';
import Component from './CaseFileStatusMassActionDetails.vue';

const localVue = createLocalVue();
const services = mockProvider();

describe('CaseFileStatusMassActionDetails.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Component, {
      localVue,
      mocks: {
        $services: services,
      },
      computed: { massAction() {
        return mockMassActionEntity();
      } } });
  });

  describe('Template', () => {
    it('should pass correct pre processing title', () => {
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'preProcessingTitle';
      const expected = 'massAction.caseFileStatus.status.preprocessing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct processing title', () => {
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'processingTitle';
      const expected = 'massAction.caseFileStatus.status.processing.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct details title', () => {
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'detailsTitle';
      const expected = 'massAction.caseFileStatus.status.details.title';

      expect(component.props(props)).toEqual(expected);
    });

    it('should pass correct backRouteName', () => {
      const component = wrapper.findComponent(MassActionBaseDetails);
      const props = 'backRouteName';
      const expected = routes.massActions.caseFileStatus.home.name;

      expect(component.props(props)).toEqual(expected);
    });
  });
});
