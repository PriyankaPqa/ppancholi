import { ManageDuplicatesPage } from '../manage-duplicates/manageDuplicates.page';
import { AddHouseholdMemberPage } from './addHouseholdMember.page';
import { CaseFileDetailsPage } from './caseFileDetails.page';
import { EditHouseholdAddressPage } from './editHouseholdAddress.page';
import { EditHouseholdProfilePage } from './editHouseholdProfile.page';
import { ProfileHistoryPage } from './profileHistory.page';
import { SplitHouseholdMemberPage } from './splitHouseholdMember.page';

export enum DataTest {
  caseFileNumber = 'household_profile_case_file_number',
  memberSplit = 'household_profile_member_action_btn_transfer',
  memberNameDisplay = 'household_profile_member_display_name',
  memberNameInfo = 'household_profile_member_info_data_name',
  dateOfBirth = 'household_profile_member_info_data_date_of_birth',
  gender = 'household_profile_member_info_data_gender',
  registrationNumber = 'registrationNumber',
  memberAdd = 'household_profile_add_new_member',
  memberMakePrimary = 'household_profile_member_make_primary_btn',
  memberEdit = 'household_profile_member_action_btn_edit',
  memberDelete = 'household_profile_member_action_btn_delete',
  memberEditAddress = 'member_address_edit_btn',
  profileHistory = 'household-profile-history-btn',
  homeAddress = 'household_profile_home_address',
  homeAddressLine1 = 'household_profile_home_address_line1',
  homeAddressLine2 = 'household_profile_home_address_line2',
  homeAddressCountry = 'household_profile_home_address_country',
  dialogCancel = 'dialog-cancel-action',
  dialogSubmit = 'dialog-submit-action',
  householdStatus = 'statusSelect__chip',
  statusSelectOpen = 'statusSelect__0',
  statusSelectClosed = 'statusSelect__1',
  statusSelectArchived = 'statusSelect__2',
  dialogTitle = 'dialog-title',
  dialogStatus = 'household-status-chip',
  dialogUserInfo = 'user-info',
  inputRationale = 'input-rationale',
  actionUserInformation = 'action_user_information',
  rationale = 'rationale',
  statusSelectChevronIcon = 'chevron-icon',
  buttonManageDuplicate = 'household-profile-manageDuplicatesBtn',
  duplicateIcon = 'household-profile-duplicatesIcon',
  duplicateCount = 'household-profile-duplicateCount',
  dialogConfirmationCancel = 'cancel-action-dialog-confirmation',
  dialogConfirmationSubmit = 'submit-action-dialog-confirmation',
  householdMemberCard = 'household_profile_primary_member_card',
  currentAddressType = 'currentAddress__type',
  currentAddressStreet = 'currentAddress__street',
  currentAddressLine = 'currentAddress__line',
  currentAddressCountry = 'currentAddress__country',

}

export class HouseholdProfilePage {
  private caseFileNumber = { selector: DataTest.caseFileNumber };

  private memberSplit = { selector: DataTest.memberSplit };

  private memberNameDisplay = { selector: DataTest.memberNameDisplay };

  private memberNameInfo = { selector: DataTest.memberNameInfo };

  private registrationNumber = { selector: DataTest.registrationNumber };

  private dateOfBirth = { selector: DataTest.dateOfBirth };

  private gender = { selector: DataTest.gender };

  private memberAdd = { selector: DataTest.memberAdd };

  private memberMakePrimary = { selector: DataTest.memberMakePrimary };

  private memberEdit = { selector: DataTest.memberEdit };

  private memberDelete = { selector: DataTest.memberDelete };

  private memberEditAddress = { selector: DataTest.memberEditAddress };

  private profileHistory = { selector: DataTest.profileHistory };

  private homeAddress = { selector: DataTest.homeAddress };

  private homeAddressLine1 = { selector: DataTest.homeAddressLine1 };

  private homeAddressLine2 = { selector: DataTest.homeAddressLine2 };

  private homeAddressCountry = { selector: DataTest.homeAddressCountry };

  private dialogCancel = { selector: DataTest.dialogCancel };

  private dialogSubmit = { selector: DataTest.dialogSubmit };

  private householdStatus = { selector: DataTest.householdStatus };

  private statusSelectOpen = { selector: DataTest.statusSelectOpen };

  private statusSelectClosed = { selector: DataTest.statusSelectClosed };

  private statusSelectArchived = { selector: DataTest.statusSelectArchived };

  private dialogTitle = { selector: DataTest.dialogTitle };

  private dialogStatus = { selector: DataTest.dialogStatus };

  private dialogUserInfo = { selector: DataTest.dialogUserInfo };

  private rationaleInput = { selector: DataTest.inputRationale, type: 'input' };

  private rationaleLabel = { selector: DataTest.inputRationale, type: 'span' };

  private actionUserInformation = { selector: DataTest.actionUserInformation };

  private rationale = { selector: DataTest.rationale };

  private statusSelectChevronIcon = { selector: DataTest.statusSelectChevronIcon };

  private manageDuplicatesButton = { selector: DataTest.buttonManageDuplicate };

  private duplicateIcon = { selector: DataTest.duplicateIcon };

  private duplicateCount = { selector: DataTest.duplicateCount };

  private dialogConfirmationCancel = { selector: DataTest.dialogConfirmationCancel };

  private dialogConfirmationSubmit = { selector: DataTest.dialogConfirmationSubmit };

  private householdMemberCard = { selector: DataTest.householdMemberCard };

  private currentAddressType = { selector: DataTest.currentAddressType };

  private currentAddressStreet = { selector: DataTest.currentAddressStreet };

  private currentAddressLine = { selector: DataTest.currentAddressLine };

  private currentAddressCountry = { selector: DataTest.currentAddressCountry };

  public getCaseFileNumber() {
    return cy.getByDataTest(this.caseFileNumber).getAndTrimText();
  }

  public getCaseFileNumberElement() {
    return cy.getByDataTest(this.caseFileNumber);
  }

  public refreshUntilCaseFileNumberLinkClickable() {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getCaseFileNumberElement().should('be.visible'),
        checkCondition: () => Cypress.$('a[data-test="household_profile_case_file_number"][href^="/en/casefile/"]').length > 0,
      },
      {
        errorMsg: 'case file link unclickable',
        foundMsg: 'case file link active',
      },
    );
  }

  public goToCaseFileDetailsPage() {
    this.refreshUntilCaseFileNumberLinkClickable(); // refresh until the case file number link changes from span to link

    cy.interceptAndValidateCondition({
      httpMethod: 'GET',
      url: '**/case-file/case-files/*/activities',
      actionsCallback: () => {
        cy.getByDataTest(this.caseFileNumber).click();
      },
      conditionCallBack: (interception) => (interception.response.statusCode === 200),
      actionsWhenValidationPassed: (interception) => {
        cy.log(`Expected status 200 received for ${interception.request.url}`);
      },
      actionsWhenValidationFailed: (interception) => {
        throw Error(`Expected status 200 not received for ${interception.request.url}`);
      },
      timeout: 50000,
      alias: 'interceptedRequest',
    });
    return new CaseFileDetailsPage();
  }

  public selectMemberToSplit(index = 0) {
    cy.getByDataTest(this.memberSplit).eq(index).click();
    return new SplitHouseholdMemberPage();
  }

  public getSplitIcon() {
    return cy.getByDataTest(this.memberSplit);
  }

  public getFullNameOfMemberByIndex(index: number) {
    return cy.getByDataTestLike(this.memberNameDisplay).eq(index).getAndTrimText();
  }

  public getHouseholdMember(name: string) {
    const memberNameSelector = { selector: `"${DataTest.memberNameDisplay}_${name}"` };
    return cy.getByDataTest(memberNameSelector);
  }

  public getMemberNameInfoByIndex(index: number) {
    return cy.getByDataTestLike(this.memberNameInfo).eq(index);
  }

  public getHouseholdSize() {
    return cy.getByDataTestLike(this.memberNameDisplay);
  }

  public getRegistrationNumber() {
    return cy.getByDataTest(this.registrationNumber).getAndTrimText();
  }

  public getDateOfBirth() {
    const dateOfBirthArray: string[] = [];
    // eslint-disable-next-line
    return cy.getByDataTest(this.dateOfBirth).each(($el) => {
      const dateOfBirth = $el.text().trim();
      dateOfBirthArray.push(dateOfBirth);
    }).then(() => dateOfBirthArray);
  }

  public getGender() {
    const genderArray: string[] = [];
    // eslint-disable-next-line
    return cy.getByDataTest(this.gender).should('be.visible').each(($el) => {
      const genderText = $el.text().trim();
      genderArray.push(genderText);
    }).then(() => genderArray);
  }

  public getMakePrimaryButtons() {
    return cy.getByDataTest(this.memberMakePrimary);
  }

  public getEditMemberButtons() {
    return cy.getByDataTest(this.memberEdit);
  }

  public editMemberByIndex(index: number) {
    cy.getByDataTest(this.memberEdit).eq(index).click();
    return new EditHouseholdProfilePage();
  }

  public getSplitMemberButtons() {
    return cy.getByDataTest(this.memberSplit);
  }

  public getDeleteMemberButtonByIndex(index: number) {
    return cy.getByDataTest(this.memberDelete).eq(index);
  }

  public getDeleteMemberButtons() {
    return cy.getByDataTest(this.memberDelete);
  }

  public addNewMember() {
    cy.getByDataTest(this.memberAdd).click();
    return new AddHouseholdMemberPage();
  }

  public getAddNewMemberButton() {
    return cy.getByDataTest(this.memberAdd);
  }

  public editAddress() {
    // timeout added to allow page to load properly
    cy.getByDataTest(this.memberEditAddress, { timeout: 30000 }).should('be.visible').click();
    return new EditHouseholdAddressPage();
  }

  public goToProfileHistoryPage() {
    cy.getByDataTest(this.profileHistory).click();
    return new ProfileHistoryPage();
  }

  public getHomeAddressLine1() {
    return cy.getByDataTest(this.homeAddressLine1).getAndTrimText();
  }

  public getHomeAddressLine2() {
    return cy.getByDataTest(this.homeAddressLine2).getAndTrimText();
  }

  public getHomeAddressCountry() {
    return cy.getByDataTest(this.homeAddressCountry).getAndTrimText();
  }

  public getHomeAddress() {
    return cy.getByDataTest(this.homeAddress);
  }

  public getEditAddressButton() {
    return cy.getByDataTest(this.memberEditAddress);
  }

  public getDialogCancelDeleteButton() {
    return cy.getByDataTest(this.dialogConfirmationCancel);
  }

  public getDialogConfirmDeleteButton() {
    return cy.getByDataTest(this.dialogConfirmationSubmit);
  }

  public getHouseholdStatus() {
    return cy.getByDataTest(this.householdStatus).getAndTrimText();
  }

  public selectStatusToOpen() {
    cy.getByDataTest(this.householdStatus).click();
    cy.getByDataTest(this.statusSelectOpen).click();
  }

  public selectStatusToClosed() {
    cy.getByDataTest(this.householdStatus).click();
    cy.getByDataTest(this.statusSelectClosed).click();
  }

  public selectStatusToArchived() {
    cy.getByDataTest(this.householdStatus).click();
    cy.getByDataTest(this.statusSelectArchived).click();
  }

  public getDialogTitle() {
    return cy.getByDataTest(this.dialogTitle);
  }

  public getDialogStatus() {
    return cy.getByDataTest(this.dialogStatus).getAndTrimText();
  }

  public getDialogUserInfo() {
    return cy.getByDataTest(this.dialogUserInfo).getAndTrimText();
  }

  public getDialogCancelButton() {
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogApplyButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }

  public getDialogRationaleElement() {
    return cy.getByDataTest(this.rationaleLabel);
  }

  public enterDialogRationale(rationale: string) {
    return cy.getByDataTest(this.rationaleInput).type(rationale);
  }

  public getUserActionInformationElement() {
    return cy.getByDataTest(this.actionUserInformation);
  }

  public getUserRationaleElement() {
    return cy.getByDataTest(this.rationale);
  }

  public getHouseholdStatusElement() {
    return cy.getByDataTest(this.householdStatus);
  }

  public getHouseholdStatusChevronDownIcon() {
    return cy.getByDataTest(this.statusSelectChevronIcon);
  }

  public refreshUntilHouseholdStatusUpdatedTo(statusEnum: number) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getDialogApplyButton().should('not.exist'),
        checkCondition: () => !Cypress.$(`[data-test='statusSelect__${statusEnum}']`).length,
      },
      {
        errorMsg: 'Unable to update status',
        foundMsg: 'Household status successfully updated on UI',
      },
    );
  }

  public refreshUntilUserActionInformationUpdatedWithStatus(status: string) {
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => this.getUserActionInformationElement().should('be.visible'),
        checkCondition: () => Cypress.$('[data-test=\'action_user_information\']').text().includes(status),
      },
      {
        errorMsg: 'Unable to update user action information',
        foundMsg: 'User action successfully updated on UI',
      },
    );
  }

  public goToManageDuplicatesPage() {
    cy.getByDataTest(this.manageDuplicatesButton).click();
    return new ManageDuplicatesPage();
  }

  public getManageDuplicatesButton() {
    return cy.getByDataTest(this.manageDuplicatesButton);
  }

  public getDuplicatesIcon() {
    return cy.getByDataTest(this.duplicateIcon);
  }

  public getDuplicatesCount() {
    return cy.getByDataTest(this.duplicateCount).getAndTrimText();
  }

  public makeHouseholdPrimaryByIndex(index = 0) {
    cy.getByDataTest(this.memberMakePrimary).eq(index).click();
  }

  public getDialogConfirmCancelButton() {
    return cy.getByDataTest(this.dialogConfirmationCancel);
  }

  public getDialogConfirmSubmitButton() {
    return cy.getByDataTest(this.dialogConfirmationSubmit);
  }

  public getMakeHouseholdPrimaryButtons() {
    return cy.getByDataTest(this.memberMakePrimary);
  }

  public refreshUntilHouseholdContactInformationUpdated(phoneNumber: string) {
    cy.contains('Household members').scrollIntoView();
    cy.waitAndRefreshUntilConditions(
      {
        visibilityCondition: () => cy.contains('Household members').should('be.visible'),
        checkCondition: () => Cypress.$('[data-test=\'household_profile_member_info_data_phone_numbers\']').text().includes(phoneNumber),
      },
      {
        timeoutInSec: 60,
        errorMsg: 'Failed to update Household contact info',
        foundMsg: 'Household contact information updated',
      },
    );
  }

  public getHouseholdMemberCard(index = 0) {
    return cy.getByDataTest(this.householdMemberCard).eq(index);
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
}
