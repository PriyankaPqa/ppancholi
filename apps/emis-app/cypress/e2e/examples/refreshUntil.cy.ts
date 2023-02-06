describe('Refresh until', () => {
  before(() => {
    cy.login();
    cy.goTo('home');
  });
  it('should refresh the page until a element is displayed', () => {
    const options = { timeout: 8000, interval: 4000, waitAfterRefresh: 5000 };
    const selector = 'a[data-test="eventDetail-link_test-auto-event-56HS7-2023-02-03-22-09-31"]';
    cy.refreshUntil(selector, options);
    cy.getByDataTest({ selector: 'eventDetail-link_test-auto-event-56HS7-2023-02-03-22-09-31', type: 'a' }).should('exist');
  });
});
