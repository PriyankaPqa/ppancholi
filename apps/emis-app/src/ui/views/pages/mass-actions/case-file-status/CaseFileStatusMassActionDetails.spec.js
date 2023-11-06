import {
  createLocalVue,
  shallowMount,
} from '@/test/testSetup';
import { mockProvider } from '@/services/provider';
import MassActionBaseDetails from '@/ui/views/pages/mass-actions/components/MassActionBaseDetails.vue';
import routes from '@/constants/routes';
import { mockMassActionEntity } from '@libs/entities-lib/mass-action';
import { EEventStatus, mockEventMainInfo } from '@libs/entities-lib/event';
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

  describe('lifecycle', () => {
    it('calls the service with the event id, to check if the user has access to it', async () => {
      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.$services.events.searchMyEventsById).toBeCalledWith([wrapper.vm.massAction.details.eventId]);
    });

    it('sets canAccessEvent to true if the event is open', async () => {
      wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => (
        { value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: EEventStatus.Open } })] }));

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.canAccessEvent).toBeTruthy();
    });

    it('sets canAccessEvent to true if the event is not open and user is level 6', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $services: services,
          $hasLevel: () => true,
        },
        computed: { massAction() {
          return mockMassActionEntity();
        } } });
      wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => (
        { value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: EEventStatus.Closed } })] }));

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.canAccessEvent).toBeTruthy();
    });

    it('sets canAccessEvent to false if the event is not open and user is not level 6', async () => {
      wrapper = shallowMount(Component, {
        localVue,
        mocks: {
          $services: services,
          $hasLevel: () => false,
        },
        computed: { massAction() {
          return mockMassActionEntity();
        } } });
      wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => (
        { value: [mockEventMainInfo({ schedule: { ...mockEventMainInfo().schedule, status: EEventStatus.Closed } })] }));

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.canAccessEvent).toBeFalsy();
    });

    it('sets canAccessEvent to false if no event is returned', async () => {
      wrapper.vm.$services.events.searchMyEventsById = jest.fn(() => ({ value: [] }));

      await wrapper.vm.$options.created.forEach((hook) => {
        hook.call(wrapper.vm);
      });
      expect(wrapper.vm.canAccessEvent).toBeFalsy();
    });
  });
});
