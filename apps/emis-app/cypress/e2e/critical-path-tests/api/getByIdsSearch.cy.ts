/* eslint-disable no-debugger */
/* eslint-disable complexity */
/* eslint-disable max-depth */
/* eslint-disable no-console */
/* eslint-disable max-lines-per-function */
import { IEntity } from '@libs/entities-lib/base';
import { useProvider } from '../../../provider/provider';

interface domainSetup {
  name: string, parentId?: string, except?: (string | { path: string, fct: (getByIdObj: any, searchObj: any) => boolean })[], isEntityEndpoint?: boolean,
}
let accessTokenL6 = '';

const domains = [
  { name: 'approvalTables' },
  { name: 'caseFiles',
    except: [
      { path: 'entity.identityAuthentication.previousStatus', fct: (x: any, y: any) => x === 0 && y === null },
      { path: 'entity.consentInformation.privacyDateTimeConsent', fct: (x: any, y: any) => x && x.substr(0, 20) === y.substr(0, 20) },
      { path: 'entity.recoveryPlan.startDate', fct: (x: any, y: any) => `${x}Z` === y },
    ],
  },
  { name: 'caseFileNotes', parentId: 'caseFileId', except: [{ path: 'entity.updatedDate', fct: (x) => x === '0001-01-01T00:00:00' }] }, // BE doesnt put a default to UTC, this is irrelevant
  { name: 'caseFileReferrals', parentId: 'caseFileId' },
  { name: 'caseFileDocuments', parentId: 'caseFileId' },
  { name: 'events' },
  { name: 'teams' },
  { name: 'programs', parentId: 'eventId' },
  { name: 'households' },
  { name: 'persons',
isEntityEndpoint: true,
except: [
  'entity.currentAddress.eventId',
  'entity.currentAddress.id',
  'entity.currentAddress.tenantId',
  'entity.currentAddress.created',
  'entity.currentAddress.timestamp',
  'entity.currentAddress.status',
  'entity.currentAddress.createdBy',
  'entity.currentAddress.lastUpdatedBy',
  'entity.currentAddress.lastAction',
  'entity.currentAddress.lastActionCorrelationId',
  'entity.currentAddress.discriminator',
  'entity.currentAddress.etag',
  { path: 'entity.currentAddress.from', fct: (x: any, y: any) => x && x.replace('+00:00', 'Z') === y },
  { path: 'entity.currentAddress.to', fct: (x: any, y: any) => x && x.replace('+00:00', 'Z') === y },
  { path: 'entity.currentAddress.checkIn', fct: (x: any, y: any) => `${x}Z` === y },
  { path: 'entity.currentAddress.checkOut', fct: (x: any, y: any) => `${x}Z` === y },
    'entity.addressHistory.eventId',
    'entity.addressHistory.id',
    'entity.addressHistory.tenantId',
    'entity.addressHistory.created',
    'entity.addressHistory.timestamp',
    'entity.addressHistory.status',
    'entity.addressHistory.createdBy',
    'entity.addressHistory.lastUpdatedBy',
    'entity.addressHistory.lastAction',
    'entity.addressHistory.lastActionCorrelationId',
    'entity.addressHistory.discriminator',
    'entity.addressHistory.etag',
    { path: 'entity.addressHistory.from', fct: (x: any, y: any) => x && x.replace('+00:00', 'Z') === y },
    { path: 'entity.addressHistory.to', fct: (x: any, y: any) => x && x.replace('+00:00', 'Z') === y },
    { path: 'entity.addressHistory.checkIn', fct: (x: any, y: any) => `${x}Z` === y },
    { path: 'entity.addressHistory.checkOut', fct: (x: any, y: any) => `${x}Z` === y },
    { path: 'entity.identitySet.dateOfBirth', fct: (x: any, y: any) => `${x}Z` === y },
    { path: 'entity.contactInformation', fct: (x: any, y: any) => x == null && y?.preferredLanguage == null },
  ] },
  { name: 'financialAssistancePaymentsService',
    except: ['entity.revisedCreateDate',
    { path: 'entity.approvalStatusHistory.submittedBy.roleName', fct: (x: any, y: any) => x == null && !(y?.translation) },
    { path: 'entity.groups.paymentStatusHistory.userInformation.roleName', fct: (x: any, y: any) => x == null && !(y?.translation) }] },
  { name: 'financialAssistanceTables' },
  { name: 'userAccounts' },
  { name: 'massActions' },
  {
    name: 'assessmentForms',
    except: [{ path: 'entity.questions.answerChoices', fct: (x: any, y: any) => x == null && !(y?.length) },
    { path: 'entity.externalToolState', fct: (x: any, y: any) => x == null && !(y?.data.rawJson) },
    { path: 'entity.scoringRanges', fct: (x: any, y: any) => x == null && !(y?.length) },
    { path: 'entity.messageIfUnavailable', fct: (x: any, y: any) => x == null && !(y?.translation) },
  ],
  },
  { name: 'assessmentResponses', parentId: 'caseFileId' },
  { name: 'task', parentId: 'caseFileId', except: [{ path: 'entity.dueDate', fct: (x: any, y: any) => `${x}Z` === y }] },
] as domainSetup[];

const isObject = (object: any) => object != null && typeof object === 'object';

// eslint-disable-next-line max-params
const isEqualObjects = (searchObject: any, getByIdObject: any, domain: domainSetup = { name: 'dummy' }, currentPath: string = 'root') => {
  const searchObjectKeys = Object.keys(searchObject);
  const getByIdObjectKeys = Object.keys(getByIdObject).filter((key) => !domain?.except
    || !domain.except.find((x) => (typeof x === 'string' && `${currentPath}.${key}` === x)
        || (typeof x === 'object' && x.path === `${currentPath}.${key}` && x.fct(getByIdObject[key], searchObject[key]))));

  // getById object should not have more properties than search object
  if (getByIdObjectKeys.length > searchObjectKeys.length) {
    cy.log(`error comparing length of keys for ${domain.name} at path ${currentPath}`);
    console.log(`error comparing length of keys for ${domain.name} at path ${currentPath}`);
    return false;
  }

  for (const key of getByIdObjectKeys) {
    const path = !Number.isNaN(Number(key)) ? currentPath : `${currentPath}.${key}`;

    let value1 = searchObject[key];
    let value2 = getByIdObject[key];

    const isObjects = isObject(value1) && isObject(value2);

    // the value could be an array of objects, and they are not in the same order
    const isArrays = Array.isArray(value1) && Array.isArray(value2);
    if (isArrays) {
      if (value1.length !== value2.length) {
        return false;
      }
      const useId = value1[0]?.id && value2[0]?.id;
      value1 = typeof value1[0] === 'string'
        ? [...value1].sort()
        : [...value1].map((item) => ({ ...item, sortableKey: useId ? item.id : JSON.stringify(item) })).sort((a, b) => (a.sortableKey > b.sortableKey ? 1 : -1));
        value2 = typeof value1[0] === 'string'
        ? [...value1].sort()
        : [...value2].map((item) => ({ ...item, sortableKey: useId ? item.id : JSON.stringify(item) })).sort((a, b) => (a.sortableKey > b.sortableKey ? 1 : -1));

      for (let i = 0; i < value1.length; i += 1) {
        delete value1[i].sortableKey;
        delete value2[i].sortableKey;
        if (!isEqualObjects(value1[i], value2[i], domain, path)) {
          cy.log(`error comparing arrays for ${domain.name} at path ${path}`);
          console.log(`error comparing arrays for ${domain.name} at path ${path}`);
          return false;
        }
      }
    } else if ((isObjects && !isEqualObjects(value1, value2, domain, path)) || (!isObjects && value1 !== value2)) {
      cy.log(`error comparing object for ${domain.name} at path ${path}`);
      console.log(`error comparing object for ${domain.name} at path ${path}`);
      return false;
    }
  }
  return true;
};
// eslint-disable-next-line max-lines-per-function
describe(
  'Api testing',
  {
    env: {
      AZURE_TENANT_ID: Cypress.env('AZURE_DEV_TENANT_ID'),
      USER_6_MAIL: 'cypress@crc-tech.ca', // Need IDS to be on for this to work
    },
  },
  () => {
    before(() => {
      cy.getToken().then(async (tokenResponse) => {
        accessTokenL6 = tokenResponse.access_token;
      });
    });

    describe('Test comparison function isEqualObjects', () => {
      it('should be equal when two objects are the same and the order of properties is the same', () => {
        const searchObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        const getByIdObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(true);
      });

      it('should be equal when two objects are the same but the order of properties is different', () => {
        const searchObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        const getByIdObject = {
          c: 3,
          a: 1,
          b: 2,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(true);
      });

      it('should not be equal if the value dont match', () => {
        const searchObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        const getByIdObject = {
          a: 1,
          b: 2,
          c: 4,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(false);
      });

      it('should be true if searchObject has more properties than getByIdObject', () => {
        const searchObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        const getByIdObject = {
          a: 1,
          b: 2,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(true);
      });

      it('should be false if searchObject has more properties than getByIdObject but value dont match', () => {
        const searchObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        const getByIdObject = {
          a: 1,
          b: 99,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(false);
      });

      it('should be false if getByIdObject has more properties than searchObject', () => {
        const searchObject = {
          a: 1,
          b: 2,
        };
        const getByIdObject = {
          a: 1,
          b: 2,
          c: 3,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(false);
      });

      it('should be true if the value is an array but in different order', () => {
        const searchObject = {
          a: [
            {
              id: '123',
              value: 'abc',
            },
            {
              id: '456',
              value: 'xyz',
            },
          ],
          b: 2,
        };
        const getByIdObject = {
          a: [
            {
              id: '456',
              value: 'xyz',
            },
            {
              id: '123',
              value: 'abc',
            },
          ],
          b: 2,
        };
        expect(isEqualObjects(searchObject, getByIdObject)).eq(true);
      });
    });

    describe('Search API and getByIds return the same data', () => {
      for (const domain of domains) {
        it(`${domain.name}`, () => {
          cy.then(async () => {
            let searchResult = [] as any;
            let getByIdsResult = [] as any;
            let idObjects = [] as any;
            const provider = useProvider(accessTokenL6);
            const searchParams = {
              top: 200,
              searchMode: 'all',
              queryType: 'full',
              orderBy: domain.isEntityEndpoint ? 'Id' : 'Entity/Id',
            };

            let search;

            try {
              search = await provider[domain.name].search(searchParams);
            } catch (error) {
              // this is the old search endpoint - remove order By
              searchParams.orderBy = '';
              search = await provider[domain.name].search(searchParams);
            }
            searchResult = search?.value.map((item: any) => (domain.isEntityEndpoint ? item : item.entity)).sort((a: IEntity, b: IEntity) => (a.id > b.id ? 1 : -1));
            idObjects = searchResult?.map((entity: IEntity) => {
              if (domain.parentId) {
                return { id: entity.id, parentId: entity[domain.parentId] };
              }
              return { id: entity.id };
            });

            const promises = [] as Array<Promise<IEntity>>;
            idObjects.forEach(async (idObject: any) => {
              const params = domain.parentId ? { id: idObject.id, [domain.parentId]: idObject.parentId } : idObject.id;
              const getById = provider[domain.name].get(params);
              promises.push(getById);
            });
            getByIdsResult = await Promise.all(promises);
            getByIdsResult.sort((a: IEntity, b: IEntity) => (a.id > b.id ? 1 : -1));

            for (let index = 0; index < searchResult.length; index += 1) {
                if (!isEqualObjects(searchResult[index], getByIdsResult[index], domain, 'entity')) {
                  throw new Error(`${domain.name} search endpoint and getByIds return different data
                      from search: ${JSON.stringify(searchResult[index])}
                      from get: ${JSON.stringify(getByIdsResult[index])}
                  `);
                }
              }
              cy.log(`Successfully test ${domain.name} search endpoint and getByIds`);
          });
        });
      }
        });
      },
);
