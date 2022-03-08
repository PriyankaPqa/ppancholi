import { config } from 'dotenv';
import Authentication from '../models/utils/Authentication';
import LayoutModel from '../models/pages/Layout';
import PrivacyStatementModel from '../models/pages/PrivacyStatement';
import PersonalInformationModel from '../models/pages/PersonalInformation';
import { MyRequestHook } from '../models/utils/RequestHook';
import Addresses from '../models/pages/Addresses';

// When run in the pipeline will get correct URL
// When run locally, variable is from the script (see package.json)
config({ path: '.env.staging' });

const SITE_URL = `${process.env.VUE_APP_SITE_URL}/en/registration/recreate-index-event/individual`;

const myHook = new MyRequestHook([/api-dev.crc-tech.ca/]);

fixture('Getting Started')
  .page(SITE_URL)
  .requestHooks(myHook);

test('Get an access token', async (t) => {
  await Authentication.login();
  await t.expect(Authentication.accessToken).notEql(undefined);
});

test('Shortest path to register', async (t) => {
  await PrivacyStatementModel.clickCheckBox();

  await LayoutModel.goNext(); // Go to personal information

  await PersonalInformationModel.fill({
    firstName: 'Test User 1',
    lastName: 'Test User 1',
    genderIndex: 1,
    birthdateYear: 1995,
    birthdateMonth: 1,
    birthdateDay: 10,
    preferredLanguageIndex: 0,
    primarySpokenLanguageIndex: 0,
    homePhoneNumber: '438-555-0133',
  });

  await LayoutModel.goNext(); // Go to addresses

  await Addresses.homeAddress.clickCheckBox();

  await Addresses.temporaryAddress.setAddressType(6); // Unknown Address

  await LayoutModel.goNext(); // Go to household page

  await LayoutModel.goNext(); // Go to review page

  await LayoutModel.goNext(); // Submit registration

  t.expect(myHook.getRequest('household/households/public', 'POST').statusCode).eql(200);
});

test.skip('Register with addresses', async () => {
  await PrivacyStatementModel.clickCheckBox();

  await LayoutModel.goTo('privacyStatement');

  await PersonalInformationModel.fill({
    firstName: 'Mister',
    lastName: 'Test',
    genderIndex: 0,
    birthdateYear: 1520,
    birthdateMonth: 1,
    birthdateDay: 20,
    preferredLanguageIndex: 0,
    primarySpokenLanguageIndex: 0,
    homePhoneNumber: '438-555-0132',
  });

  await LayoutModel.goTo('addresses');

  await Addresses.homeAddress.fill({
    street: '123 test street',
    city: 'Paris',
    province: 'IDF',
    postalCode: '75000',
    countryName: 'France',
  });

  console.log(await Addresses.homeAddress.getCountry());
  console.log(await Addresses.homeAddress.getStreet());
  console.log(await Addresses.homeAddress.getProvince());

  await Addresses.temporaryAddress.fill({
    addressTypeIndex: 1,
    placeNumber: 'placeNumber',
    placeName: 'placeName',
    street: '155, rue Notre-Dame Est Montréal',
    city: 'Montreal',
    canadianProvinceIndex: 3,
    postalCode: 'H2Y1B5',
  });

  await LayoutModel.goTo('householdMembers');

  await LayoutModel.goTo('review');

  await LayoutModel.goNext(); // Submit registration
});
