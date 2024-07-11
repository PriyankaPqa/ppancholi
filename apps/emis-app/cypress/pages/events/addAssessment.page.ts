import { Language } from '@libs/cypress-lib/helpers';
import { IMultilingual } from '@libs/shared-lib/types';

export enum DataTest {
  assessment = 'registrationAssessment-assessment',
  title = 'registrationAssessment-title',
  description = 'registrationAssessment-description_input',
  frenchTab = 'tab-lang-fr',
  englishTab = 'tab-lang-en',
  addButton = 'dialog-submit-action',
}

export interface IRegistrationAssessment {
  assessment?: string;
  sectionTitle: IMultilingual;
  description: IMultilingual;
}

export class AddAssessmentPage {
  private assessment = { selector: DataTest.assessment };

  private title = { selector: DataTest.title, type: 'input' };

  private description = { selector: DataTest.description, type: 'textarea' };

  private frenchTab = { selector: DataTest.frenchTab };

  private englishTab = { selector: DataTest.englishTab };

  private addButton = { selector: DataTest.addButton };

  public selectTab(lang: Language) {
    const tabSelectors = {
      [Language.English]: this.englishTab,
      [Language.French]: this.frenchTab,
    };

    cy.getByDataTest(tabSelectors[lang]).click();
  }

  public selectAssessment(assessmentName: string) {
    cy.selectListElementByValue(DataTest.assessment, assessmentName);
  }

  public fillAssessmentTitleDescription(data: IRegistrationAssessment, lang: Language) {
    const title = data.sectionTitle.translation[lang];
    const description = data.description.translation[lang];

    if (title) {
      cy.getByDataTest(this.title).clear();
      cy.getByDataTest(this.title).type(title);
    }

    if (description) {
      cy.getByDataTest(this.description).clear();
      cy.getByDataTest(this.description).type(description);
    }
  }

  public addAssessment() {
    cy.getByDataTest(this.addButton).click();
  }
}
