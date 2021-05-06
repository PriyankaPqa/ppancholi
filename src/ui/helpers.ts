import moment from 'moment';
import VueI18n from 'vue-i18n';
import { ECanadaProvinces } from '../types/enums/ECanadaProvinces';
import { IBirthDate } from '../entities/value-objects/person/person.types';

export default {
  getEnumKeys(myEnum: Record<string, unknown>) {
    return Object.keys(myEnum).filter((key) => Number.isNaN(Number(key)));
  },

  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string, i18n: VueI18n = null) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{value: unknown; text: string}>;
    enumKeys.forEach((val) => {
      if (i18n) {
        data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
      } else {
        data.push({ value: myEnum[val], text: `${translationPath}.${val}` });
      }
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  getCanadianProvincesWithoutOther(i18n: VueI18n) {
    const allProvinces = this.enumToTranslatedCollection(ECanadaProvinces, 'common.provinces', i18n);
    return allProvinces.filter((p) => p.value !== ECanadaProvinces.OT);
  },

  // Return moment object of a birthdate, with proper index for the month
  getBirthDateMomentObject(birthdate: IBirthDate) {
    const year = birthdate.year as number;
    const month = birthdate.month as number;
    const day = birthdate.day as number;

    return moment({
      year,
      month: typeof month === 'number' ? month - 1 : 0,
      day,
    });
  },

  isValidCanadianPostalCode(value: string, errorMsg: string, errors: string[]): void {
    if (!value) return;

    // eslint-disable-next-line
    const regex = /^([a-zA-Z]\d[a-zA-Z]\s?\d[a-zA-Z]\d)$/;
    if (!regex.test(value)) errors.push(errorMsg);
  },

  getAge(birthDate: IBirthDate) {
    return moment().diff(moment({
      month: (birthDate.month as number) - 1,
      day: (birthDate.day as number),
      year: (birthDate.year as number),
    }), 'years');
  },

  displayBirthDate(birthDate: IBirthDate) {
    if (birthDate.year && birthDate.month && birthDate.day) {
      const birthdate = this.getBirthDateMomentObject(birthDate);
      return birthdate.format('ll');
    }
    return '';
  },

  openHelpCenterWindow(url: string, width = 500) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },
  // Check if one attributes has been added by user
  // Example : persistent or :persistent=true or :persistent=false for the dialog
  checkAttrs(componentAttributes: {[key: string]: string}, attributeName: string): boolean {
    if (Object.prototype.hasOwnProperty.call(componentAttributes, attributeName)) {
      return componentAttributes[attributeName] === '' || (componentAttributes[attributeName] as unknown as boolean);
    } return false;
  },

  formatBytes(bytes: number, decimals = 2, mode = 'bits') {
    if (bytes === 0) return '0 Bytes';
    const k = mode === 'bits' ? 1000 : 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / (k ** i)).toFixed(dm))} ${sizes[i]}`;
  },

  downloadCsv(csv: string, exportedFilename: string) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, exportedFilename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) { // feature detection
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', exportedFilename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  },

  /**
   * Returns a normalized string value (replaces accents and special characters)
   * Useful for comparing string
   * @param value The string to normalize
   */
  getNormalizedString(value: string) {
    if (!value) {
      return value;
    }

    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },

  scrollToFirstError(containerID: string) {
    const containerElement = document.getElementById(containerID);

    if (!containerElement) return;

    const errorElements = containerElement.getElementsByClassName('failed');

    if (errorElements.length > 0) {
      if (containerID === 'app') {
        window.scrollTo({
          top: (errorElements[0] as HTMLElement).offsetTop - 90,
          behavior: 'smooth',
        });
      } else {
        containerElement.scrollTo({
          top: (errorElements[0] as HTMLElement).offsetTop - 90,
          behavior: 'smooth',
        });
      }
    }
  },

  scrollToFirstErrorDialog(containerId: string) {
    const containerElement = document.getElementById(containerId);
    if (!containerElement) return;
    const errorElements = containerElement.getElementsByClassName('failed');
    if (errorElements.length > 0) {
      const scrollContainer = document.getElementsByClassName('content')[0];
      scrollContainer.scrollTo({
        top: (errorElements[0] as HTMLElement).offsetTop - 90,
        behavior: 'smooth',
      });
    }
  },
};
