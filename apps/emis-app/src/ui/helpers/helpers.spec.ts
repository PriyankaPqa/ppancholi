/* eslint-disable max-len */
import { dateTypes } from '@/constants/dateTypes';
import { UserRoles } from '@libs/entities-lib/user';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { createLocalVue } from '@/test/testSetup';
import { mockOptionItem } from '@libs/entities-lib/optionItem';
import helpers from './helpers';
import { i18n } from '../plugins';

describe('>>>> helpers', () => {
  describe('getLocalStringDate', () => {
    it('returns the date without considering time zone if passed a preformatted date', () => {
      const res = helpers.getLocalStringDate('2010-02-03', dateTypes.static[0], 'yyyy-MM-dd HH:mm');
      expect(res).toBe('2010-02-03 00:00');
    });

    it('returns the date formatted when passed a new Date of a type we want to convert to local', () => {
      const d = new Date();
      let res = helpers.getLocalStringDate(d, dateTypes.convertToLocal[0], 'yyyy-MM-dd HH:mm');
      expect(res).toBe(format(d, 'yyyy-MM-dd HH:mm'));

      // Entity.created is a timestamp that we always want to display as local - here it is an example of how it would be called normally
      res = helpers.getLocalStringDate(d, 'Entity.created', 'yyyy-MM-dd HH:mm');
      expect(res).toBe(format(d, 'yyyy-MM-dd HH:mm'));
    });

    it('returns the date considering UTC formatted when passed a static date', () => {
      const d = new Date();
      let res = helpers.getLocalStringDate(d, dateTypes.static[0], 'yyyy-MM-dd HH:mm');
      expect(res).toBe(format(utcToZonedTime(d, 'UTC'), 'yyyy-MM-dd HH:mm'));

      // EventSchedule.scheduledCloseDate is a static date (ie: we've stored as midnight UTC)- here it is an example of how it would be called normally
      res = helpers.getLocalStringDate(new Date('2021-10-01T00:00:00.000Z'), 'EventSchedule.scheduledCloseDate', 'yyyy-MM-dd HH:mm');
      expect(res).toBe('2021-10-01 00:00');
    });
  });

  describe('decodeJwt', () => {
    it('decodes a valid Jwt', () => {
      // eslint-disable-next-line vue/max-len
      const result = helpers.decodeJwt('eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imwzc1EtNTBjQ0g0eEJWWkxIVEd3blNSNzY4MCJ9.eyJhdWQiOiI0NGRjOWEyOS0zOWQxLTQ2MmUtOWNiZS1iOTUwN2IzNDM5NmQiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vYzQwMGY1MGQtN2E1Ni00ZWYyLThlNDQtMjExYmZhNDM0NzI0L3YyLjAiLCJpYXQiOjE2MzgzOTA3NjMsIm5iZiI6MTYzODM5MDc2MywiZXhwIjoxNjM4Mzk2Mzc1LCJhaW8iOiJBWlFBYS84VEFBQUFkbDltZGRoQTZjV3NOK1RaSktQazM5dFFHeHlJbHV6djRNa3N1UGVFemNNMnl5QlRwNVo0YSs0WTFZZlBFTmRoZStwRVVncmpyV1pFNUM1N0psRDc3c0E0YWtvQ2ZTdnlZSDVQa3RPSmppTnlPRDUxeTZiR2pRTUJOZ3VlOXlYZEpQT0FJd3VpOXNZNUtwZENZQS9TRi8yM0JFV1JjR0lXcEdqU2NsNUh1Tmxjc2pmbjJjN0pVTkRFajA4NnFVVTMiLCJhenAiOiIwMzBlNWEzMi1iNmVmLTQ5MjctOTRiYS03NGQ5MWVhYTI1MWUiLCJhenBhY3IiOiIwIiwibmFtZSI6Ik1hcmMtQW5kcsOpIERlc2Now6puZXMiLCJvaWQiOiIwZDIyZjUwYS1lMWFiLTQzNWQtYTlmMC1jZmRhNTAyODY2ZjQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJtYWRlc2NoZW5lc0BjcmN0ZWNobWFpbi5vbm1pY3Jvc29mdC5jb20iLCJyaCI6IjAuQVgwQURmVUF4Rlo2OGs2T1JDRWIta05ISkRKYURnUHZ0aWRKbExwMDJSNnFKUjU5QUo4LiIsInJvbGVzIjpbImxldmVsMyJdLCJzY3AiOiJhcGlfYWNjZXNzIiwic3ViIjoiWHVuR2tpR3BFRndObU9qUFdOeFBFdnhhdHM3RzNNN2stc0wyc2IzUTNqNCIsInRpZCI6ImM0MDBmNTBkLTdhNTYtNGVmMi04ZTQ0LTIxMWJmYTQzNDcyNCIsInV0aSI6Im9jYTMtcHl5cUV5eklvY0JINl9zQWciLCJ2ZXIiOiIyLjAifQ.WjnWExYS9vepYnmNBvE8R02jA20SAEzR3OIPfA_AWcszg4MgOI7xSo8HMg_mbph_2CAbSRsgLAZxLXKaDTvN4hidT4uAa_G8Cd04Exc2C4e31PKIhoWgl7ftOMzh8a5L0Mv1v0B1vCfFd9Q4_7wn2DbruGEDFgviCS5IICs88vM6j92ucWNzHbhUOrciHtsX0_Hh7DO4y8-mZ5TOthZbJALQ9RmhcNjGjH3ywVtvyIo0x9eFvbCnFu7xweVyuNuEuwocmVr_WZy8pIbt7tGIAtFnNccRsKOOA4Rx4dmjN5JqRvFtv6Lz8SgmfYiZa6VmZvukoC-i0PQozv280qA2AQ');
      expect(result).toEqual({
        aud: '44dc9a29-39d1-462e-9cbe-b9507b34396d',
        iss: 'https://login.microsoftonline.com/c400f50d-7a56-4ef2-8e44-211bfa434724/v2.0',
        iat: 1638390763,
        nbf: 1638390763,
        exp: 1638396375,
        // eslint-disable-next-line vue/max-len
        aio: 'AZQAa/8TAAAAdl9mddhA6cWsN+TZJKPk39tQGxyIluzv4MksuPeEzcM2yyBTp5Z4a+4Y1YfPENdhe+pEUgrjrWZE5C57JlD77sA4akoCfSvyYH5PktOJjiNyOD51y6bGjQMBNgue9yXdJPOAIwui9sY5KpdCYA/SF/23BEWRcGIWpGjScl5HuNlcsjfn2c7JUNDEj086qUU3',
        azp: '030e5a32-b6ef-4927-94ba-74d91eaa251e',
        azpacr: '0',
        name: 'Marc-André Deschênes',
        oid: '0d22f50a-e1ab-435d-a9f0-cfda502866f4',
        preferred_username: 'madeschenes@crctechmain.onmicrosoft.com',
        rh: '0.AX0ADfUAxFZ68k6ORCEb-kNHJDJaDgPvtidJlLp02R6qJR59AJ8.',
        roles: [
          UserRoles.level3,
        ],
        scp: 'api_access',
        sub: 'XunGkiGpEFwNmOjPWNxPEvxats7G3M7k-sL2sb3Q3j4',
        tid: 'c400f50d-7a56-4ef2-8e44-211bfa434724',
        uti: 'oca3-pyyqEyzIocBH6_sAg',
        ver: '2.0',
      });
    });
  });

  describe('getEnumKeysAndText', () => {
    it('should return display and enum keys of the enum in an array', () => {
      jest.spyOn(i18n, 't').mockImplementation((key) => key);

      enum Test {
        A = '0',
        Z = '1',
        B = '3',
      }
      const res = helpers.getEnumKeysAndText(Test, 'somekeyprefix');
      expect(res).toEqual([
        { value: 'A', text: 'somekeyprefix.A', dataTest: 'A' },
        { value: 'B', text: 'somekeyprefix.B', dataTest: 'B' },
        { value: 'Z', text: 'somekeyprefix.Z', dataTest: 'Z' },
      ]);
    });
  });

  describe('getEnumValues', () => {
    it('should return values of the enum in an array', () => {
      enum Test {
        A = 0,
        B = 1,
      }
      const res = helpers.getEnumValues(Test);
      expect(res).toEqual([0, 1]);
    });
  });

  describe('toQuickSearch', () => {
    it('returns with sanitized quickSearch', () => {
      expect(helpers.toQuickSearch('[search')).toEqual('((/.*%5C%5Bsearch.*/ OR "\\"%5C%5Bsearch\\""))');
      expect(helpers.toQuickSearch('moépìstöè')).toEqual('((/.*moepistoe.*/ OR "\\"moepistoe\\""))');
    });

    it('sets azureSearchParams.search with quickSearch split by space', () => {
      expect(helpers.toQuickSearch('search test')).toEqual('((/.*search.*/ OR "\\"search\\"") AND (/.*test.*/ OR "\\"test\\""))');
    });
  });

  describe('toQuickSearchSql', () => {
    it('sets text from quickSearch split by space', () => {
      expect(helpers.toQuickSearchSql('search test')).toEqual(
        { and: [{ 'metadata/searchableText': { contains: 'search' } }, { 'metadata/searchableText': { contains: 'test' } }] },
      );
      expect(helpers.toQuickSearchSql('search test', 'field')).toEqual(
        { and: [{ field: { contains: 'search' } }, { field: { contains: 'test' } }] },
      );
    });
  });

  describe('availableItems', () => {
    it('returns items with no level', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
        },
        {
          to: 'routes.caseFile.home.name',
          icon: 'mdi-clipboard-text',
          text: 'leftMenu.caseFiles_title',
          test: 'caseFile',
        },
      ];

      const localVue = createLocalVue();
      expect(helpers.availableItems(localVue.prototype, items as any)).toEqual(items);
    });

    it('returns items for which user has the proper level', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level1,
        },
        {
          to: 'routes.caseFile.home.name',
          icon: 'mdi-clipboard-text',
          text: 'leftMenu.caseFiles_title',
          test: 'caseFile',
          level: UserRoles.level6,
        },
      ];

      const localVue = createLocalVue();
      localVue.prototype.$hasLevel = (lvl: string) => lvl === UserRoles.level1;
      localVue.prototype.$hasRole = () => false;
      expect(helpers.availableItems(localVue.prototype, items)).toEqual([items[0]]);
    });

    it('passes the strictLevel property', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level1,
          strictLevel: true,
        },
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level1,
        },
      ];

      const localVue = createLocalVue();
      localVue.prototype.$hasLevel = (_: string, strict: boolean) => strict === true;
      localVue.prototype.$hasRole = () => false;
      expect(helpers.availableItems(localVue.prototype, items)).toEqual([items[0]]);
    });

    it('returns items for which user has the proper role', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level1,
        },
        {
          to: 'routes.caseFile.home.name',
          icon: 'mdi-clipboard-text',
          text: 'leftMenu.caseFiles_title',
          test: 'caseFile',
          level: UserRoles.level6,
          roles: [UserRoles.contributorIM],
        },
      ];

      const localVue = createLocalVue();
      localVue.prototype.$hasLevel = () => false;
      localVue.prototype.$hasRole = (lvl: string) => lvl === UserRoles.contributorIM;
      expect(helpers.availableItems(localVue.prototype, items)).toEqual([items[1]]);
    });

    it('does not return items with feature disabled', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level6,
          roles: [UserRoles.contributorIM],
          feature: 'feature',
        },
      ];
      const localVue = createLocalVue();
      localVue.prototype.$hasLevel = () => true;
      localVue.prototype.$hasRole = () => true;
      localVue.prototype.$hasFeature = () => false;
      expect(helpers.availableItems(localVue.prototype, items)).toEqual([]);
    });

    it('returns items with feature enabled', () => {
      const items = [
        {
          to: 'routes.home.name',
          icon: 'mdi-home',
          text: 'leftMenu.home_title',
          test: 'home',
          level: UserRoles.level6,
          roles: [UserRoles.contributorIM],
          feature: 'feature',
        },
      ];
      const localVue = createLocalVue();
      localVue.prototype.$hasLevel = () => true;
      localVue.prototype.$hasRole = () => true;
      localVue.prototype.$hasFeature = () => true;
      expect(helpers.availableItems(localVue.prototype, items)).toEqual(items);
    });
  });

  describe('getOptionItemNameFromListOption', () => {
    it('returns the localized name  of the option item corresponding to the list option, if the list option has no specifiedOther', () => {
      const listOption = { optionItemId: 'mock-id', specifiedOther: null as string };
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const optionItemList = [mockOptionItem({ name: name1, id: 'mock-id' }), mockOptionItem({ name: name2, id: 'random-id' })];
      i18n.locale = 'fr';
      expect(helpers.getOptionItemNameFromListOption(optionItemList, listOption)).toEqual('name-1-fr');
    });

    it('returns the specify other name of the list option, if the list option has a specifiedOther', () => {
      const listOption = { optionItemId: 'mock-id', specifiedOther: 'specified-name' };
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const optionItemList = [mockOptionItem({ name: name1, id: 'mock-id' }), mockOptionItem({ name: name2, id: 'random-id' })];
      i18n.locale = 'fr';
      expect(helpers.getOptionItemNameFromListOption(optionItemList, listOption)).toEqual('specified-name');
    });

    it('return null if arguments are missing', () => {
      const listOption = { optionItemId: 'mock-id', specifiedOther: 'specified-name' };
      const name1 = { translation: { en: 'name-1-en', fr: 'name-1-fr' } };
      const name2 = { translation: { en: 'name-2-en', fr: 'name-2-fr' } };
      const optionItemList = [mockOptionItem({ name: name1, id: 'mock-id' }), mockOptionItem({ name: name2, id: 'random-id' })];
      expect(helpers.getOptionItemNameFromListOption(null, listOption)).toEqual(null);
      expect(helpers.getOptionItemNameFromListOption(optionItemList, null)).toEqual(null);
    });
  });

  describe('isMinorOrMajorVersionBump', () => {
    it('returns false if the current and new version do not have the appropriate format', () => {
      expect(helpers.isMinorOrMajorVersionBump('a', 'b')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.0', '2.0')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('', '')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.2.3', '1.2.3.5')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.2.3', 'a.b.c')).toBeFalsy();
    });
    it('returns false if the new and current version are the same', () => {
      expect(helpers.isMinorOrMajorVersionBump('1.2.3', '1.2.3')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.30.10', '1.30.10')).toBeFalsy();
    });
    it('returns false if the new version does not have a minor version bump', () => {
      expect(helpers.isMinorOrMajorVersionBump('1.0.0', '1.0.1')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.0.70', '1.0.5')).toBeFalsy();
      expect(helpers.isMinorOrMajorVersionBump('1.0.5', '1.0.70')).toBeFalsy();
    });
    it('returns false if the new version has a higher minor version but a lower major version', () => {
      expect(helpers.isMinorOrMajorVersionBump('2.0.1', '1.20.1')).toBeFalsy();
    });
    it('returns true if the new version has a higher major version ', () => {
      expect(helpers.isMinorOrMajorVersionBump('1.7.100', '1.15.0')).toBeTruthy();
    });
    it('returns true if the new version has a higher minor version ', () => {
      expect(helpers.isMinorOrMajorVersionBump('5.70.100', '10.15.0')).toBeTruthy();
    });
  });
});
