import { CreateEventPage } from '../events/createEvent.page';

export enum DataTest {
  eventsTableAddButton = 'table__addButton',
}

export class HomePage {
  private addEventButton = { selector: DataTest.eventsTableAddButton };

  public goToCreateEventPage() {
    this.getAddEventButton().click();
    return new CreateEventPage();
  }

  public getAddEventButton() {
    return cy.getByDataTest(this.addEventButton);
  }
}
