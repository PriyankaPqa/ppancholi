import { Language, splitDate } from '@libs/cypress-lib/helpers';
import { IMultilingual } from '@libs/shared-lib/types';

export enum DataTest {
  agreementType = 'agreement-agreementType',
  agreementName = 'agreement-name',
  agreementDetails = 'agreement-details_input',
  startDate = 'agreement-start-date',
  endDate = 'agreement-end-date',
  englishTab = 'tab-lang-en',
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

  private englishTab = { selector: DataTest.englishTab };

  private addButton = { selector: DataTest.addButton };

  public fillAgreementNameDetails(data: IEventAgreement, roleName: string, lang: Language) {
    const nameTranslation = data.name.translation[lang];
    const detailsTranslation = data.details.translation[lang];

    if (nameTranslation) {
      cy.getByDataTest(this.agreementName).clear();
      cy.getByDataTest(this.agreementName).type(nameTranslation);
      cy.getByDataTest(this.agreementName).type(roleName);
    }

    if (detailsTranslation) {
      cy.getByDataTest(this.agreementDetails).clear();
      cy.getByDataTest(this.agreementDetails).type(detailsTranslation);
    }
  }

  public fill(data: IEventAgreement, roleName: string, lang: Language) {
    if (data.agreementType) {
      cy.selectListElementByValue(DataTest.agreementType, data.agreementType);
    }

    this.fillAgreementNameDetails(data, roleName, lang);

    if (data.startDate) {
      const { year, month, day } = splitDate(data.startDate.toString());
      cy.setDatePicker(DataTest.startDate, { year, month, day });
    }

    if (data.endDate) {
      const { year, month, day } = splitDate(data.endDate.toString());
      cy.setDatePicker(DataTest.endDate, { year, month, day });
    }
  }

  public selectTab(lang: Language) {
    const tabSelectors = {
      [Language.English]: this.englishTab,
      [Language.French]: this.frenchTab,
    };

    cy.getByDataTest(tabSelectors[lang]).click();
  }

  public addNewAgreement() {
    cy.getByDataTest(this.addButton).click();
  }
}
