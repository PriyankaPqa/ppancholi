// Add generic functions that are used in more than one place
import _forEach from 'lodash/forEach';
import { i18n } from '@/ui/plugins/i18n';
import moment from '@/ui/plugins/moment';
import { EBeneficiaryAuthenticationIdentityStatus, EPhoneTypes } from '@/types';
import PhoneNumber from 'awesome-phonenumber';

export default {
  // This function takes a enum in parameters and output a collection with [value: value of enum, text: the translation corresponding to the enum]
  getEnumKeys(myEnum) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },
  enumToTranslatedCollection(myEnum, translationPath) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [];
    _forEach(enumKeys, (val) => {
      data.push({ value: val, text: i18n.t(`${translationPath}.${val}`) });
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },
  openHelpCenterWindow(url, width) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },
  scrollToFirstErrorDialog(containerId) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) return;
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      const scrollContainer = document.getElementsByClassName('content')[0];
      scrollContainer.scrollTo({
        top: errorElements[0].offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },
  // Method to format the backend error messages and display in a toast.
  formatErrorMessages(errorDetailsList, errorStatusCode) {
    const errorMessageList = errorDetailsList.map((errorDetail) => i18n.t(`error.${errorDetail.messageKey}`, {
      x: errorStatusCode,
      y: errorDetail.errorCode,
    }));
    return errorMessageList.join('</br>');
  },
  scrollTop(containerID) {
    const containerElement = document.getElementById(containerID);
    if (!containerElement) return;
    let scrollContainer = containerElement;
    if (containerID === 'app') scrollContainer = window;
    scrollContainer.scrollTo({
      top: -100,
      behavior: 'smooth',
    });
  },
  scrollToFirstError(containerID) {
    const containerElement = document.getElementById(containerID);
    if (!containerElement) return;
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      let scrollContainer = containerElement;
      if (containerID === 'app') scrollContainer = window;
      scrollContainer.scrollTo({
        top: errorElements[0].offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },
  // Use '1994-12-31'
  getAge(birthDate) {
    if (typeof birthDate === 'string') {
      return Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e+10);
    }

    return moment().diff(moment({
      month: birthDate.month - 1,
      day: birthDate.day,
      year: birthDate.year,
    }), 'years');
  },
  birthDateObjToString(birthDate) {
    return `${birthDate.year}-${birthDate.month}-${birthDate.day}`;
  },
  convertBirthDateStringToObject(birthdate) {
    const bdayMoment = moment(birthdate);

    return {
      month: bdayMoment.month() + 1,
      day: bdayMoment.date(),
      year: bdayMoment.year(),
    };
  },
  downloadCSV(data, filename) {
    // Code to create the CSV file from the returned data
    const url = window.URL.createObjectURL(new Blob([data]));

    // Create a link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'export.csv');
    document.body.appendChild(link);

    // Tell the browser to click the link to trigger the download
    link.click();
  },
  // Check if one attributes has been added by user
  // Example : persistent or :persistent=true or :persistent=false for the dialog
  checkAttrs(componentAttributes, attributeName) {
    if (Object.prototype.hasOwnProperty.call(componentAttributes, attributeName)) {
      return componentAttributes[attributeName] === '' || (componentAttributes[attributeName]);
    }
    return false;
  },

  copyToClipBoard(link) {
    const el = document.createElement('textarea');
    el.value = link;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },
  /**
   * Get the color of the shield icon for identity verification status
   * @return {string}
   */
  getColorVerifyIdentity(beneficiary) {
    let color = '';
    if (beneficiary && beneficiary.identityVerification && beneficiary.identityVerification.status) {
      switch (beneficiary.identityVerification.status) {
        case EBeneficiaryAuthenticationIdentityStatus.Passed:
          color = 'status_success';
          break;
        case EBeneficiaryAuthenticationIdentityStatus.Failed:
          color = 'status_error';
          break;
        case EBeneficiaryAuthenticationIdentityStatus.NotVerified:
          color = 'grey darken-2';
          break;
        default:
          color = 'grey darken-2';
          break;
      }
    }
    return color;
  },

  // Return moment object of a birthdate, with proper index for the month
  getBirthDateMomentObject(birthdate) {
    const { year, month, day } = birthdate;
    return moment({
      year,
      month: typeof month === 'number' ? month - 1 : 0,
      day,
    });
  },

  // Normalize text to remove accents. Useful for searching/filtering French text
  normalizeString(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  /**
   Enhance the phoneData to be a validated Phone Object and inject phoneNumberType if passed
   */
  async enhancePhoneNumber(phoneData, type) {
    const enhancedPhoneNumber = phoneData ? new PhoneNumber(phoneData.number, phoneData.countryISO2) : null;
    return {
      e164Number: enhancedPhoneNumber ? await enhancedPhoneNumber.getNumber('e164') : '',
      number: enhancedPhoneNumber ? await enhancedPhoneNumber.getNumber('national') : '',
      countryISO2: enhancedPhoneNumber ? await enhancedPhoneNumber.getRegionCode() : 'CA',
      phoneNumberType: type ? EPhoneTypes[type] : null,
    };
  },
  /**
   Enhance the form data to turn null into string for any form input type that is string
   */
  async enhanceFormData(formData) {
    await Object.entries(formData).forEach(([key, value]) => {
      if (!value && formData[key] === 'string') {
        formData[key] = '';
      }
    });
  },
};
