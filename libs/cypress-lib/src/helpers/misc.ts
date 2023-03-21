/**
 *  get element containing toast message
 */

export function getToastMessage(message: string) {
  return cy.contains(`${message}`);
}
