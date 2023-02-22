import { CaseFileActivityPage } from './caseFileActivity.page';
import { SplitHouseholdMemberPage } from './splitHouseholdMember.page';

export enum DataTest {
  caseFileNumber = 'household_profile_case_file_number',
  splitMember = 'household_profile_member_action_btn_transfer',
  memberName = 'household_profile_member_display_name',
  dateOfBirth = 'household_profile_member_info_data_date_of_birth',
  gender = 'household_profile_member_info_data_gender',
  registrationNumber = 'registrationNumber',
}

export class HouseholdProfilePage {
  private caseFileNumber = { selector: DataTest.caseFileNumber };

  private splitMember = { selector: DataTest.splitMember };

  private memberName = { selector: DataTest.memberName };

  private registrationNumber = { selector: DataTest.registrationNumber };

  private dateOfBirth = { selector: DataTest.dateOfBirth };

  private gender = { selector: DataTest.gender };

  public getCaseFileNumber() {
    return cy.getByDataTest(this.caseFileNumber).invoke('text').then((text) => text.trim());
  }

  public goToCaseFileActivityPage() {
    cy.getByDataTest(this.caseFileNumber).click();
    return new CaseFileActivityPage();
  }

  public selectMemberToSplit(index = 0) {
    cy.getByDataTest(this.splitMember).eq(index).click();
    return new SplitHouseholdMemberPage();
  }

  public getSplitIcon() {
    return cy.getByDataTest(this.splitMember);
  }

  public getFullNameOfMember(index: number) {
    return cy.getByDataTestLike(this.memberName).eq(index).invoke('text').then((text) => text.trim());
  }

  public getRegistrationNumber() {
    return cy.getByDataTest(this.registrationNumber).invoke('text').then((text) => text.trim());
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
    return cy.getByDataTest(this.gender).each(($el) => {
      const genderText = $el.text().trim();
      genderArray.push(genderText);
    }).then(() => genderArray);
  }
}
