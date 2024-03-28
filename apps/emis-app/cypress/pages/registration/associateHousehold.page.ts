import { PersonalInformationPage } from '@libs/cypress-lib/pages/registration/personalInformation.page';

export enum DataTest {
  existingBeneficiarySummary = 'summary__existingBeneficiary__section',
  displayedUserName = 'privacyCRCUsername',
  privacyRegistration = 'privacyRegistrationMethod',
  privacyAgreement = 'isPrivacyAgreed',
  registeredEvent = 'previous_event_0',
  editButton = '"inlineEdit__open__Personal information"',
  saveButton = '"inlineEdit__save__Personal information"',
  firstNameAssociateHousehold = 'firstName',
  lastNameAssociateHousehold = 'lastName',
  dateOfBirthAssociateHousehold = 'birthDate',
  cancelButton = 'cancel-action-dialog-confirmation',
  submitButton = 'submit-action-dialog-confirmation',
}
export class AssociateHouseholdPage extends PersonalInformationPage {
  private existingBeneficiarySummary = { selector: DataTest.existingBeneficiarySummary };

  private registeredEvent = { selector: DataTest.registeredEvent };

  private displayedUserName = { selector: DataTest.displayedUserName, type: 'input' };

  private privacyAgreement = { selector: DataTest.privacyAgreement, type: 'input' };

  private editButton = { selector: DataTest.editButton };

  private saveButton = { selector: DataTest.saveButton };

  private firstNameAssociateHousehold = { selector: DataTest.firstNameAssociateHousehold };

  private lastNameAssociateHousehold = { selector: DataTest.lastNameAssociateHousehold };

  private dateOfBirthAssociateHousehold = { selector: DataTest.dateOfBirthAssociateHousehold };

  private cancelButton = { selector: DataTest.cancelButton };

  private submitButton = { selector: DataTest.submitButton };

  public getExistingBeneficiarySummary() {
    return cy.getByDataTest(this.existingBeneficiarySummary);
  }

  public getRegisteredEvent() {
    return cy.getByDataTest(this.registeredEvent);
  }

  public getPrivacyCheckbox() {
    return cy.getByDataTest(this.privacyAgreement);
  }

  public fillUserNameIfEmpty(name: string) {
    cy.getByDataTest(this.displayedUserName).then((inputField) => {
      if (inputField.val() === '') {
        cy.getByDataTest(this.displayedUserName).type(name);
      }
    });
  }

  public fillPrivacyRegistrationMethod(registrationMethod: string) {
    cy.selectListElementByValue(DataTest.privacyRegistration, registrationMethod);
  }

  public editPersonalInformation() {
    cy.getByDataTest(this.editButton).click();
  }

  public savePersonalInformation() {
    cy.getByDataTest(this.saveButton).click();
  }

  public getFirstName() {
    return cy.getByDataTest(this.firstNameAssociateHousehold).getAndTrimText();
  }

  public getLastName() {
    return cy.getByDataTest(this.lastNameAssociateHousehold).getAndTrimText();
  }

  public getDateOfBirth() {
    return cy.getByDataTest(this.dateOfBirthAssociateHousehold).getAndTrimText();
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.cancelButton);
  }

  public getDialogConfirmButton() {
    return cy.getByDataTest(this.submitButton);
  }

  public goToConfirmationHouseholdAssociationPage() {
    cy.getByDataTest(this.submitButton).click();
  }
}
