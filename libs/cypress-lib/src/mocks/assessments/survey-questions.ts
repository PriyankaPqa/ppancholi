/* eslint-disable max-lines */
import { IAnsweredQuestion, IAssessmentQuestion } from '@libs/entities-lib/assessment-template';

export const propertyStateMockAllComponentsData = {
  logo: {
    default: 'https://api-dev2.crc-tech.ca/system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/en',
    fr: 'https://api-dev2.crc-tech.ca/system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/fr',
  },
  logoPosition: 'right',
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'radiogroup',
          name: 'Property Profile - Owner/Tenant',
          choices: [
            'Owner',
            'Tenant',
          ],
        },
        {
          type: 'rating',
          name: 'Quality of service ?',
        },
        {
          type: 'checkbox',
          name: 'Type of House',
          description: 'Select all applicable boxes',
          choices: [
            'Detached',
            'Semi',
            'Townhouse',
          ],
        },
        {
          type: 'dropdown',
          name: 'Province Name ?',
          choices: [
            'Quebec',
            'Ontario',
            'PEI',
          ],
          placeholder: 'Select Province...',
        },
        {
          type: 'boolean',
          name: 'Need Power of Attorney ?',
        },
        {
          type: 'text',
          name: 'No of household members ?',
          title: 'No of household members ?',
          inputType: 'number',
        },
        {
          type: 'comment',
          name: 'How was your experience ?',
        },
        {
          type: 'multipletext',
          name: 'Name of Primary household member ?',
          items: [
            {
              name: 'First Name',
            },
            {
              name: 'Last Name',
            },
          ],
        },
        {
          type: 'panel',
          name: 'panel1',
          elements: [
            {
              type: 'text',
              name: 'Test Dynamic Panel ?',
            },
          ],
        },
        {
          type: 'paneldynamic',
          name: 'Household information ?',
          templateElements: [
            {
              type: 'text',
              name: 'No of pets ?',
            },
            {
              type: 'text',
              name: 'No of children ?',
            },
          ],
        },
        {
          type: 'matrix',
          name: 'Level of Satisfaction ?',
          columns: [
            'Very Satisfied',
            'Satisfied',
            'Dissatisfied',
          ],
          rows: [
            'Clothing',
            'Accomodation',
          ],
        },
        {
          type: 'matrixdropdown',
          name: 'Respond to the multiple choice matrix below:',
          columns: [
            {
              name: 'Column Multiple Choice Matrix 1',
            },
            {
              name: 'Column Multiple Choice Matrix 2',
            },
            {
              name: 'Column Multiple Choice Matrix 3',
            },
          ],
          choices: [
            1,
            2,
            3,
            4,
            5,
          ],
          placeholder: 'Select Multiple Choice Matrix Inputs ...',
          rows: [
            'Row Multiple Choice Matrix 1',
            'Row Multiple Choice Matrix 2',
          ],
        },
        {
          type: 'matrixdynamic',
          name: 'question2',
          title: 'Respond to the dynamic matrix below:',
          columns: [
            {
              name: 'Column Dynamic Matrix 1',
            },
            {
              name: 'Column Dynamic Matrix 2',
            },
            {
              name: 'Column Dynamic Matrix 3',
            },
          ],
          choices: [
            1,
            2,
            3,
            4,
            5,
          ],
          placeholder: 'Select Dynamic Matrix Inputs...',
        },
        {
          type: 'yes-no',
          name: 'Are you impacted ?',
          title: 'Are you impacted ?',
        },
        {
          type: 'html',
          name: 'Html Element',
          // eslint-disable-next-line
          "html": "<p><u>Note to Case Managers:</u> This form is <u>not</u> intended to be read to the impacted household, but rather to summarize and recommend assistance based upon your conversations with the impacted household. If you do not have the necessary information that is needed for the recommendation for assistance, please schedule another appointment to collect further information and use this form to guide your conversation.</p>"
        },
        {
          type: 'image',
          name: 'image automation testing',
          imageLink: 'https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg',
        },
      ],
    },
  ],
  clearInvisibleValues: 'onHiddenContainer',
};

export const propertyQuestionsMockAllComponentsData: IAssessmentQuestion[] = [
  {
    identifier: 'Property Profile - Owner/Tenant',
    questionType: 'radiogroup',
    question: {
      translation: {
        en: 'Property Profile - Owner/Tenant',
        fr: 'Property Profile - Owner/Tenant',
      },
    },
    answerChoices: [
      {
        identifier: 'Owner',
        displayValue: {
          translation: {
            en: 'Owner',
            fr: 'Owner',
          },
        },
        textValue: 'Owner',
        score: null,
      },
      {
        identifier: 'Tenant',
        displayValue: {
          translation: {
            en: 'Tenant',
            fr: 'Tenant',
          },
        },
        textValue: 'Tenant',
        score: null,
      },
    ],
  },
  {
    identifier: 'Quality of service ?',
    questionType: 'rating',
    question: {
      translation: {
        en: 'Quality of service ?',
        fr: 'Quality of service ?',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Type of House',
    questionType: 'checkbox',
    question: {
      translation: {
        en: 'Type of House',
        fr: 'Type of House',
      },
    },
    answerChoices: [
      {
        identifier: 'Detached',
        displayValue: {
          translation: {
            en: 'Detached',
            fr: 'Detached',
          },
        },
        textValue: 'Detached',
        score: null,
      },
      {
        identifier: 'Semi',
        displayValue: {
          translation: {
            en: 'Semi',
            fr: 'Semi',
          },
        },
        textValue: 'Semi',
        score: null,
      },
      {
        identifier: 'Townhouse',
        displayValue: {
          translation: {
            en: 'Townhouse',
            fr: 'Townhouse',
          },
        },
        textValue: 'Townhouse',
        score: null,
      },
    ],
  },
  {
    identifier: 'Province Name ?',
    questionType: 'dropdown',
    question: {
      translation: {
        en: 'Province Name ?',
        fr: 'Province Name ?',
      },
    },
    answerChoices: [
      {
        identifier: 'Quebec',
        displayValue: {
          translation: {
            en: 'Quebec',
            fr: 'Quebec',
          },
        },
        textValue: 'Quebec',
        score: null,
      },
      {
        identifier: 'Ontario',
        displayValue: {
          translation: {
            en: 'Ontario',
            fr: 'Ontario',
          },
        },
        textValue: 'Ontario',
        score: null,
      },
      {
        identifier: 'PEI',
        displayValue: {
          translation: {
            en: 'PEI',
            fr: 'PEI',
          },
        },
        textValue: 'PEI',
        score: null,
      },
    ],
  },
  {
    identifier: 'Need Power of Attorney ?',
    questionType: 'boolean',
    question: {
      translation: {
        en: 'Need Power of Attorney ?',
        fr: 'Need Power of Attorney ?',
      },
    },
    answerChoices: [
      {
        identifier: 'true',
        displayValue: {
          translation: {
            en: 'Yes',
            fr: 'Oui',
          },
        },
        textValue: 'true',
        score: null,
      },
      {
        identifier: 'false',
        displayValue: {
          translation: {
            en: 'No',
            fr: 'Non',
          },
        },
        textValue: 'false',
        score: null,
      },
    ],
  },
  {
    identifier: 'No of household members ?',
    questionType: 'text',
    question: {
      translation: {
        en: 'No of household members ?',
        fr: 'No of household members ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'How was your experience ?',
    questionType: 'comment',
    question: {
      translation: {
        en: 'How was your experience ?',
        fr: 'How was your experience ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Name of Primary household member ?|First Name',
    questionType: 'multipletext',
    question: {
      translation: {
        en: 'Name of Primary household member ?|First Name',
        fr: 'Name of Primary household member ?|First Name',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Name of Primary household member ?|Last Name',
    questionType: 'multipletext',
    question: {
      translation: {
        en: 'Name of Primary household member ?|Last Name',
        fr: 'Name of Primary household member ?|Last Name',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Test Dynamic Panel ?',
    questionType: 'text',
    question: {
      translation: {
        en: 'Test Dynamic Panel ?',
        fr: 'Test Dynamic Panel ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Household information ?',
    questionType: 'paneldynamic',
    question: {
      translation: {
        en: 'Household information ?',
        fr: 'Household information ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Household information ?|No of pets ?',
    questionType: 'text',
    question: {
      translation: {
        en: 'No of pets ?',
        fr: 'No of pets ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Household information ?|No of children ?',
    questionType: 'text',
    question: {
      translation: {
        en: 'No of children ?',
        fr: 'No of children ?',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'Level of Satisfaction ?|Clothing',
    questionType: 'matrix',
    question: {
      translation: {
        en: 'Level of Satisfaction ?|Clothing',
        fr: 'Level of Satisfaction ?|Clothing',
      },
    },
    answerChoices: [
      {
        identifier: 'Very Satisfied',
        displayValue: {
          translation: {
            en: 'Very Satisfied',
            fr: 'Very Satisfied',
          },
        },
        textValue: 'Very Satisfied',
        score: null,
      },
      {
        identifier: 'Satisfied',
        displayValue: {
          translation: {
            en: 'Satisfied',
            fr: 'Satisfied',
          },
        },
        textValue: 'Satisfied',
        score: null,
      },
      {
        identifier: 'Dissatisfied',
        displayValue: {
          translation: {
            en: 'Dissatisfied',
            fr: 'Dissatisfied',
          },
        },
        textValue: 'Dissatisfied',
        score: null,
      },
    ],
  },
  {
    identifier: 'Level of Satisfaction ?|Accomodation',
    questionType: 'matrix',
    question: {
      translation: {
        en: 'Level of Satisfaction ?|Accomodation',
        fr: 'Level of Satisfaction ?|Accomodation',
      },
    },
    answerChoices: [
      {
        identifier: 'Very Satisfied',
        displayValue: {
          translation: {
            en: 'Very Satisfied',
            fr: 'Very Satisfied',
          },
        },
        textValue: 'Very Satisfied',
        score: null,
      },
      {
        identifier: 'Satisfied',
        displayValue: {
          translation: {
            en: 'Satisfied',
            fr: 'Satisfied',
          },
        },
        textValue: 'Satisfied',
        score: null,
      },
      {
        identifier: 'Dissatisfied',
        displayValue: {
          translation: {
            en: 'Dissatisfied',
            fr: 'Dissatisfied',
          },
        },
        textValue: 'Dissatisfied',
        score: null,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 1',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 1',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 1',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 2',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 2',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 2',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 3',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 3',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 1|Column Multiple Choice Matrix 3',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 1',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 1',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 1',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 2',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 2',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 2',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 3',
    questionType: 'matrixdropdown',
    question: {
      translation: {
        en: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 3',
        fr: 'Respond to the multiple choice matrix below:|Row Multiple Choice Matrix 2|Column Multiple Choice Matrix 3',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'question2',
    questionType: 'matrixdynamic',
    question: {
      translation: {
        en: 'Respond to the dynamic matrix below:',
        fr: 'Respond to the dynamic matrix below:',
      },
    },
    answerChoices: null,
  },
  {
    identifier: 'question2|Column Dynamic Matrix 1',
    questionType: 'dropdown',
    question: {
      translation: {
        en: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 1',
        fr: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 1',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'question2|Column Dynamic Matrix 2',
    questionType: 'dropdown',
    question: {
      translation: {
        en: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 2',
        fr: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 2',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'question2|Column Dynamic Matrix 3',
    questionType: 'dropdown',
    question: {
      translation: {
        en: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 3',
        fr: 'Respond to the dynamic matrix below:|Column Dynamic Matrix 3',
      },
    },
    answerChoices: [
      {
        identifier: '1',
        displayValue: {
          translation: {
            en: '1',
            fr: '1',
          },
        },
        textValue: '1',
        score: null,
        numericValue: 1,
      },
      {
        identifier: '2',
        displayValue: {
          translation: {
            en: '2',
            fr: '2',
          },
        },
        textValue: '2',
        score: null,
        numericValue: 2,
      },
      {
        identifier: '3',
        displayValue: {
          translation: {
            en: '3',
            fr: '3',
          },
        },
        textValue: '3',
        score: null,
        numericValue: 3,
      },
      {
        identifier: '4',
        displayValue: {
          translation: {
            en: '4',
            fr: '4',
          },
        },
        textValue: '4',
        score: null,
        numericValue: 4,
      },
      {
        identifier: '5',
        displayValue: {
          translation: {
            en: '5',
            fr: '5',
          },
        },
        textValue: '5',
        score: null,
        numericValue: 5,
      },
    ],
  },
  {
    identifier: 'Are you impacted ?',
    questionType: 'yes-no',
    question: {
      translation: {
        en: 'Are you impacted ?',
        fr: 'Are you impacted ?',
      },
    },
    answerChoices: [
      {
        identifier: 'yes',
        displayValue: {
          translation: {
            en: 'Yes',
            fr: 'Oui',
          },
        },
        textValue: 'yes',
        score: null,
      },
      {
        identifier: 'no',
        displayValue: {
          translation: {
            en: 'No',
            fr: 'Non',
          },
        },
        textValue: 'no',
        score: null,
      },
    ],
  },
];

export const propertyStateMockUpdateAssessmentData = {
  logo: {
    default: 'https://api-dev2.crc-tech.ca/system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/en',
    fr: 'https://api-dev2.crc-tech.ca/system-management/tenant-settings/56f61c9c-0a6f-4be2-954d-941c9f02cb4c/logo/fr',
  },
  logoPosition: 'right',
  pages: [
    {
      name: 'page1',
      elements: [
        {
          type: 'yes-no',
          name: 'question1',
          title: 'Do you have school aged children',
          scoreFalse: 10,
          scoreTrue: 5,
        },
        {
          type: 'boolean',
          name: 'question2',
          title: 'Is you home livable ?',
        },
      ],
    },
  ],
  clearInvisibleValues: 'onHiddenContainer',
};

export const propertyQuestionsMockUpdateAssessmentObject: IAssessmentQuestion[] = [
  {
    identifier: 'question1',
    questionType: 'yes-no',
    question: {
      translation: {
        en: 'Do you have school aged children ?',
        fr: 'Do you have school aged children ?',
      },
    },
    answerChoices: [{
      identifier: 'yes',
      displayValue: {
        translation: {
          en: 'Yes',
          fr: 'Oui',
        },
      },
      textValue: 'yes',
      score: 10,
    },
    {
      identifier: 'no',
      displayValue: {
        translation: {
          en: 'No',
          fr: 'Non',
        },
      },
      textValue: 'no',
      score: 5,
    }],
  },
  {
    identifier: 'question2',
    questionType: 'boolean',
    question: {
      translation: {
        en: 'Is you home livable ?',
        fr: 'Is you home livable ?',
      },
    },
    answerChoices: [{
      identifier: 'true',
      displayValue: {
        translation: {
          en: 'Yes',
          fr: 'Oui',
        },
      },
      textValue: 'true',
      score: null,
    },
    {
      identifier: 'false',
      displayValue: {
        translation: {
          en: 'No',
          fr: 'Non',
        },
      },
      textValue: 'false',
      score: null,
    }],
  },
];

export const rawPropertyStateMockPartialAssessmentData = {
  question1: 'no',
  _currentPageNo: 0,
};

export const propertyStateMockRequestPartialAssessmentData = [
  {
    name: 'question1',
    title: 'Do you have school aged children',
    value: 'no',
    displayValue: 'Non',
    isNode: false,
    questionType: 'yes-no',
  },
];

export const propertyAnswersMockPartialAssessmentData: IAnsweredQuestion[] = [
  {
    assessmentQuestionIdentifier: 'question1',
    responses: [
      {
        displayValue: 'Non',
        textValue: 'no',
        numericValue: null,
      },
    ],
  },
];

export const rawPropertyStateMockSaveAssessmentData = {
  question1: 'no',
  question2: false,
  _currentPageNo: 0,
};

export const propertyStateMockSaveAssessmentData = [
  {
    name: 'question1',
    title: 'Do you have school aged children',
    value: 'no',
    displayValue: 'Non',
    isNode: false,
    questionType: 'yes-no',
  },
  {
    name: 'question2',
    title: 'Is your home livable?',
    value: false,
    displayValue: 'Non',
    isNode: false,
    questionType: 'boolean',
  },
];

export const propertyAnswersMockSaveAssessmentData: IAnsweredQuestion[] = [
  {
    assessmentQuestionIdentifier: 'question1',
    responses: [
      {
        displayValue: 'Non',
        textValue: 'no',
        numericValue: null,
      },
    ],
  },
  {
    assessmentQuestionIdentifier: 'question2',
    responses: [
      {
        displayValue: 'Non',
        textValue: 'false',
        numericValue: null,
      },
    ],
  },
];

export const rawPropertyStateMockEditAssessmentData = {
  question1: 'yes',
  question2: false,
  _currentPageNo: 0,
};

export const propertyStateMockEditAssessmentData = [
  {
    name: 'question1',
    title: 'Do you have school aged children',
    value: 'yes',
    displayValue: 'Yes',
    isNode: false,
    questionType: 'yes-no',
  },
  {
    name: 'question2',
    title: 'Is your home livable?',
    value: false,
    displayValue: 'Non',
    isNode: false,
    questionType: 'boolean',
  },
];

export const propertyAnswersMockEditAssessmentData: IAnsweredQuestion[] = [
  {
    assessmentQuestionIdentifier: 'question1',
    responses: [
      {
        displayValue: 'Yes',
        textValue: 'yes',
        numericValue: null,
      },
    ],
  },
  {
    assessmentQuestionIdentifier: 'question2',
    responses: [
      {
        displayValue: 'Non',
        textValue: 'false',
        numericValue: null,
      },
    ],
  },
];
