import { i18n } from '@/ui/plugins/i18n';

export default {
  // Method to format the backend error messages and display in a toast.
  formatErrorMessages(errorDetailsList: Array<Record<string, unknown>>, errorStatusCode: number) {
    const errorMessageList = errorDetailsList.map((errorDetail) => i18n.t(`error.${errorDetail.messageKey}`, {
      x: errorStatusCode,
      y: errorDetail.errorCode,
    }));
    return errorMessageList.join('</br>');
  },

  // Method to open a window on the right side of the screen
  openWindowRightSide(url: string, width: number) {
    const popupWidth = width;
    const leftPos = window.innerWidth - popupWidth;
    window.open(
      url,
      'helpCenter',
      `directories=no, titlebar=no, toolbar=no, location=no, status=no,
      menubar=no, scrollbars=yes, resizable=yes ,width=${popupWidth}, height=1040, top=0, left=${leftPos}`,
    );
  },

  // This function takes a enum in parameters and output a collection with [value: value of enum, text: the translation corresponding to the enum]
  getEnumKeys(myEnum: Record<string, unknown>) {
    // eslint-disable-next-line radix
    return Object.keys(myEnum).filter((x) => !(parseInt(x, 0) >= 0));
  },

  enumToTranslatedCollection(myEnum: Record<string, unknown>, translationPath: string) {
    const enumKeys = this.getEnumKeys(myEnum);
    const data = [] as Array<{value: unknown, text: string}>;
    enumKeys.forEach((val) => {
      data.push({ value: myEnum[val], text: i18n.t(`${translationPath}.${val}`).toString() });
    });
    return data.sort((a, b) => a.text.localeCompare(b.text));
  },

  copyToClipBoard(value: string) {
    const el = document.createElement('textarea');
    el.value = value;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },
};
