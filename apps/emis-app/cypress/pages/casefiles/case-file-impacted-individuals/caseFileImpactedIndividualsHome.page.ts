import { CaseFileDetailsBase } from '../caseFileDetailsBase.page';
import { CaseFileImpactedIndividualsEditAddressPage } from './caseFileImpactedIndividualsEditAddress.page';

export enum DataTest {
  primaryMemberCard = 'primary_impacted_individual_card',
  nonPrimaryMemberCard = 'non_primary_impacted_individual_card',
  receivingAssistanceToggle = 'receiving_assistance_toggle',
  currentTemporaryAddress = 'current_temporary_address',
  checkIn = 'impacted_individuals_card_template_check_in',
  checkOut = 'impacted_individuals_card_template_check_out',
  isCrcProvided = 'impacted_individuals_card_template_is_crc_provided',
  editCurrentTemporaryAddressButton = 'edit_button',
  primaryMemberLabel = 'primary_member_label',
  previousTemporaryAddressExpandButton = 'previous-address-icon',
  previousTemporaryAddressRow = 'previous-address-row',
  currentAddressTemplate = 'current_address_template',
  currentAddressType = 'currentAddress__type',
  currentAddressStreet = 'currentAddress__street',
  currentAddressLine = 'currentAddress__line',
  currentAddressCountry = 'currentAddress__country',
  impactedIndividualRationaleDialog = 'impacted-individual-rationale-dialog',
  confirmReceivingAssistanceDialogTitle = 'dialog-title',
  userAndDate = 'impacted-individual-rationale-dialog-user-date',
  rationaleInput = 'impacted-individual-rationale-dialog-rationale',
  rationaleInputTextArea = 'impacted-individual-rationale-dialog-rationale_input',
  dialogCloseButton = 'dialog-close',
  dialogSubmitButton = 'dialog-submit-action',
  dialogCancelButton = 'dialog-cancel-action',
  impactedIndividualsPinnedActivity = 'impacted-individuals-pinned-activity',
  pinnedActivityUserInformation = 'action_user_information',
  pinnedActivityRationale = 'impacted-individuals-pinned-activity-rationale',
}

export class CaseFileImpactedIndividualsHomePage extends CaseFileDetailsBase {
  private primaryMemberCard = { selector: DataTest.primaryMemberCard };

  private nonPrimaryMemberCard = { selector: DataTest.nonPrimaryMemberCard };

  private receivingAssistanceToggle = { selector: DataTest.receivingAssistanceToggle, type: 'input' };

  private currentTemporaryAddress = { selector: DataTest.currentTemporaryAddress };

  private checkIn = { selector: DataTest.checkIn };

  private checkOut = { selector: DataTest.checkOut };

  private isCrcProvided = { selector: DataTest.isCrcProvided };

  private editCurrentTemporaryAddressButton = { selector: DataTest.editCurrentTemporaryAddressButton };

  private primaryMemberLabel = { selector: DataTest.primaryMemberLabel };

  private previousTemporaryAddressExpandButton = { selector: DataTest.previousTemporaryAddressExpandButton };

  private previousTemporaryAddressRow = { selector: DataTest.previousTemporaryAddressRow };

  private currentAddressTemplate = { selector: DataTest.currentAddressTemplate };

  private currentAddressType = { selector: DataTest.currentAddressType };

  private currentAddressStreet = { selector: DataTest.currentAddressStreet };

  private currentAddressLine = { selector: DataTest.currentAddressLine };

  private currentAddressCountry = { selector: DataTest.currentAddressCountry };

  private impactedIndividualRationaleDialog = { selector: DataTest.impactedIndividualRationaleDialog };

  private confirmReceivingAssistanceDialogTitle = { selector: DataTest.confirmReceivingAssistanceDialogTitle };

  private userAndDate = { selector: DataTest.userAndDate };

  private rationaleInput = { selector: DataTest.rationaleInput };

  private rationaleInputTextArea = { selector: DataTest.rationaleInputTextArea, type: 'textarea' };

  private dialogSubmitButton = { selector: DataTest.dialogSubmitButton };

  private dialogCloseButton = { selector: DataTest.dialogCloseButton };

  private dialogCancelButton = { selector: DataTest.dialogCancelButton };

  private impactedIndividualsPinnedActivity = { selector: DataTest.impactedIndividualsPinnedActivity };

  private pinnedActivityUserInformation = { selector: DataTest.pinnedActivityUserInformation };

  private pinnedActivityRationale = { selector: DataTest.pinnedActivityRationale };

  public getPrimaryMemberCard() {
    return cy.getByDataTest(this.primaryMemberCard);
  }

  public getNonPrimaryMemberCard(index = 0) {
    return cy.getByDataTest(this.nonPrimaryMemberCard).eq(index);
  }

  public getReceivingAssistanceToggle() {
    return cy.getByDataTest(this.receivingAssistanceToggle);
  }

  public getCurrentTemporaryAddress() {
    return cy.getByDataTest(this.currentTemporaryAddress).getAndTrimText();
  }

  public getCheckIn() {
    return cy.getByDataTest(this.checkIn).getAndTrimText();
  }

  public getCheckOut() {
    return cy.getByDataTest(this.checkOut).getAndTrimText();
  }

  public getIsCrcProvided() {
    return cy.getByDataTest(this.isCrcProvided).getAndTrimText();
  }

  public getEditCurrentTemporaryAddressButton() {
    return cy.getByDataTest(this.editCurrentTemporaryAddressButton);
  }

  public goToEditCurrentTemporaryAddressPage(index = 0) {
    this.getEditCurrentTemporaryAddressButton().eq(index).click();
    return new CaseFileImpactedIndividualsEditAddressPage();
  }

  public getPrimaryMemberLabel() {
    return cy.getByDataTest(this.primaryMemberLabel);
  }

  public getPreviousTemporaryAddressExpandButton(index = 0) {
    return cy.getByDataTest(this.previousTemporaryAddressExpandButton).eq(index);
  }

  public getPreviousTemporaryAddressRow(index = 0) {
    return cy.getByDataTest(this.previousTemporaryAddressRow).eq(index);
  }

  public getCurrentAddressTemplate() {
    return cy.getByDataTest(this.currentAddressTemplate).getAndTrimText();
  }

  public getCurrentAddressType() {
    return cy.getByDataTest(this.currentAddressType).getAndTrimText();
  }

  public getCurrentAddressStreet() {
    return cy.getByDataTest(this.currentAddressStreet).getAndTrimText();
  }

  public getCurrentAddressLine() {
    return cy.getByDataTest(this.currentAddressLine).getAndTrimText();
  }

  public getCurrentAddressCountry() {
    return cy.getByDataTest(this.currentAddressCountry).getAndTrimText();
  }

  public refreshUntilImpactedIndividualsCardUpdated(addressStreet: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getPrimaryMemberCard().should('be.visible'),
        checkCondition: () => Cypress.$('[data-test="currentAddress__street"]').text().includes(addressStreet),
      },
      {
        timeoutInSec: 45,
        errorMsg: 'Failed to update Impacted Individuals',
        foundMsg: 'Impacted Individuals updated',
      },
    );
  }

  public getImpactedIndividualRationaleDialog() {
    return cy.getByDataTest(this.impactedIndividualRationaleDialog);
  }

  public getImpactedIndividualRationaleDialogTitle() {
    return cy.getByDataTest(this.confirmReceivingAssistanceDialogTitle).getAndTrimText();
  }

  public getUserAndDate() {
    return cy.getByDataTest(this.userAndDate).getAndTrimText();
  }

  public getRationaleInput() {
    return cy.getByDataTest(this.rationaleInput);
  }

  public getRationaleInputTextArea() {
    return cy.getByDataTest(this.rationaleInputTextArea);
  }

  public getDialogSubmitButton() {
    return cy.getByDataTest(this.dialogSubmitButton);
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.dialogCancelButton);
  }

  public getDialogCloseButton() {
    return cy.getByDataTest(this.dialogCloseButton);
  }

  public getImpactedIndividualsPinnedActivity() {
    return cy.getByDataTest(this.impactedIndividualsPinnedActivity);
  }

  public getPinnedActivityUserInformation() {
    return cy.getByDataTest(this.pinnedActivityUserInformation);
  }

  public getPinnedActivityRationale() {
    return cy.getByDataTest(this.pinnedActivityRationale).getAndTrimText();
  }

  public refreshUntilImpactedIndividualsCardPinnedActivityUpdated(rationale: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getPrimaryMemberCard().should('be.visible'),
        checkCondition: () => Cypress.$('[data-test="impacted-individuals-pinned-activity-rationale"]').text().includes(rationale),
      },
      {
        timeoutInSec: 45,
        errorMsg: 'Failed to update Impacted Individuals activity',
        foundMsg: 'Impacted Individuals activity updated',
      },
    );
  }
}
