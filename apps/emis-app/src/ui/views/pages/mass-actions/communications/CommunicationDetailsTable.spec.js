import { createLocalVue, mount, shallowMount } from '@/test/testSetup';
import { mockCombinedMassAction, mockMassActionEntity, MassActionCommunicationMethod } from '@libs/entities-lib/mass-action';
import { mockEventEntity } from '@libs/entities-lib/event';
import { useMockEventStore } from '@/pinia/event/event.mock';

import Component from './CommunicationDetailsTable.vue';

const localVue = createLocalVue();

const { pinia, eventStore } = useMockEventStore();

describe('CommunicationDetailsTable.vue', () => {
  let wrapper;

  const doMount = (shallow, otherData) => {
    const massAction = mockMassActionEntity();
    massAction.details.method = MassActionCommunicationMethod.Email;
    massAction.details.messageSubject = { translation: { en: 'bonjour hi' } };
    massAction.details.message = { translation: { en: 'hello' } };
    const options = {
      localVue,
      pinia,
      propsData: {
        massAction,
      },
      data() {
        return {
          ...otherData,
        };
      },
    };
    if (shallow === true) {
      wrapper = shallowMount(Component, options);
    } else {
      wrapper = mount(Component, options);
    }
  };

  describe('Computed', () => {
    beforeEach(() => {
      doMount(true, {
        event: mockEventEntity(),
      });
    });
    describe('rows', () => {
      it('should return proper rows', () => {
        expect(wrapper.vm.rows).toEqual([
          {
            label: 'massActions.financialAssistance.create.event.label',
            value: mockEventEntity().name.translation.en,
            dataTest: 'event',
            loading: wrapper.vm.eventLoading,
          },
          {
            label: 'massActions.communication.create.communicationMethod.label',
            value: 'enums.communicationMethod.Email',
            dataTest: 'communicationMethod',
          },
          {
            label: 'massActions.communication.create.messageSubject.label',
            value: 'bonjour hi',
            dataTest: 'messageSubject',
          },
          {
            label: 'massActions.communication.create.messageText.label',
            html: 'hello',
            dataTest: 'communicationMessage',
          },
        ]);
      });
    });
  });

  describe('Methods', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('fetchEvent', () => {
      it('should fetch the event', async () => {
        const id = mockCombinedMassAction().entity.details.eventId;
        await wrapper.vm.fetchEvent();
        expect(eventStore.fetch).toHaveBeenCalledWith(id);
      });
    });
  });

  describe('Lifecycle', () => {
    beforeEach(() => {
      doMount(true);
    });
    describe('created', () => {
      it('fetches all data', async () => {
        jest.clearAllMocks();
        wrapper.vm.fetchEvent = jest.fn();

        await wrapper.vm.$options.created[0].call(wrapper.vm);

        expect(wrapper.vm.fetchEvent).toHaveBeenCalledTimes(1);
      });
    });
  });
});
