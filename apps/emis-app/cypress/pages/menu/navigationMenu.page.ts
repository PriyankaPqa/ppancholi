import { EventsHomePage } from '../events/eventsHome.page';

export enum DataTest {
  events = 'events',
}

export class NavigationMenuPage {
  private events = { selector: DataTest.events };

  public goToEventsPage() {
    cy.getByDataTest(this.events).click();
    return new EventsHomePage();
  }
}
