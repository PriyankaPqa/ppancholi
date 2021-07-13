import {
  IEventCombined, IEventEntity, mockCombinedEvents, mockEventEntity,
} from '@/entities/event';
import { BaseMock } from '../base/base.mock';

export class EventStorageMock extends BaseMock<IEventCombined, IEventEntity> {
  constructor() {
    super(mockCombinedEvents(), mockEventEntity());
  }

  protected getters = {
    ...this.baseGetters,

    agreementTypes: jest.fn(),
    eventTypes: jest.fn(),
    eventsByStatus: jest.fn(),
  }

  protected actions = {
    ...this.baseActions,

    fetchAgreementTypes: jest.fn(),
    fetchEventTypes: jest.fn(),
    fetchOtherProvinces: jest.fn(),
    fetchRegions: jest.fn(),
    updateEventSection: jest.fn(() => this.entity),
    deleteAgreement: jest.fn(() => this.entity),
    toggleSelfRegistration: jest.fn(() => this.entity),
    setEventStatus: jest.fn(() => this.entity),
    createEvent: jest.fn(() => this.entity),
    updateEvent: jest.fn(() => this.entity),
  }

  protected mutations = {
    ...this.baseMutations,
  }

  public make = () => ({
    getters: this.getters,
    actions: this.actions,
    mutations: this.mutations,
  })
}
