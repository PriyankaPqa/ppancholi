import { CaseFileDetailsBase } from '../caseFileDetailsBase.page';
import { CaseFileImpactedIndividualsEditAddressPage } from './caseFileImpactedIndividualsEditAddress.page';

export enum DataTest {
  primaryMemberCard = 'primary_impacted_individual_card',
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
}

export class CaseFileImpactedIndividualsHomePage extends CaseFileDetailsBase {
  private primaryMemberCard = { selector: DataTest.primaryMemberCard };

  private receivingAssistanceToggle = { selector: DataTest.receivingAssistanceToggle };

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

  public getPrimaryMemberCard() {
    return cy.getByDataTest(this.primaryMemberCard);
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

  public refreshUntilImpactedIndividualsCardUpdated(addressType: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getPrimaryMemberCard().should('be.visible'),
        checkCondition: () => Cypress.$('[data-test="currentAddress__type"]').text().includes(addressType),
      },
      {
        timeoutInSec: 45,
        errorMsg: 'Failed to update Impacted Individuals',
        foundMsg: 'Impacted Individuals updated',
      },
    );
  }
}
