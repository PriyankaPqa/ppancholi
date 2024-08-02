import { BaseDetailsMassAction } from '../base/baseDetailsMassAction';

export enum DataTest {
  event = 'event',
  communicationMethod = 'communicationMethod',
  messageSubject = 'messageSubject',
  communicationMessage = 'communicationMessage',
}

export class MassCommunicationDetailsPage extends BaseDetailsMassAction {
  private event = { selector: DataTest.event };

  private communicationMethod = { selector: DataTest.communicationMethod };

  private messageSubject = { selector: DataTest.messageSubject };

  private communicationMessage = { selector: DataTest.communicationMessage };

  public getMassCommunicationEvent() {
    return cy.getByDataTest(this.event).getAndTrimText();
  }

  public getMassCommunicationCommunicationMethod() {
    return cy.getByDataTest(this.communicationMethod).getAndTrimText();
  }

  public getMassCommunicationMessageSubject() {
    return cy.getByDataTest(this.messageSubject).getAndTrimText();
  }

  public getMassCommunicationCommunicationMessage() {
    return cy.getByDataTest(this.communicationMessage).getAndTrimText();
  }
}
