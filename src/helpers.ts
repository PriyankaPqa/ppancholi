export default {
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
};
