import { CRCPrivacyStatementPage } from '../registration/crcPrivacyStatement.page';

export enum DataTest {
  selectEvent = 'household_profile_split_event_select',
}

export class SplitHouseholdPrivacyStatementPage extends CRCPrivacyStatementPage {
  private selectEvent = { selector: DataTest.selectEvent, type: 'input' };

  public fillEvent(eventName: string) {
    cy.searchAndSelect(DataTest.selectEvent, eventName);
    return new CRCPrivacyStatementPage();
  }
}
