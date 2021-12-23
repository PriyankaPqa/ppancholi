import generalHelper from './general/general';
import addressHelper from './address/address';
import birthdateHelper from './birthdate/birthdate';

export default {
  ...generalHelper,
  ...addressHelper,
  ...birthdateHelper,
};
