import { CreateTeamTaskPage } from './createTeamTask.page';

export enum DataTest {
  tableTitle = 'table_title',
  createTask = 'task-table-create-task-button',
  createNewTeamTask = 'create-team-task-link',
  createNewPersonalTask = 'create-personal-task-link',
}

export class TasksHomePage {
  private createTask = { selector: DataTest.createTask, type: 'button' };

  private tableTitle = { selector: DataTest.tableTitle };

  private createNewTeamTask = { selector: DataTest.createNewTeamTask };

  private createNewPersonalTask = { selector: DataTest.createNewPersonalTask };

  public getTableTitleElement() {
    return cy.getByDataTest(this.tableTitle);
  }

  public getCreateTaskButton() {
    return cy.getByDataTest(this.createTask);
  }

  public getCreateNewTeamTaskOption() {
    return cy.getByDataTest(this.createNewTeamTask);
  }

  public addNewTeamTask() {
    cy.getByDataTest(this.createNewTeamTask).click();
    return new CreateTeamTaskPage();
  }

  public getCreateNewPersonalTaskOption() {
    return cy.getByDataTest(this.createNewPersonalTask);
  }
}
