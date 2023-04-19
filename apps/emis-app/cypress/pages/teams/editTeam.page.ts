import { AddNewTeamMemberPage } from './addNewTeamMember.page';

export enum DataTest {
  memberAdd = 'add-new-member',
  memberRemove = 'remove_team_member_',
  memberName = 'teamMembers__member_name',
}

export class EditTeamPage {
  private memberAdd = { selector: DataTest.memberAdd };

  private memberName = { selector: DataTest.memberName };

  public addNewMember() {
    cy.getByDataTest(this.memberAdd).click();
    return new AddNewTeamMemberPage();
  }

  public getTeamMemberName() {
    return cy.getByDataTest(this.memberName);
  }
}
