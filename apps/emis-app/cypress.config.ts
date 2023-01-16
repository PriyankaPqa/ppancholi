import { defineConfig } from 'cypress';

require('tsconfig-paths').register();

export default defineConfig({
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'reporter-config.json',
  },
  projectId: 'ct8tm8',
  e2e: {
    baseUrl: 'http://localhost:8080/',
    env: {
      AZURE_CLIENT_ID: '44dc9a29-39d1-462e-9cbe-b9507b34396d',
      AZURE_TENANT_ID: '56f61c9c-0a6f-4be2-954d-941c9f02cb4c',
      AZURE_CLIENT_SECRET: 'VwNQd7XbIYrV7stj58oiaKKHKphkjiw7KS',
      MSAL_API_SCOPES: 'https://crctechmain.onmicrosoft.com/emis-dev/api/api_access',
      API_BASE_URL: 'https://api-dev.crc-tech.ca',
      USER_1_MAIL: 'testdev1@crctechtesting.onmicrosoft.com',
      USER_1_PASSWORD: 'I#cWVAo*EqA6',
      USER_2_MAIL: 'testdev2@crctechtesting.onmicrosoft.com',
      USER_2_PASSWORD: 'I#cWVAo*EqA6',
      USER_3_MAIL: 'testdev3@crctechtesting.onmicrosoft.com',
      USER_3_PASSWORD: 'I#cWVAo*EqA6',
      USER_4_MAIL: 'TestDev4@crctechtesting.onmicrosoft.com',
      USER_4_PASSWORD: 'I#cWVAo*EqA6',
      USER_5_MAIL: 'TestDev5@crctechtesting.onmicrosoft.com',
      USER_5_PASSWORD: 'I#cWVAo*EqA6',
      USER_6_MAIL: 'TestDev6@crctechtesting.onmicrosoft.com',
      USER_6_PASSWORD: 'I#cWVAo*EqA6',
      USER_NO_ROLE_MAIL: 'TestDevNorole@crctechtesting.onmicrosoft.com',
      USER_NO_ROLE_PASSWORD: 'I#cWVAo*EqA6',
      CONTRIBUTOR1_EMAIL: 'Contributor1@crctechtesting.onmicrosoft.com',
      CONTRIBUTOR1_PASSWORD: 'I#cWVAo*EqA6',
      CONTRIBUTOR2_EMAIL: 'Contributor2@crctechtesting.onmicrosoft.com',
      CONTRIBUTOR2_PASSWORD: 'I#cWVAo*EqA6',
      CONTRIBUTOR3_EMAIL: 'Contributor3@crctechtesting.onmicrosoft.com',
      CONTRIBUTOR3_PASSWORD: 'I#cWVAo*EqA6',
      USER_READ_ONLY: 'TestDevReadOnly@crctechtesting.onmicrosoft.com',
      USER_READ_ONLY_PASSWORD: 'I#cWVAo*EqA6',

      AZURE_CLIENT_ID_PROD: '2c1c2029-0580-4b75-b578-c12172ad3ce2',
      AZURE_TENANT_ID_PROD: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
      AZURE_CLIENT_SECRET_PROD: 'RgmDKGXuW05Oc7FbInACuouz7FcAs_au4.',
      MSAL_API_SCOPES_PROD: 'https://crctechmain.onmicrosoft.com/emis-prod/api/api_access',
      USER_PROD: 'testsix@crctechmain.onmicrosoft.com',
      USER_PROD_PASSWORD: 'QAEMIS1!',
    },
  },
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 8000, // Time, in milliseconds, to wait until most DOM based commands are considered timed out.
  pageLoadTimeout: 80000, // Time, in milliseconds, to wait for page transition events or cy.visit(), cy.go(), cy.reload() commands to fire their page load events.
});
