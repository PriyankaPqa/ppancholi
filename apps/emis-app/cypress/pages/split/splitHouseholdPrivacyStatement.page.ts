import { CRCPrivacyStatementPage } from '../registration/crcPrivacyStatement.page';

export enum DataTest {
  selectEvent = 'household_profile_split_event_select',
}

export class SplitHouseholdPrivacyStatementPage extends CRCPrivacyStatementPage {
  private selectEvent = { selector: DataTest.selectEvent, type: 'input' };

  public fillEvent(data: string) {
    cy.getByDataTest(this.selectEvent).type(data);
    cy.selectListElementByValue(DataTest.selectEvent, data);
    return new CRCPrivacyStatementPage();
  }
}
