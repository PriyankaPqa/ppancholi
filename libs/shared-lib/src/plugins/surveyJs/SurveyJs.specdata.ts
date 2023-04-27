/* eslint-disable max-lines */
/* eslint-disable max-len */
/* eslint-disable vue/max-len */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { IExtractedSurveyObject } from './SurveyJsTextExtractor';

export class surveyData {
  static textQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'question1',
            title: {
              default: 'Text eng',
              fr: 'Text fr',
            },
            score: 1,
          },
        ],
      },
    ],
  });

  static textAnswers = {
    question1: 'test text',
  };

  static panelDynamicTranslatedFrenchEnglishDefault = JSON.stringify({
    logo: {
     default: 'https://api-dev.crc-tech.ca//system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
     fr: 'https://api-dev.crc-tech.ca//system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
     {
      name: 'page1',
      elements: [

    {
      type: 'paneldynamic',
      name: 'Complete the following for each of your children:',
      visibleIf: "{Do you have children?} = 'yes'",
      title: {
       fr: 'Si vous avez des enfants, remplissez ce qui suit :',
      },
      isRequired: true,
      templateElements: [
       {
        type: 'multipletext',
        name: 'What is the name of the school attended by each of your children?',
        title: {
         fr: 'Complétez ce qui suit pour chacun de vos enfants',
        },
        isRequired: true,
        items: [
         {
          name: "Child's name:",
          title: {
           fr: "Nom de l'enfant :",
          },
         },
         {
          name: "School's name:",
          title: {
           fr: "Nom de l'école :",
          },
         },
        ],
       },
      ],
      panelCount: 1,
      panelAddText: {
       default: 'Add additional child',
       fr: "Ajouter d'autres",
      },
     }],
    },
   ],
   clearInvisibleValues: 'onHiddenContainer',
  });

  static questionsTranslatedFrenchEglishDefault = JSON.stringify({
    logo: {
     default: 'https://api-dev.crc-tech.ca//system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
     fr: 'https://api-dev.crc-tech.ca//system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
     {
      name: 'page1',
      elements: [
       {
        type: 'radiogroup',
        name: 'Where do you reside.',
        title: {
         fr: 'Où résidez vous',
        },
        choices: [
         'Gatineau',
         {
          value: 'Other',
          text: {
           default: 'Other',
           fr: 'Autre',
          },
         },
        ],
        showOtherItem: true,
       },
      ],
     },
    ],
    clearInvisibleValues: 'onHiddenContainer',
   });

  static checkboxQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'checkbox',
            name: 'question1',
            title: {
              default: 'Text eng',
              fr: 'Text fr',
            },
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'item 1 en',
                  fr: 'item 1 fr',
                },
                score: 1,
              },
              {
                value: 'item2',
                text: {
                  default: 'item 2 en',
                  fr: 'item 2 fr',
                },
                score: 2,
              },
              'item3',
            ],
            hasOther: true,
            hasNone: true,
            otherText: {
              default: 'Other (describe) en',
              fr: 'other fr',
            },
          },
        ],
      },
    ],
  });

  static checkboxAnswers = {
    question1: [
      'other',
      'item2',
    ],
    'question1-Comment': 'test',
  };

  static checkboxAnswersNoComment = {
    question1: [
      'other',
      'item2',
    ],
  };

  static checkboxAnswersNone = {
    question1: [
      'none',
    ],
  };

  static radiogroupQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'radiogroup',
            name: 'question1',
            title: {
              default: 'Text eng',
              fr: 'Text fr',
            },
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'item 1 en',
                  fr: 'item 1 fr',
                },
                score: 1,
              },
              {
                value: 'item2',
                text: {
                  default: 'item 2 en',
                  fr: 'item 2 fr',
                },
                score: 2,
              },
              'item3',
            ],
            hasOther: true,
            hasNone: true,
          },
        ],
      },
    ],
  });

  static radiogroupAnswers = {
    question1: 'other',
    'question1-Comment': 'test',
  };

  static dropdownQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'dropdown',
            name: 'question1',
            title: {
              default: 'Text eng',
              fr: 'Text fr',
            },
            hasComment: true,
            commentText: {
              default: 'zzz',
              fr: 'xxx',
            },
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'item 1 en',
                  fr: 'item 1 fr',
                },
                score: 1,
              },
              {
                value: 'item2',
                text: {
                  default: 'item 2 en',
                  fr: 'item 2 fr',
                },
                score: 2,
              },
              'item3',
            ],
            hasNone: true,
            noneText: 'Nonez',
            choicesMin: 1,
            choicesMax: 5,
            choicesStep: 2,
          },
        ],
      },
    ],
  });

  static dropdownAnswer = {
    question1: 1,
    'question1-Comment': 'zzzzzz',
  };

  static commentQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'comment',
            name: 'question1',
          },
        ],
      },
    ],
  });

  static commentAnswer = {
    question1: 'fdgdfg\nfdfkdjhgkf\n\n\nfdgdfgdf',
  };

  static booleanQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'boolean',
            name: 'question1',
            title: {
              default: 'dddd',
              fr: 'xxx',
            },
            scoreTrue: 1,
            scoreFalse: 2,
            labelTrue: {
              default: 'why yes',
              fr: 'ouiii',
            },
            valueTrue: '123',
          },
        ],
      },
    ],
  });

  static booleanAnswer = {
    question1: '123',
  };

  static booleanAnswerNo = {
    question1: false,
  };

  static yesnoQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'yes-no',
            name: 'question1',
            title: {
              default: 'dddd',
              fr: 'xxx',
            },
            scoreFalse: 12,
            scoreTrue: -5,
          },
        ],
      },
    ],
  });

  static yesnoAnswer = {
    question1: 'yes',
  };

  static yesnoAnswerNo = {
    question1: 'no',
  };

  static htmlQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'html',
            name: 'question1',
            title: {
              default: 'dddd',
              fr: 'xxx',
            },
            html: 'hello',
          },
        ],
      },
    ],
  });

  static htmlAnswer = {};

  static imageQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'image',
            name: 'question4',
            imageLink: 'https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg',
          },
        ],
      },
    ],
  });

  static imageAnswer = {};

  static multipleTextQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'multipletext',
            name: 'question1',
            title: {
              default: 'dddd',
              fr: 'xxx',
            },
            items: [
              {
                name: 'sub q 1',
                title: {
                  default: 'sub q 1 text',
                  fr: 'sub q1 fr',
                },
              },
              {
                name: 'text2',
                title: 'sub q 2 text',
              },
            ],
          },
        ],
      },
    ],
  });

  static multipleTextAnswer = {
    question1: {
      'sub q 1': 'sub answer 1',
      text2: 'sub answer 2',
    },
  };

  static matrixQuestion = JSON.stringify({
    logo: {
      default: 'blob:http://localhost:8080/42ada456-4ec4-41d2-94ba-3e4d1fb23c1f',
      fr: 'blob:http://localhost:8080/a48ce765-786c-46b1-b08c-f9cc1b9e0bdf',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'matrix',
            name: 'question1',
            title: {
              default: 'dddd',
              fr: 'xxx',
            },
            columns: [
              {
                value: 'answer 1',
                text: {
                  default: '1 en',
                  fr: '1 fr',
                },
                score: 10,
              },
              {
                value: 'answer 2',
                text: '2 en',
                score: 20,
              },
              'Column 3',
            ],
            rows: [
              {
                value: 'sub q 1',
                text: {
                  default: 'en',
                  fr: 'fr',
                },
                score: 1,
              },
              'Row 2',
              'Row 3',
            ],
          },
        ],
      },
    ],
  });

  static matrixAnswer = {
    question1: {
      'sub q 1': 'answer 1',
      'Row 2': 'Column 3',
      'Row 3': 'answer 1',
    },
  };

  static matrixDropdownQuestion = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'matrixdropdown',
            name: 'question3',
            columns: [
              {
                name: 'Column 1',
                title: {
                  default: 'col 1 en',
                  fr: 'col 1 fr',
                },
              },
              {
                name: 'Column 2',
                cellType: 'dropdown',
                choices: [
                  {
                    value: 1,
                    text: {
                      fr: 'hello',
                      default: 'hello en',
                    },
                  },
                  {
                    value: 2,
                    score: 5,
                  },
                  3,
                ],
                hasOther: true,
                otherText: {
                  default: 'Other (describe)zzz',
                  fr: 'autre',
                },
                storeOthersAsComment: true,
              },
              {
                name: 'col3',
                title: {
                  fr: 'col 3 fr',
                },
              },
            ],
            choices: [
              {
                value: 1,
                text: {
                  default: 'val 1 en',
                  fr: 'val fr',
                },
                score: 5,
              },
              2,
              {
                value: 'Yep',
                score: 7,
              },
              4,
              'nope',
            ],
            rows: [
              {
                value: 'Row 1',
                text: 'lig 1 en',
                score: 10,
              },
              {
                value: 'Row 2',
                text: {
                  fr: 'ligne 2',
                },
                score: 20,
              },
              'Row 3',
            ],
          },
        ],
      },
    ],
  });

  static matrixDropdownAnswers = {
    question3: {
      'Row 1': {
        'Column 1': 1,
        'Column 2': 'other',
        'Column 2-Comment': 'fdgdfg',
        col3: 1,
      },
      'Row 2': {
        'Column 2-Comment': 'cvbc',
        'Column 1': 2,
        'Column 2': 'other',
        col3: 'Yep',
      },
      'Row 3': {
        'Column 2-Comment': 'hfghfghf',
        'Column 1': 'Yep',
        'Column 2': 'other',
        col3: 2,
      },
    },
  };

  static matrixDropdownSomeAnswers = {
    question3: {
      'Row 1': {
        'Column 2-Comment': 'etst',
        'Column 1': 2,
        'Column 2': 'other',
        col3: 2,
      },
      'Row 2': {
        'Column 2': 3,
      },
      'Row 3': {
        'Column 1': 'Yep',
        col3: 'nope',
      },
    },
  };

  static ratingQuestion = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [{
          type: 'rating',
          name: 'question5',
          title: 'rating with range',
          hasComment: true,
          rateMax: 3,
        },
        ],
      },
    ],
  });

  static ratingQuestionWithStep = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [{
          type: 'rating',
          name: 'question5',
          title: 'rating with range',
          hasComment: true,
          rateMin: 2,
          rateMax: 9,
          rateStep: 2,
        },
        ],
      },
    ],
  });

  static ratingAnswer = {
    question5: 2,
    'question5-Comment': 'desc',
  };

  static ratingQuestionWithChoices = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [{
          type: 'rating',
          name: 'question7',
          title: {
            default: 'rating with choices',
            fr: 'avec choix',
          },
          rateValues: [
            {
              value: 'item1',
              score: 123,
            },
            {
              value: 'item2',
              text: {
                default: 'snd',
                fr: '2e',
              },
              score: 456,
            },
            {
              value: 'item3',
              text: 'trd',
              score: 4,
            },
          ],
        },
        ],
      },
    ],
  });

  static ratingAnswerWithChoices = {
    question7: 'item2',
  };

  static panelQuestion = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'panel',
            name: 'panel1',
            elements: [
              {
                type: 'rating',
                name: 'question5',
                title: 'rating with range',
                rateMin: 2,
                rateMax: 9,
                rateStep: 2,
              },
            ],
            title: 'hello',
          },
        ],
      },
    ],
  });

  static complexJson = JSON.stringify({
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'matrix',
            name: 'Quality',
            title: {
              default: 'Please indicate if you agree or disagree with the following statements',
              fr: 'Veuillez indiquer si vous êtes en accord ou en désaccord avec',
            },
            columns: [
              {
                value: 1,
                text: {
                  default: 'Strongly Disagree',
                  fr: 'Très en désaccord',
                },
              },
              {
                value: 2,
                text: {
                  default: 'Disagree',
                  fr: 'En désaccord',
                },
              },
              {
                value: 3,
                text: {
                  default: 'Neutral',
                  fr: 'Neutre',
                },
              },
              {
                value: 4,
                text: {
                  default: 'Agree',
                  fr: 'En accord',
                },
                score: 10,
              },
              {
                value: 5,
                text: {
                  default: 'Strongly Agree',
                  fr: 'Très en accord',
                },
              },
            ],
            rows: [
              {
                value: 'affordable',
                text: {
                  default: 'Product is affordable',
                  fr: 'Le produit est pas trop cher',
                },
              },
              {
                value: 'does what it claims',
                text: {
                  default: 'Product does what it claims',
                  fr: "Le produit fait ce qu'il doit faire",
                },
              },
              {
                value: 'better then others',
                text: 'Product is better than other products on the market',
              },
              {
                value: 'easy to use',
                text: 'Product is easy to use',
              },
            ],
          },
          {
            type: 'rating',
            name: 'satisfaction',
            title: {
              default: 'How satisfied are you with the Product?',
              fr: 'Comment êtes vous satisfaits',
            },
            isRequired: true,
            rateValues: [
              {
                value: '1',
                text: 'val 1',
                score: 10,
              },
              {
                value: '2',
                text: 'val 2',
                score: '2',
              },
              {
                value: '3',
                text: 'val 3',
                score: '3',
              },
            ],
            minRateDescription: {
              default: 'Not Satisfied',
              fr: 'Pas satisfait',
            },
            maxRateDescription: 'Completely satisfied',
          },
          {
            type: 'rating',
            name: 'recommend friends',
            visibleIf: '{satisfaction} > 2',
            title: 'How likely are you to recommend the Product to a friend or co-worker?',
            minRateDescription: 'Will not recommend',
            maxRateDescription: 'I will recommend',
          },
          {
            type: 'comment',
            name: 'suggestions',
            title: 'What would make you more satisfied with the Product?',
          },
        ],
      },
      {
        name: 'page2',
        elements: [
          {
            type: 'radiogroup',
            name: 'price to competitors',
            title: 'Compared to our competitors, do you feel the Product is',
            choices: [
              'Less expensive',
              'Priced about the same',
              'More expensive',
              'Not sure',
            ],
          },
          {
            type: 'radiogroup',
            name: 'price',
            title: 'Do you feel our current price is merited by our product?',
            choices: [
              {
                value: 'correct',
                text: 'Yes, the price is about right',
                score: 10,
              },
              {
                value: 'low',
                text: 'No, the price is too low for your product',
                score: 5,
              },
              {
                value: 'high',
                text: 'No, the price is too high for your product',
              },
            ],
          },
          {
            type: 'multipletext',
            name: 'pricelimit',
            title: {
              default: 'What is the... ',
              fr: 'Quel est le',
            },
            items: [
              {
                name: 'mostamount',
                title: {
                  default: 'Most amount you would every pay for a product like ours',
                  fr: 'Plus cher que vous paieriez',
                },
              },
              {
                name: 'leastamount',
                title: 'The least amount you would feel comfortable paying',
              },
            ],
          },
        ],
      },
      {
        name: 'page3',
        elements: [
          {
            type: 'text',
            name: 'email',
            title: "Thank you for taking our survey. Your survey is almost complete, please enter your email address in the box below if you wish to participate in our drawing, then press the 'Submit' button.",
          },
        ],
      },
    ],
  });

  static complexJsonAnswers = {
    Quality: {
      affordable: 1,
      'does what it claims': 2,
      'better then others': 3,
      'easy to use': 5,
    },
    satisfaction: '3',
    'recommend friends': 4,
    suggestions: 'tests',
    'price to competitors': 'Priced about the same',
    price: 'low',
    pricelimit: {
      mostamount: '124.34',
      leastamount: '1223$',
    },
    email: 'mmmm@mail.com',
  };

  static dynamicPanelQuestion = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'text',
            name: 'your name',
            title: 'your name',
          },
          {
            type: 'paneldynamic',
            name: 'additional member panel',
            title: {
              default: 'Add additional members',
              fr: 'Ajouter membres',
            },
            templateElements: [
              {
                type: 'text',
                name: 'additional member fname',
                title: {
                  default: 'first name',
                  fr: 'Prénom',
                },
              },
              {
                type: 'text',
                name: 'additional member lname',
                title: {
                  default: 'last name',
                  fr: 'Nom de famille',
                },
              },
              {
                type: 'paneldynamic',
                name: 'complaint panel',
                title: {
                  default: 'every complaint that person has',
                  fr: 'Chaque plainte',
                },
                templateElements: [
                  {
                    type: 'comment',
                    name: 'describe the issue',
                    title: {
                      default: 'describe the issue',
                      fr: 'décrire',
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    clearInvisibleValues: 'onHiddenContainer',
  });

  static dynamicPanelAnswers = {
    'your name': 'test',
    'additional member panel': [
      {
        'additional member fname': 'Marc-Andre',
        'additional member lname': 'Deschenes',
        'complaint panel': [
          {
            'describe the issue': 'issue 1\ndescription',
          },
          {
            'describe the issue': 'issue 2 desc',
          },
        ],
      },
      {
        'additional member fname': 'Dana',
        'additional member lname': 'Melania',
        'complaint panel': [
          {
            'describe the issue': 'Complain 1 dana',
          },
        ],
      },
      {
        'additional member lname': 'last',
      },
    ],
  };

  static matrixdynamicQuestion = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [{
          type: 'matrixdynamic',
          name: 'relativeillness',
          title: 'Describe the illness or condition.',
          columns: [{
            name: 'illness',
            title: 'Illness/Condition',
            cellType: 'dropdown',
            isRequired: true,
            choices: [
              {
                value: 'Heart Disease',
                text: {
                  fr: 'Maladie du coeur',
                },
              }, {
                value: 'Diabetes',
                text: 'Diabetes type A',
              }, {
                value: 'Stroke/TIA',
                text: {
                  default: 'Stroke en',
                  fr: 'Stroke fr',
                },
              },
              'High Blood Pressure',
            ],
          }, {
            name: 'really',
            title: {
              default: 'reallly ?? en',
              fr: 'vraiment ??',
            },
            cellType: 'dropdown',
            choices: [{
              value: 'yes',
              text: {
                default: 'yes en',
                fr: 'oui',
              },
              score: 10,
            }, {
              value: 'no',
              text: 'en',
            }, {
              value: 'maybe',
              text: {
                fr: 'maybe fr',
              },
              score: 5,
            },
            ],
            hasOther: true,
            hasNone: true,
            storeOthersAsComment: true,
          },
          ],
          rowCount: 1,
        },
        ],
      },
    ],
  });

  static matrixdynamicAnswers = {
    relativeillness: [
      {
        illness: 'Diabetes',
        really: 'other',
        'really-Comment': 'zzzz',
      },
      {
        illness: 'Heart Disease',
        really: 'yes',
      },
      {
        illness: 'Stroke/TIA',
        really: 'none',
      },
    ],
  };

  static complexWithLogic = JSON.stringify({
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'checkbox',
            name: 'cbox',
            title: {
              default: 'Checkbox en',
              fr: 'cbox fr',
            },
            isRequired: true,
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'item1 en',
                  fr: 'item 1 fr',
                },
                score: 5,
              },
              {
                value: 'item2',
                text: {
                  default: 'item 2 en',
                  fr: 'item 2 fr',
                },
                score: 10,
              },
              {
                value: 'item3',
                text: {
                  default: 'item 3 en',
                  fr: 'item 3 fr',
                },
                score: 15,
              },
            ],
            hasNone: true,
          },
          {
            type: 'dropdown',
            name: 'ddown',
            visibleIf: "{cbox} contains 'item1' and {cbox} contains 'item3'",
            title: {
              default: 'q dropdown en',
              fr: 'q dropdown fr',
            },
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'item 1 en',
                  fr: 'item 1 fr',
                },
                score: 5,
              },
              {
                value: 'item2',
                text: {
                  default: 'item 2 en',
                  fr: 'item 2 fr',
                },
                score: 10,
              },
            ],
          },
          {
            type: 'text',
            name: 'qText',
            visibleIf: "{ddown} notempty and {cbox} = ['item1']",
            title: {
              default: 'text en',
              fr: 'text fr',
            },
          },
          {
            type: 'boolean',
            name: 'qbool',
            title: {
              default: 'boolean en',
              fr: 'bool fr',
            },
            enableIf: "{ddown} notempty and {cbox} = ['item1']",
          },
          {
            type: 'yes-no',
            name: 'yes-noq',
            title: {
              default: 'yes no en',
              fr: 'oui non fr',
            },
            requiredIf: "{qText} <> 'nope'",
          },
          {
            type: 'multipletext',
            name: 'question2',
            visibleIf: "{yes-noq} = 'yes'",
            items: [
              {
                name: 'text1',
              },
              {
                name: 'text2',
              },
            ],
          },
        ],
      },
    ],
    triggers: [
      {
        type: 'skip',
        expression: "{cbox} = ['item2']",
        gotoName: 'yes-noq',
      },
    ],
    clearInvisibleValues: 'onHiddenContainer',
  });

  static surveyForExtract = JSON.stringify({
    title: {
      default: 'APPLICATION FOR FINANCIAL ASSISTANCE UNDER THE NEW BRUNSWICK WORKERS EMERGENCY INCOME BENEFIT',
      fr: 'Application FR',
    },
    description: {
      default: 'APPLICATION FOR FINANCIAL ASSISTANCE UNDER THE NEW BRUNSWICK WORKERS EMERGENCY INCOME BENEFIT',
      fr: 'Desc FR',
    },
    logo: {
      default: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/en',
      fr: 'https://api-lab.crc-tech.ca/system-management/tenant-settings/c400f50d-7a56-4ef2-8e44-211bfa434724/logo/fr',
    },
    logoPosition: 'right',
    pages: [
      {
        name: 'page1',
        elements: [
          {
            type: 'html',
            name: 'consent description',
            html: {
              default: '<b>\n<p>1) IMPORTANT: You do not have to submit any supporting documents with your application. However, you must keep them for a period of three (3) years, as you will have to provide them if requested by PETL.</p>\n\n<p>Personal information provided by you for this program is collected by PETL, its agents and service providers in accordance with paragraph 37(1)(b) of the Right to Information and Protection of Privacy Act, SNB 2009, c. R-10.6 (RTIPPA) and subsection 27(1) of the Personal Health Information Protection and Access Act, SNB 2009, c. P-7.05 (PHIPAA) for the purposes of administering the employment-related programs and services.</p>\n\n<p>Personal information provided by you is protected and handled in accordance with RTIPPA, PHIPAA, and the Document and Record Management Policy.</p>\n\n<p>All personal information provided by you must be accurate; please immediately inform PETL, its agents, and service providers of any changes.</p>\n\n<p>By submitting this application, I, hereby consent to allow PETL, its agents, and service providers to collect and use my personal information:</p>\n<ul> \n<li>\tto determine and verify my eligibility for the benefit for which I am applying and/or; </li>\n<li>\tto contact me for a period of up to three (3) years following my participation in the program, for the purpose of collecting information concerning my participation and to evaluate the program for research and effectiveness of the benefit.</li>\n</ul>\n<p>I understand that in order to accomplish these purposes, my personal information may need to be shared. I hereby consent to allow PETL, its agents, and service providers to disclose my personal information, if and when necessary, to:</p>\n <ul> \n<li> \tother branches within PETL;</li>\n<li>\tother New Brunswick provincial departments;</li>\n<li>\tthe federal Department of Employment and Social Development Canada; and</li>\n<li>\tthird party evaluators.</li>\n</ul>\n<p>I acknowledge that this authorization is valid for the duration of my participation in the benefit and the monitoring associated with it, and to carry out the evaluation of the program as established by PETL.</p>\n\n<p>I understand that I can revoke my consent in writing, at any time and in doing so, I understand that I will no longer be able to participate in the program.</p>\n</b>',
              fr: 'html markup fr',
            },
          },
          {
            type: 'checkbox',
            name: 'consent',
            title: {
              default: 'Do you agree',
              fr: 'consent title fr',
            },
            isRequired: true,
            showCommentArea: true,
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'I agree',
                  fr: 'yup fr',
                },
              },
            ],
          },
        ],
        title: {
          default: 'Consent to Collect, Use, and Disclose Personal Information and Attestation ',
          fr: 'page 1 fr',
        },
      },
      {
        name: 'page2',
        elements: [
          {
            type: 'panel',
            name: 'panneau1',
            elements: [
              {
                type: 'checkbox',
                name: 'Benef_consents',
                title: {
                  default: 'Beneficiary consents',
                  fr: 'benef consent fr',
                },
                isRequired: true,
                choices: [
                  {
                    value: 'item1',
                    text: {
                      default: 'Yes',
                      fr: 'oui',
                    },
                    score: 1,
                  },
                ],
              },
              {
                type: 'text',
                name: 'crc_rep',
                title: {
                  default: 'Name of CRC rep',
                  fr: 'nom crc',
                },
                isRequired: true,
              },
              {
                type: 'text',
                name: 'date_consent',
                title: {
                  default: 'Date of consent',
                  fr: 'date consentement',
                },
                isRequired: true,
                inputType: 'date',
              },
              {
                type: 'text',
                name: 'Time_consent',
                title: {
                  default: 'Time of consent',
                  fr: 'temps',
                },
                isRequired: true,
                inputType: 'time',
              },
            ],
            title: {
              default: 'I further certify that the information I will provide during this questionnaire will be truthful and accurate to the best of my knowledge.',
              fr: 'panel fr',
            },
            isRequired: true,
          },
        ],
      },
      {
        name: 'page3',
        elements: [
          {
            type: 'checkbox',
            name: 'Attest',
            title: {
              default: 'I attest that',
              fr: "j'atteste",
            },
            isRequired: true,
            validators: [
              {
                type: 'answercount',
                text: {
                  default: 'You must attest to each item to continue',
                  fr: 'Consentir à tout',
                },
                minCount: 3,
                maxCount: 3,
              },
              {
                type: 'expression',
                expression: "{Attest} allof ['item1', 'item2', 'item3']",
              },
            ],
            choices: [
              {
                value: 'item1',
                text: {
                  default: 'I will keep supporting documents proving my eligibility for the program for a period of three (3) years following my approval to the program for audit and compliance purposes.',
                  fr: "j'ai plein d'accents en français.  Comme é à \" ï ê",
                },
              },
              {
                value: 'item2',
                text: 'I understand that any assistance paid without entitlement may be claimed from me by PETL.',
              },
              {
                value: 'item3',
                text: 'All the information in this form is true and I understand that PETL may verify its accuracy by comparing it with information from other agencies or departments.',
              },
            ],
          },
          {
            type: 'multipletext',
            name: 'Name',
            isRequired: true,
            items: [
              {
                name: 'text1',
                title: 'First Name',
              },
              {
                name: 'text2',
                title: 'Last Name',
              },
            ],
          },
          {
            type: 'text',
            name: 'SIN',
            title: 'Social Insurance Number',
            isRequired: true,
            validators: [
              {
                type: 'numeric',
              },
              {
                type: 'text',
                minLength: 9,
                maxLength: 9,
              },
            ],
          },
        ],
        title: {
          default: 'Attestation',
          fr: 'attestation fr',
        },
      },
      {
        name: 'page4',
        elements: [
          {
            type: 'radiogroup',
            name: 'question3',
            choices: [
              'item1',
              'item2',
              'item3',
            ],
            showOtherItem: true,
            showNoneItem: true,
          },
          {
            type: 'comment',
            name: 'question4',
          },
          {
            type: 'rating',
            name: 'question5',
            showCommentArea: true,
            commentText: 'Other (describe)zz',
          },
          {
            type: 'boolean',
            name: 'question6',
            visibleIf: "{Benef_consents} = ['item1']",
            scoreTrue: 213,
          },
          {
            type: 'image',
            name: 'question7',
            imageLink: 'https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg',
            altText: 'texte img en',
          },
          {
            type: 'matrix',
            name: 'question1',
            enableIf: "{date_consent} > '2022-11-09' and {Name.text1} notempty",
            columns: [
              {
                value: 'Column 1',
                text: 'col 1',
                score: 1,
              },
              {
                value: 'Column 2',
                text: 'col 2',
                score: 2,
              },
              {
                value: 'Column 3',
                score: 3,
              },
            ],
            rows: [
              {
                value: 'Row 1',
                text: 'line 1',
                score: 15,
              },
              'Row 2',
            ],
          },
          {
            type: 'yes-no',
            name: 'question2',
            requiredIf: "{Attest} = ['item1', 'item2', 'item3']",
            requiredErrorText: {
              default: 'required error message content',
              fr: 'requis!',
            },
            validators: [
              {
                type: 'expression',
                text: 'q must be yes',
                expression: "{question2} = 'yes'",
              },
            ],
          },
        ],
      },
      {
        name: 'page5',
        elements: [
          {
            type: 'matrixdropdown',
            name: 'question8',
            title: 'matrixdd',
            columns: [
              {
                name: 'Column 1',
                cellType: 'dropdown',
                choices: [
                  1,
                  2,
                  {
                    value: 'yup',
                    text: 'hello',
                    score: 23,
                  },
                ],
                showOtherItem: true,
                storeOthersAsComment: true,
              },
              {
                name: 'Column 2',
              },
              {
                name: 'Column 3',
              },
            ],
            choices: [
              1,
              2,
              3,
              4,
              5,
            ],
            rows: [
              {
                value: 'Row 1',
                score: 55,
              },
              'Row 2',
            ],
          },
          {
            type: 'paneldynamic',
            name: 'dynamic identifier',
            title: 'dynamic question',
            description: 'description',
            templateElements: [
              {
                type: 'text',
                name: 'question10',
                title: 'dynamic within',
              },
              {
                type: 'paneldynamic',
                name: 'question11',
                templateElements: [
                  {
                    type: 'boolean',
                    name: 'question12',
                    title: 'sub dyanmic',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'page6',
        elements: [
          {
            type: 'matrixdynamic',
            name: 'question13',
            description: 'my description comes here',
            columns: [
              {
                name: 'Column 1',
                title: 'col 1',
                cellType: 'dropdown',
                choices: [
                  {
                    value: 1,
                    text: 'test',
                    score: 456,
                  },
                  2,
                ],
                showOtherItem: true,
                showNoneItem: true,
                storeOthersAsComment: true,
              },
              {
                name: 'Column 2',
              },
              {
                name: 'Column 3',
              },
            ],
            choices: [
              1,
              2,
              3,
              4,
              5,
            ],
          },
        ],
      },
    ],
    clearInvisibleValues: 'onHiddenContainer',
  });

  static surveyExtracted: IExtractedSurveyObject = {
    type: 'survey',
    identifier: 'survey',
    title: 'APPLICATION FOR FINANCIAL ASSISTANCE UNDER THE NEW BRUNSWICK WORKERS EMERGENCY INCOME BENEFIT',
    description: 'APPLICATION FOR FINANCIAL ASSISTANCE UNDER THE NEW BRUNSWICK WORKERS EMERGENCY INCOME BENEFIT',
    elements: [
      {
        type: 'page',
        identifier: 'page1',
        title: 'Consent to Collect, Use, and Disclose Personal Information and Attestation ',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'html',
            identifier: 'consent description',
            title: '<b>\n<p>1) IMPORTANT: You do not have to submit any supporting documents with your application. However, you must keep them for a period of three (3) years, as you will have to provide them if requested by PETL.</p>\n\n<p>Personal information provided by you for this program is collected by PETL, its agents and service providers in accordance with paragraph 37(1)(b) of the Right to Information and Protection of Privacy Act, SNB 2009, c. R-10.6 (RTIPPA) and subsection 27(1) of the Personal Health Information Protection and Access Act, SNB 2009, c. P-7.05 (PHIPAA) for the purposes of administering the employment-related programs and services.</p>\n\n<p>Personal information provided by you is protected and handled in accordance with RTIPPA, PHIPAA, and the Document and Record Management Policy.</p>\n\n<p>All personal information provided by you must be accurate; please immediately inform PETL, its agents, and service providers of any changes.</p>\n\n<p>By submitting this application, I, hereby consent to allow PETL, its agents, and service providers to collect and use my personal information:</p>\n<ul> \n<li>\tto determine and verify my eligibility for the benefit for which I am applying and/or; </li>\n<li>\tto contact me for a period of up to three (3) years following my participation in the program, for the purpose of collecting information concerning my participation and to evaluate the program for research and effectiveness of the benefit.</li>\n</ul>\n<p>I understand that in order to accomplish these purposes, my personal information may need to be shared. I hereby consent to allow PETL, its agents, and service providers to disclose my personal information, if and when necessary, to:</p>\n <ul> \n<li> \tother branches within PETL;</li>\n<li>\tother New Brunswick provincial departments;</li>\n<li>\tthe federal Department of Employment and Social Development Canada; and</li>\n<li>\tthird party evaluators.</li>\n</ul>\n<p>I acknowledge that this authorization is valid for the duration of my participation in the benefit and the monitoring associated with it, and to carry out the evaluation of the program as established by PETL.</p>\n\n<p>I understand that I can revoke my consent in writing, at any time and in doing so, I understand that I will no longer be able to participate in the program.</p>\n</b>',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'checkbox',
            identifier: 'consent',
            title: 'Do you agree',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'text',
                identifier: 'Comment',
                title: 'Other (describe)',
                description: '',
                elements: [],
              },
            ],
            choices: [
              {
                value: 'item1',
                text: 'I agree',
                score: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page2',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'panel',
            identifier: 'panneau1',
            title: 'I further certify that the information I will provide during this questionnaire will be truthful and accurate to the best of my knowledge.',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'checkbox',
                identifier: 'Benef_consents',
                title: 'Beneficiary consents',
                description: '',
                isRequired: true,
                elements: [],
                choices: [
                  {
                    value: 'item1',
                    text: 'Yes',
                    score: 1,
                  },
                ],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'crc_rep',
                title: 'Name of CRC rep',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'date_consent',
                title: 'Date of consent',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'Time_consent',
                title: 'Time of consent',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page3',
        title: 'Attestation',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'checkbox',
            identifier: 'Attest',
            title: 'I attest that',
            description: '',
            isRequired: true,
            elements: [],
            choices: [
              {
                value: 'item1',
                text: 'I will keep supporting documents proving my eligibility for the program for a period of three (3) years following my approval to the program for audit and compliance purposes.',
                score: null,
              },
              {
                value: 'item2',
                text: 'I understand that any assistance paid without entitlement may be claimed from me by PETL.',
                score: null,
              },
              {
                value: 'item3',
                text: 'All the information in this form is true and I understand that PETL may verify its accuracy by comparing it with information from other agencies or departments.',
                score: null,
              },
            ],
            validators: [
              {
                type: 'answercountvalidator',
                typename: 'Answer count',
                properties: [
                  {
                    name: 'Text',
                    value: 'You must attest to each item to continue',
                  },
                  {
                    name: 'Minimum count',
                    value: 3,
                  },
                  {
                    name: 'Maximum count',
                    value: 3,
                  },
                ],
              },
              {
                type: 'expressionvalidator',
                typename: 'Expression',
                properties: [
                  {
                    name: 'Expression',
                    value: "{Attest} allof ['item1', 'item2', 'item3']",
                  },
                  {
                    name: 'Text',
                    value: "The expression: {Attest} allof ['item1', 'item2', 'item3'] should return 'true'.",
                  },
                ],
              },
            ],
          },
          {
            type: 'multipletext',
            identifier: 'Name',
            title: 'Name',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'text',
                identifier: 'text1',
                title: 'First Name',
                isRequired: false,
                elements: [],
              },
              {
                type: 'text',
                identifier: 'text2',
                title: 'Last Name',
                isRequired: false,
                elements: [],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'text',
            identifier: 'SIN',
            title: 'Social Insurance Number',
            description: '',
            isRequired: true,
            elements: [],
            choices: [],
            validators: [
              {
                type: 'numericvalidator',
                typename: 'Number',
                properties: [
                  {
                    name: 'Text',
                    value: "The 'value' should be at most null",
                  },
                ],
              },
              {
                type: 'textvalidator',
                typename: 'Text',
                properties: [
                  {
                    name: 'Minimum length (in characters)',
                    value: 9,
                  },
                  {
                    name: 'Maximum length (in characters)',
                    value: 9,
                  },
                  {
                    name: 'Text',
                    value: 'Please enter at least 9 and no more than 9 characters.',
                  },
                ],
              },
            ],
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page4',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'radiogroup',
            identifier: 'question3',
            title: 'question3',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'item1',
                text: 'item1',
                score: null,
              },
              {
                value: 'item2',
                text: 'item2',
                score: null,
              },
              {
                value: 'item3',
                text: 'item3',
                score: null,
              },
              {
                value: 'other',
                text: 'Other (describe)',
                score: null,
              },
              {
                value: 'none',
                text: 'None',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'comment',
            identifier: 'question4',
            title: 'question4',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'rating',
            identifier: 'question5',
            title: 'question5',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'text',
                identifier: 'Comment',
                title: 'Other (describe)zz',
                description: '',
                elements: [],
              },
            ],
            choices: [
              {
                value: '1',
                text: '1',
                score: null,
              },
              {
                value: '2',
                text: '2',
                score: null,
              },
              {
                value: '3',
                text: '3',
                score: null,
              },
              {
                value: '4',
                text: '4',
                score: null,
              },
              {
                value: '5',
                text: '5',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'boolean',
            identifier: 'question6',
            title: 'question6',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'true',
                text: 'Yes',
                score: 213,
              },
              {
                value: 'false',
                text: 'No',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'image',
            identifier: 'question7',
            title: '<div><img src="https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"/></div>',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'matrix',
            identifier: 'question1',
            title: 'question1',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'row',
                identifier: 'Row 1',
                title: 'line 1',
                elements: [],
                choices: [
                  {
                    value: 'Column 1',
                    text: 'col 1',
                    score: 16,
                  },
                  {
                    value: 'Column 2',
                    text: 'col 2',
                    score: 17,
                  },
                  {
                    value: 'Column 3',
                    text: 'Column 3',
                    score: 18,
                  },
                ],
              },
              {
                type: 'row',
                identifier: 'Row 2',
                title: 'Row 2',
                elements: [],
                choices: [
                  {
                    value: 'Column 1',
                    text: 'col 1',
                    score: 1,
                  },
                  {
                    value: 'Column 2',
                    text: 'col 2',
                    score: 2,
                  },
                  {
                    value: 'Column 3',
                    text: 'Column 3',
                    score: 3,
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'yes-no',
            identifier: 'question2',
            title: 'question2',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'yes',
                text: 'Yes',
                score: null,
              },
              {
                value: 'no',
                text: 'No',
                score: null,
              },
            ],
            validators: [
              {
                type: 'requiredErrorText',
                typename: '"Required" error message',
                properties: [
                  {
                    name: 'Text',
                    value: 'required error message content',
                  },
                ],
              },
              {
                type: 'expressionvalidator',
                typename: 'Expression',
                properties: [
                  {
                    name: 'Text',
                    value: 'q must be yes',
                  },
                  {
                    name: 'Expression',
                    value: "{question2} = 'yes'",
                  },
                ],
              },
            ],
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page5',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'matrixdropdown',
            identifier: 'question8',
            title: 'matrixdd',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'row',
                identifier: 'Row 1',
                title: 'Row 1',
                elements: [
                  {
                    type: 'column',
                    identifier: 'Column 1',
                    title: 'Column 1',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: 'yup',
                        text: 'hello',
                        score: 78,
                      },
                      {
                        value: 'other',
                        text: 'Other (describe)',
                        score: 55,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 2',
                    title: 'Column 2',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: 55,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: 55,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: 55,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 3',
                    title: 'Column 3',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: 55,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: 55,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: 55,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'row',
                identifier: 'Row 2',
                title: 'Row 2',
                elements: [
                  {
                    type: 'column',
                    identifier: 'Column 1',
                    title: 'Column 1',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: 'yup',
                        text: 'hello',
                        score: 23,
                      },
                      {
                        value: 'other',
                        text: 'Other (describe)',
                        score: null,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 2',
                    title: 'Column 2',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: null,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: null,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: null,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 3',
                    title: 'Column 3',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: null,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: null,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: null,
                      },
                    ],
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'paneldynamic',
            identifier: 'dynamic identifier',
            title: 'dynamic question',
            description: 'description',
            isRequired: false,
            elements: [
              {
                type: 'text',
                identifier: 'question10',
                title: 'dynamic within',
                description: '',
                isRequired: false,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'paneldynamic',
                identifier: 'question11',
                title: 'question11',
                description: '',
                isRequired: false,
                elements: [
                  {
                    type: 'boolean',
                    identifier: 'question12',
                    title: 'sub dyanmic',
                    description: '',
                    isRequired: false,
                    elements: [],
                    choices: [
                      {
                        value: 'true',
                        text: 'Yes',
                        score: null,
                      },
                      {
                        value: 'false',
                        text: 'No',
                        score: null,
                      },
                    ],
                    validators: null,
                  },
                ],
                validators: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page6',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'matrixdynamic',
            identifier: 'question13',
            title: 'question13',
            description: 'my description comes here',
            isRequired: false,
            elements: [
              {
                type: 'column',
                identifier: 'Column 1',
                title: 'col 1',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: 'test',
                    score: 456,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: 'other',
                    text: 'Other (describe)',
                    score: null,
                  },
                  {
                    value: 'none',
                    text: 'None',
                    score: null,
                  },
                ],
              },
              {
                type: 'column',
                identifier: 'Column 2',
                title: 'Column 2',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: '1',
                    score: null,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: '3',
                    text: '3',
                    score: null,
                  },
                  {
                    value: '4',
                    text: '4',
                    score: null,
                  },
                  {
                    value: '5',
                    text: '5',
                    score: null,
                  },
                ],
              },
              {
                type: 'column',
                identifier: 'Column 3',
                title: 'Column 3',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: '1',
                    score: null,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: '3',
                    text: '3',
                    score: null,
                  },
                  {
                    value: '4',
                    text: '4',
                    score: null,
                  },
                  {
                    value: '5',
                    text: '5',
                    score: null,
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
        ],
        validators: null,
      },
    ],
    logic: [
      "If 'Benef_consents' == ['item1'], make question 'question6' visible",
      "If ('date_consent' > '2022-11-09') and 'Name.text1' Not empty, make question 'question1' enable",
      "If 'Attest' == ['item1', 'item2', 'item3'], make question 'question2' required",
    ],
  };

  static surveyExtractedFr: IExtractedSurveyObject = {
    type: 'survey',
    identifier: 'survey',
    title: 'Application FR',
    description: 'Desc FR',
    elements: [
      {
        type: 'page',
        identifier: 'page1',
        title: 'page 1 fr',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'html',
            identifier: 'consent description',
            title: 'html markup fr',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'checkbox',
            identifier: 'consent',
            title: 'consent title fr',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'text',
                identifier: 'Comment',
                title: 'Autre (préciser)',
                description: '',
                elements: [],
              },
            ],
            choices: [
              {
                value: 'item1',
                text: 'yup fr',
                score: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page2',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'panel',
            identifier: 'panneau1',
            title: 'panel fr',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'checkbox',
                identifier: 'Benef_consents',
                title: 'benef consent fr',
                description: '',
                isRequired: true,
                elements: [],
                choices: [
                  {
                    value: 'item1',
                    text: 'oui',
                    score: 1,
                  },
                ],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'crc_rep',
                title: 'nom crc',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'date_consent',
                title: 'date consentement',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'text',
                identifier: 'Time_consent',
                title: 'temps',
                description: '',
                isRequired: true,
                elements: [],
                choices: [],
                validators: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page3',
        title: 'attestation fr',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'checkbox',
            identifier: 'Attest',
            title: "j'atteste",
            description: '',
            isRequired: true,
            elements: [],
            choices: [
              {
                value: 'item1',
                text: "j'ai plein d'accents en français.  Comme é à \" ï ê",
                score: null,
              },
              {
                value: 'item2',
                text: 'I understand that any assistance paid without entitlement may be claimed from me by PETL.',
                score: null,
              },
              {
                value: 'item3',
                text: 'All the information in this form is true and I understand that PETL may verify its accuracy by comparing it with information from other agencies or departments.',
                score: null,
              },
            ],
            validators: [
              {
                type: 'answercountvalidator',
                typename: 'total de réponses',
                properties: [
                  {
                    name: 'Texte',
                    value: 'Consentir à tout',
                  },
                  {
                    name: 'Nombre minimum',
                    value: 3,
                  },
                  {
                    name: 'Nombre maximum',
                    value: 3,
                  },
                ],
              },
              {
                type: 'expressionvalidator',
                typename: 'Expression',
                properties: [
                  {
                    name: 'Expression',
                    value: "{Attest} allof ['item1', 'item2', 'item3']",
                  },
                  {
                    name: 'Texte',
                    value: "L'expression: {Attest} allof ['item1', 'item2', 'item3'] doit retourner 'true'.",
                  },
                ],
              },
            ],
          },
          {
            type: 'multipletext',
            identifier: 'Name',
            title: 'Name',
            description: '',
            isRequired: true,
            elements: [
              {
                type: 'text',
                identifier: 'text1',
                title: 'First Name',
                isRequired: false,
                elements: [],
              },
              {
                type: 'text',
                identifier: 'text2',
                title: 'Last Name',
                isRequired: false,
                elements: [],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'text',
            identifier: 'SIN',
            title: 'Social Insurance Number',
            description: '',
            isRequired: true,
            elements: [],
            choices: [],
            validators: [
              {
                type: 'numericvalidator',
                typename: 'numérique',
                properties: [
                  {
                    name: 'Texte',
                    value: "Votre réponse 'valeur' doit être inférieure ou égale à null",
                  },
                ],
              },
              {
                type: 'textvalidator',
                typename: 'texte',
                properties: [
                  {
                    name: 'Longueur minimum',
                    value: 9,
                  },
                  {
                    name: 'Longueur maximum',
                    value: 9,
                  },
                  {
                    name: 'Texte',
                    value: 'Merci de saisir entre 9 et 9 caractères.',
                  },
                ],
              },
            ],
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page4',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'radiogroup',
            identifier: 'question3',
            title: 'question3',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'item1',
                text: 'item1',
                score: null,
              },
              {
                value: 'item2',
                text: 'item2',
                score: null,
              },
              {
                value: 'item3',
                text: 'item3',
                score: null,
              },
              {
                value: 'other',
                text: 'Autre (préciser)',
                score: null,
              },
              {
                value: 'none',
                text: 'Aucun',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'comment',
            identifier: 'question4',
            title: 'question4',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'rating',
            identifier: 'question5',
            title: 'question5',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'text',
                identifier: 'Comment',
                title: 'Other (describe)zz',
                description: '',
                elements: [],
              },
            ],
            choices: [
              {
                value: '1',
                text: '1',
                score: null,
              },
              {
                value: '2',
                text: '2',
                score: null,
              },
              {
                value: '3',
                text: '3',
                score: null,
              },
              {
                value: '4',
                text: '4',
                score: null,
              },
              {
                value: '5',
                text: '5',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'boolean',
            identifier: 'question6',
            title: 'question6',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'true',
                text: 'Oui',
                score: 213,
              },
              {
                value: 'false',
                text: 'Non',
                score: null,
              },
            ],
            validators: null,
          },
          {
            type: 'image',
            identifier: 'question7',
            title: '<div><img src="https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"/></div>',
            description: '',
            isRequired: false,
            elements: [],
            choices: [],
            validators: null,
          },
          {
            type: 'matrix',
            identifier: 'question1',
            title: 'question1',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'row',
                identifier: 'Row 1',
                title: 'line 1',
                elements: [],
                choices: [
                  {
                    value: 'Column 1',
                    text: 'col 1',
                    score: 16,
                  },
                  {
                    value: 'Column 2',
                    text: 'col 2',
                    score: 17,
                  },
                  {
                    value: 'Column 3',
                    text: 'Column 3',
                    score: 18,
                  },
                ],
              },
              {
                type: 'row',
                identifier: 'Row 2',
                title: 'Row 2',
                elements: [],
                choices: [
                  {
                    value: 'Column 1',
                    text: 'col 1',
                    score: 1,
                  },
                  {
                    value: 'Column 2',
                    text: 'col 2',
                    score: 2,
                  },
                  {
                    value: 'Column 3',
                    text: 'Column 3',
                    score: 3,
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'yes-no',
            identifier: 'question2',
            title: 'question2',
            description: '',
            isRequired: false,
            elements: [],
            choices: [
              {
                value: 'yes',
                text: 'Oui',
                score: null,
              },
              {
                value: 'no',
                text: 'Non',
                score: null,
              },
            ],
            validators: [
              {
                type: 'requiredErrorText',
                typename: "Message d'erreur lorsque obligatoire",
                properties: [
                  {
                    name: 'Texte',
                    value: 'requis!',
                  },
                ],
              },
              {
                type: 'expressionvalidator',
                typename: 'Expression',
                properties: [
                  {
                    name: 'Texte',
                    value: 'q must be yes',
                  },
                  {
                    name: 'Expression',
                    value: "{question2} = 'yes'",
                  },
                ],
              },
            ],
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page5',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'matrixdropdown',
            identifier: 'question8',
            title: 'matrixdd',
            description: '',
            isRequired: false,
            elements: [
              {
                type: 'row',
                identifier: 'Row 1',
                title: 'Row 1',
                elements: [
                  {
                    type: 'column',
                    identifier: 'Column 1',
                    title: 'Column 1',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: 'yup',
                        text: 'hello',
                        score: 78,
                      },
                      {
                        value: 'other',
                        text: 'Autre (préciser)',
                        score: 55,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 2',
                    title: 'Column 2',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: 55,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: 55,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: 55,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 3',
                    title: 'Column 3',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: 55,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: 55,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: 55,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: 55,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: 55,
                      },
                    ],
                  },
                ],
              },
              {
                type: 'row',
                identifier: 'Row 2',
                title: 'Row 2',
                elements: [
                  {
                    type: 'column',
                    identifier: 'Column 1',
                    title: 'Column 1',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: 'yup',
                        text: 'hello',
                        score: 23,
                      },
                      {
                        value: 'other',
                        text: 'Autre (préciser)',
                        score: null,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 2',
                    title: 'Column 2',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: null,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: null,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: null,
                      },
                    ],
                  },
                  {
                    type: 'column',
                    identifier: 'Column 3',
                    title: 'Column 3',
                    elements: [],
                    choices: [
                      {
                        value: '1',
                        text: '1',
                        score: null,
                      },
                      {
                        value: '2',
                        text: '2',
                        score: null,
                      },
                      {
                        value: '3',
                        text: '3',
                        score: null,
                      },
                      {
                        value: '4',
                        text: '4',
                        score: null,
                      },
                      {
                        value: '5',
                        text: '5',
                        score: null,
                      },
                    ],
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
          {
            type: 'paneldynamic',
            identifier: 'dynamic identifier',
            title: 'dynamic question',
            description: 'description',
            isRequired: false,
            elements: [
              {
                type: 'text',
                identifier: 'question10',
                title: 'dynamic within',
                description: '',
                isRequired: false,
                elements: [],
                choices: [],
                validators: null,
              },
              {
                type: 'paneldynamic',
                identifier: 'question11',
                title: 'question11',
                description: '',
                isRequired: false,
                elements: [
                  {
                    type: 'boolean',
                    identifier: 'question12',
                    title: 'sub dyanmic',
                    description: '',
                    isRequired: false,
                    elements: [],
                    choices: [
                      {
                        value: 'true',
                        text: 'Oui',
                        score: null,
                      },
                      {
                        value: 'false',
                        text: 'Non',
                        score: null,
                      },
                    ],
                    validators: null,
                  },
                ],
                validators: null,
              },
            ],
            validators: null,
          },
        ],
        validators: null,
      },
      {
        type: 'page',
        identifier: 'page6',
        title: '',
        description: '',
        isRequired: false,
        elements: [
          {
            type: 'matrixdynamic',
            identifier: 'question13',
            title: 'question13',
            description: 'my description comes here',
            isRequired: false,
            elements: [
              {
                type: 'column',
                identifier: 'Column 1',
                title: 'col 1',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: 'test',
                    score: 456,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: 'other',
                    text: 'Autre (préciser)',
                    score: null,
                  },
                  {
                    value: 'none',
                    text: 'Aucun',
                    score: null,
                  },
                ],
              },
              {
                type: 'column',
                identifier: 'Column 2',
                title: 'Column 2',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: '1',
                    score: null,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: '3',
                    text: '3',
                    score: null,
                  },
                  {
                    value: '4',
                    text: '4',
                    score: null,
                  },
                  {
                    value: '5',
                    text: '5',
                    score: null,
                  },
                ],
              },
              {
                type: 'column',
                identifier: 'Column 3',
                title: 'Column 3',
                elements: [],
                choices: [
                  {
                    value: '1',
                    text: '1',
                    score: null,
                  },
                  {
                    value: '2',
                    text: '2',
                    score: null,
                  },
                  {
                    value: '3',
                    text: '3',
                    score: null,
                  },
                  {
                    value: '4',
                    text: '4',
                    score: null,
                  },
                  {
                    value: '5',
                    text: '5',
                    score: null,
                  },
                ],
              },
            ],
            choices: [],
            validators: null,
          },
        ],
        validators: null,
      },
    ],
    logic: [
      "If 'Benef_consents' == ['item1'], Rendre la question 'question6' visible",
      "If ('date_consent' > '2022-11-09') and 'Name.text1' n'est pas vide, Activer la question 'question1'",
      "If 'Attest' == ['item1', 'item2', 'item3'], Rendre la question 'question2' obligatoire",
    ],
  };
}
