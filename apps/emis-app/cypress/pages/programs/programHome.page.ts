import { EditProgramPage } from './editProgram.page';

export enum DataTest {
  programTable = 'programs-table',
  programEdit = 'editProgram-link',
  }

  export class ProgramHomePage {
    private programTable = { selector: DataTest.programTable };

    private programEdit = { selector: DataTest.programEdit };

    public getProgramTable() {
      return cy.getByDataTest(this.programTable);
    }

    public editProgram() {
      cy.getByDataTest(this.programEdit).click();
      return new EditProgramPage();
    }
  }
