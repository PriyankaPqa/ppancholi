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

  public getCaseFileNumber() {
    return cy.getByDataTest(this.caseFileNumber).getAndTrimText();
  }

  public goToCaseFileDetailsPage() {
    cy.getByDataTest(this.caseFileNumber).click();
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
    return cy.getByDataTest(this.dateOfBirth).each(($el) => {
      const dateOfBirth = $el.text().trim();
      dateOfBirthArray.push(dateOfBirth);
    }).then(() => dateOfBirthArray);
  }

  public getGender() {
    const genderArray: string[] = [];
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
    cy.getByDataTest(this.memberEditAddress, { timeout: 15000 }).should('be.visible').click();
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
    return cy.getByDataTest(this.dialogCancel);
  }

  public getDialogConfirmDeleteButton() {
    return cy.getByDataTest(this.dialogSubmit);
  }
}
