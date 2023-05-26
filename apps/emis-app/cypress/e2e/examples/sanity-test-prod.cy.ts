/**
Test is not passing because the app does not trigger load event
Your page did not fire its `load` event within `60000ms`.
You can try increasing the `pageLoadTimeout` value in `cypress.config.ts` to wait longer.
Browsers will not fire the `load` event until all stylesheets and scripts are done downloading
* */

describe('After deployment', () => {
  before(() => {
    cy.loginProd();
    cy.visit('https://emis.crc-tech.ca/en/home');
  });
  it('should load the application correctly', () => {
    cy.contains('CRC TECH PROD');
  });
});
