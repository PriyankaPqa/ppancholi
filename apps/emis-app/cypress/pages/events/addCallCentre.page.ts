import { IEventCallCentre } from '@libs/entities-lib/event';
import { splitDate } from '@libs/cypress-lib/helpers/date';

export enum DataTest {
  status = 'callCentre-status',
  name = 'callCentre-name',
  startDate = 'callcentre-start-date',
  endDate = 'callcentre-end-date',
  statusToggle = 'callcentre-switch-status',
  details = 'callcentre-details_input',
  frenchTab = 'tab-lang-fr',
  addButton = 'dialog-submit-action',
}

export class AddCallCentrePage {
  private callCentreStatus = { selector: DataTest.status };

  private callCentreName = { selector: DataTest.name, type: 'input' };

  private startDate = { selector: DataTest.startDate, type: 'input' };

  private callCentreDetails = { selector: DataTest.details, type: 'textarea' };

  private statusToggle = { selector: DataTest.statusToggle, type: 'input' };

  private frenchTab = { selector: DataTest.frenchTab };

  private addButton = { selector: DataTest.addButton };

  public getCallCentreStatus() {
    return cy.getByDataTest(this.callCentreStatus).getAndTrimText();
  }

  public fillCallCentreName(name: string) {
    cy.getByDataTest(this.callCentreName).clear();
    cy.getByDataTest(this.callCentreName).type(name);
  }

  public fill(data: IEventCallCentre, roleName: string) {
    if (data.name.translation.en) {
      cy.getByDataTest(this.callCentreName).type(data.name.translation.en);
      cy.getByDataTest(this.callCentreName).type(roleName);
    }
    if (data.details.translation.en) {
      cy.getByDataTest(this.callCentreDetails).type(data.details.translation.en);
    }
    if (data.startDate) {
      const { year, month, day } = splitDate(data.startDate.toString());
      cy.setDatePicker(DataTest.startDate, { year, month, day });
    }
    if (data.endDate) {
      const { year, month, day } = splitDate(data.endDate.toString());
      cy.setDatePicker(DataTest.endDate, { year, month, day });
    }
  }

  public fillFrenchData(data: IEventCallCentre, roleName: string) {
    if (data.name.translation.fr) {
      cy.getByDataTest(this.callCentreName).clear();
      cy.getByDataTest(this.callCentreName).type(data.name.translation.fr);
      cy.getByDataTest(this.callCentreName).type(roleName);
    }
    if (data.details.translation.fr) {
      cy.getByDataTest(this.callCentreDetails).clear();
      cy.getByDataTest(this.callCentreDetails).type(data.details.translation.fr);
    }
  }

  public toggleStatus() {
    cy.getByDataTest(this.statusToggle).check({ force: true });
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }

  public addNewCallCentre() {
    cy.getByDataTest(this.addButton).click();
  }
}
