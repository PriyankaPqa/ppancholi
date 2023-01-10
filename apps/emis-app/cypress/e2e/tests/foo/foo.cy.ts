describe('Test', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('home');
  });
  it('should run', () => {
      cy.getByDataTest({ selector: 'right-menu-trigger', type: 'button' })
        .should('be.visible')
        .click();

      cy.getByDataTest({ selector: 'rightMenu__avatar', type: 'div' }).should('be.visible');
  });
});
