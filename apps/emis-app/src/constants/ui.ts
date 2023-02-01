export const ui = {
  loading_open_delay: 1500, // If request take more than the value, loading will be displayed
  crc_assistance_number: '1 (800) 863-6582',
  vueEditorToolbarSettings: [
    [{ header: [false, 1, 2, 3, 4, 5, 6] }],
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] as string[] }, { background: [] as string[] }], // dropdown with defaults from theme
    ['link'],
    ['clean'], // remove formatting button
  ],
  vueEditorFullToolbarSettings: [ // not to be used, just gives an idea of capabilities
    [{ font: [] as string[] }],
    [{ header: [false, 1, 2, 3, 4, 5, 6] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [
      { align: '' },
      { align: 'center' },
      { align: 'right' },
      { align: 'justify' },
    ],
    [{ header: 1 }, { header: 2 }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ color: [] as string[] }, { background: [] as string[] }],
    ['link', 'image', 'video', 'formula'],
    [{ direction: 'rtl' }],
    ['clean'],
  ],
};
