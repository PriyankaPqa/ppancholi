import { splitDate } from '@libs/cypress-lib/helpers';
import { IMultilingual } from '@libs/shared-lib/types';

export enum DataTest {
  agreementType = 'agreement-agreementType',
  agreementName = 'agreement-name',
  agreementDetails = 'agreement-details_input',
  startDate = 'agreement-start-date',
  endDate = 'agreement-end-date',
  frenchTab = 'tab-lang-fr',
  addButton = 'dialog-submit-action',
}

export interface IEventAgreement {
  name: IMultilingual;
  details: IMultilingual;
  startDate: Date | string;
  endDate: Date | string;
  agreementType: string;
}

export class AddNewAgreementPage {
  private agreementType = { selector: DataTest.agreementType };

  private agreementName = { selector: DataTest.agreementName, type: 'input' };

  private agreementDetails = { selector: DataTest.agreementDetails, type: 'textarea' };

  private frenchTab = { selector: DataTest.frenchTab };

  private addButton = { selector: DataTest.addButton };

  public fill(data: IEventAgreement, roleName: string) {
    if (data.agreementType) {
      cy.selectListElementByValue(DataTest.agreementType, data.agreementType);
    }
    if (data.name.translation.en) {
      cy.getByDataTest(this.agreementName).type(data.name.translation.en);
      cy.getByDataTest(this.agreementName).type(roleName);
    }
    if (data.details.translation.en) {
      cy.getByDataTest(this.agreementDetails).type(data.details.translation.en);
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

  public fillFrenchData(data: IEventAgreement, roleName: string) {
    if (data.name.translation.fr) {
      cy.getByDataTest(this.agreementName).clear();
      cy.getByDataTest(this.agreementName).type(data.name.translation.fr);
      cy.getByDataTest(this.agreementName).type(roleName);
    }
    if (data.details.translation.fr) {
      cy.getByDataTest(this.agreementDetails).clear();
      cy.getByDataTest(this.agreementDetails).type(data.details.translation.fr);
    }
  }

  public selectFrenchTab() {
    cy.getByDataTest(this.frenchTab).click();
  }

  public addNewAgreement() {
    cy.getByDataTest(this.addButton).click();
  }
}
