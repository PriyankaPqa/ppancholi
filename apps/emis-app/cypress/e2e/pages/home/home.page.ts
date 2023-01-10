import { CreateEventPage } from '../events/createEvent.page';

export enum DataTest {
  eventsTable = 'events-table',
  eventsTableAddButton = 'table__addButton',
}

export class HomePage {
  private addEventButton = `//div[@data-test='${DataTest.eventsTable}']//button[@data-test='${DataTest.eventsTableAddButton}']`;

  public goToCreateEventPage() {
    this.getAddEventButton().click();
    return new CreateEventPage();
  }

  public getAddEventButton() {
    return cy.xpath(this.addEventButton);
  }
}
