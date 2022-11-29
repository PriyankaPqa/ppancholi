import { SurveyJsTextExtractor } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';
import { surveyData } from './SurveyJs.specdata';

let extractor = new SurveyJsTextExtractor('en');

describe('SurveyJsTextExtractor', () => {
  beforeEach(async () => {
    extractor = new SurveyJsTextExtractor('en');
    jest.clearAllMocks();
  });

  describe('extractAllText', () => {
    it('extracts for SurveyForExtract', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.surveyForExtract));
      expect(result).toEqual(surveyData.surveyExtracted);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.surveyForExtract));
      expect(result).toEqual(surveyData.surveyExtractedFr);
    });

    it('extractAllText for text question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.textQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text eng',
        type: 'text',
      }]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.textQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text fr',
        type: 'text',
      }]);
    });

    it('extractAllText for checkboxQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.checkboxQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [
          {
            score: 1,
            text: 'item 1 en',
            value: 'item1',
          },
          {
            score: 2,
            text: 'item 2 en',
            value: 'item2',
          },
          {
            score: null,
            text: 'item3',
            value: 'item3',
          },
          {
            score: null,
            text: 'Other (describe) en',
            value: 'other',
          },
          {
            score: null,
            text: 'None',
            value: 'none',
          },
        ],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text eng',
        type: 'checkbox',
      }]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.checkboxQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [
          {
            score: 1,
            text: 'item 1 fr',
            value: 'item1',
          },
          {
            score: 2,
            text: 'item 2 fr',
            value: 'item2',
          },
          {
            score: null,
            text: 'item3',
            value: 'item3',
          },
          {
            score: null,
            text: 'other fr',
            value: 'other',
          },
          {
            score: null,
            text: 'Aucun',
            value: 'none',
          },
        ],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text fr',
        type: 'checkbox',
      }]);
    });

    it('extractAllText for radiogroupQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.radiogroupQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [
          {
            score: 1,
            text: 'item 1 en',
            value: 'item1',
          },
          {
            score: 2,
            text: 'item 2 en',
            value: 'item2',
          },
          {
            score: null,
            text: 'item3',
            value: 'item3',
          },
          {
            score: null,
            text: 'Other (describe)',
            value: 'other',
          },
          {
            score: null,
            text: 'None',
            value: 'none',
          },
        ],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text eng',
        type: 'radiogroup',
      }]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.radiogroupQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [
          {
            score: 1,
            text: 'item 1 fr',
            value: 'item1',
          },
          {
            score: 2,
            text: 'item 2 fr',
            value: 'item2',
          },
          {
            score: null,
            text: 'item3',
            value: 'item3',
          },
          {
            score: null,
            text: 'Autre (préciser)',
            value: 'other',
          },
          {
            score: null,
            text: 'Aucun',
            value: 'none',
          },
        ],
        description: '',
        elements: [],
        identifier: 'question1',
        isRequired: false,
        title: 'Text fr',
        type: 'radiogroup',
      }]);
    });

    it('extractAllText for dropdownQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.dropdownQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'dropdown',
          identifier: 'question1',
          title: 'Text eng',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'text',
              identifier: 'Comment',
              title: 'zzz',
              description: '',
              elements: [],
            },
          ],
          choices: [
            {
              value: 'item1',
              text: 'item 1 en',
              score: 1,
            },
            {
              value: 'item2',
              text: 'item 2 en',
              score: 2,
            },
            {
              value: 'item3',
              text: 'item3',
              score: null,
            },
            {
              value: '1',
              text: '1',
              score: null,
            },
            {
              value: '3',
              text: '3',
              score: null,
            },
            {
              value: '5',
              text: '5',
              score: null,
            },
            {
              value: 'none',
              text: 'Nonez',
              score: null,
            },
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.dropdownQuestion));
      expect(result.elements[0].elements).toEqual([{
        choices: [
          {
            score: 1,
            text: 'item 1 fr',
            value: 'item1',
          },
          {
            score: 2,
            text: 'item 2 fr',
            value: 'item2',
          },
          {
            score: null,
            text: 'item3',
            value: 'item3',
          },
          {
            value: '1',
            text: '1',
            score: null,
          },
          {
            value: '3',
            text: '3',
            score: null,
          },
          {
            value: '5',
            text: '5',
            score: null,
          },
          {
            value: 'none',
            text: 'Nonez',
            score: null,
          },
        ],
        description: '',
        elements: [
          {
            description: '',
            elements: [],
            identifier: 'Comment',
            title: 'xxx',
            type: 'text',
          },
        ],
        identifier: 'question1',
        isRequired: false,
        title: 'Text fr',
        type: 'dropdown',
      }]);
    });

    it('extractAllText for commentQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.commentQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'comment',
          identifier: 'question1',
          title: 'question1',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.commentQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'comment',
          identifier: 'question1',
          title: 'question1',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        }]);
    });

    it('extractAllText for booleanQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.booleanQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'boolean',
          identifier: 'question1',
          title: 'dddd',
          description: '',
          isRequired: false,
          elements: [],
          choices: [
            {
              value: '123',
              text: 'why yes',
              score: 1,
            },
            {
              value: 'false',
              text: 'No',
              score: 2,
            },
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.booleanQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'boolean',
          identifier: 'question1',
          title: 'xxx',
          description: '',
          isRequired: false,
          elements: [],
          choices: [
            {
              value: '123',
              text: 'ouiii',
              score: 1,
            },
            {
              value: 'false',
              text: 'Non',
              score: 2,
            },
          ],
        },
      ]);
    });

    it('extractAllText for yesnoQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.yesnoQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'yes-no',
          identifier: 'question1',
          title: 'dddd',
          description: '',
          isRequired: false,
          elements: [],
          choices: [
            {
              value: 'yes',
              text: 'Yes',
              score: 12,
            },
            {
              value: 'no',
              text: 'No',
              score: -5,
            },
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.yesnoQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'yes-no',
          identifier: 'question1',
          title: 'xxx',
          description: '',
          isRequired: false,
          elements: [],
          choices: [
            {
              value: 'yes',
              text: 'Oui',
              score: 12,
            },
            {
              value: 'no',
              text: 'Non',
              score: -5,
            },
          ],
        },
      ]);
    });

    it('extractAllText for htmlQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.htmlQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'html',
          identifier: 'question1',
          title: 'hello',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.htmlQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'html',
          identifier: 'question1',
          title: 'hello',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
      ]);
    });

    it('extractAllText for imageQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.imageQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'image',
          identifier: 'question4',
          title: '<div><img src="https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"/></div>',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.imageQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'image',
          identifier: 'question4',
          title: '<div><img src="https://surveyjs.io/Content/Images/examples/image-picker/lion.jpg"/></div>',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
      ]);
    });

    it('extractAllText for multipleTextQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.multipleTextQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'multipletext',
          identifier: 'question1',
          title: 'dddd',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'text',
              identifier: 'sub q 1',
              title: 'sub q 1 text',
              isRequired: false,
              elements: [],
            },
            {
              type: 'text',
              identifier: 'text2',
              title: 'sub q 2 text',
              isRequired: false,
              elements: [],
            },
          ],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.multipleTextQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'multipletext',
          identifier: 'question1',
          title: 'xxx',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'text',
              identifier: 'sub q 1',
              title: 'sub q1 fr',
              isRequired: false,
              elements: [],
            },
            {
              type: 'text',
              identifier: 'text2',
              title: 'sub q 2 text',
              isRequired: false,
              elements: [],
            },
          ],
          choices: [],
        },
      ]);
    });

    it('extractAllText for matrixQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.matrixQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrix',
          identifier: 'question1',
          title: 'dddd',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'row',
              identifier: 'sub q 1',
              title: 'en',
              elements: [],
              choices: [
                {
                  value: 'answer 1',
                  text: '1 en',
                  score: 11,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 21,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: 1,
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
                  value: 'answer 1',
                  text: '1 en',
                  score: 10,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 20,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: null,
                },
              ],
            },
            {
              type: 'row',
              identifier: 'Row 3',
              title: 'Row 3',
              elements: [],
              choices: [
                {
                  value: 'answer 1',
                  text: '1 en',
                  score: 10,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 20,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: null,
                },
              ],
            },
          ],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.matrixQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrix',
          identifier: 'question1',
          title: 'xxx',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'row',
              identifier: 'sub q 1',
              title: 'fr',
              elements: [],
              choices: [
                {
                  value: 'answer 1',
                  text: '1 fr',
                  score: 11,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 21,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: 1,
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
                  value: 'answer 1',
                  text: '1 fr',
                  score: 10,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 20,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: null,
                },
              ],
            },
            {
              type: 'row',
              identifier: 'Row 3',
              title: 'Row 3',
              elements: [],
              choices: [
                {
                  value: 'answer 1',
                  text: '1 fr',
                  score: 10,
                },
                {
                  value: 'answer 2',
                  text: '2 en',
                  score: 20,
                },
                {
                  value: 'Column 3',
                  text: 'Column 3',
                  score: null,
                },
              ],
            },
          ],
          choices: [],
        },
      ]);
    });

    it('extractAllText for matrixDropdownQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.matrixDropdownQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrixdropdown',
          identifier: 'question3',
          title: 'question3',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'row',
              identifier: 'Row 1',
              title: 'lig 1 en',
              elements: [
                {
                  type: 'column',
                  identifier: 'Column 1',
                  title: 'col 1 en',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 15,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 10,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 17,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 10,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 10,
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
                      text: 'hello en',
                      score: 10,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 15,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: 10,
                    },
                    {
                      value: 'other',
                      text: 'Other (describe)zzz',
                      score: 10,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col3',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 15,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 10,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 17,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 10,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 10,
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
                  title: 'col 1 en',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 25,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 20,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 27,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 20,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 20,
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
                      text: 'hello en',
                      score: 20,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 25,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: 20,
                    },
                    {
                      value: 'other',
                      text: 'Other (describe)zzz',
                      score: 20,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col3',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 25,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 20,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 27,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 20,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 20,
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              identifier: 'Row 3',
              title: 'Row 3',
              elements: [
                {
                  type: 'column',
                  identifier: 'Column 1',
                  title: 'col 1 en',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 5,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: null,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 7,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: null,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
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
                      text: 'hello en',
                      score: null,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 5,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: null,
                    },
                    {
                      value: 'other',
                      text: 'Other (describe)zzz',
                      score: null,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col3',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val 1 en',
                      score: 5,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: null,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 7,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: null,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: null,
                    },
                  ],
                },
              ],
            },
          ],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.matrixDropdownQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrixdropdown',
          identifier: 'question3',
          title: 'question3',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'row',
              identifier: 'Row 1',
              title: 'lig 1 en',
              elements: [
                {
                  type: 'column',
                  identifier: 'Column 1',
                  title: 'col 1 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 15,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 10,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 17,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 10,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 10,
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
                      text: 'hello',
                      score: 10,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 15,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: 10,
                    },
                    {
                      value: 'other',
                      text: 'autre',
                      score: 10,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col 3 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 15,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 10,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 17,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 10,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 10,
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              identifier: 'Row 2',
              title: 'ligne 2',
              elements: [
                {
                  type: 'column',
                  identifier: 'Column 1',
                  title: 'col 1 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 25,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 20,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 27,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 20,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 20,
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
                      text: 'hello',
                      score: 20,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 25,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: 20,
                    },
                    {
                      value: 'other',
                      text: 'autre',
                      score: 20,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col 3 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 25,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 20,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 27,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: 20,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: 20,
                    },
                  ],
                },
              ],
            },
            {
              type: 'row',
              identifier: 'Row 3',
              title: 'Row 3',
              elements: [
                {
                  type: 'column',
                  identifier: 'Column 1',
                  title: 'col 1 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 5,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: null,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 7,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: null,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
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
                      text: 'hello',
                      score: null,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: 5,
                    },
                    {
                      value: '3',
                      text: '3',
                      score: null,
                    },
                    {
                      value: 'other',
                      text: 'autre',
                      score: null,
                    },
                  ],
                },
                {
                  type: 'column',
                  identifier: 'col3',
                  title: 'col 3 fr',
                  elements: [],
                  choices: [
                    {
                      value: '1',
                      text: 'val fr',
                      score: 5,
                    },
                    {
                      value: '2',
                      text: '2',
                      score: null,
                    },
                    {
                      value: 'Yep',
                      text: 'Yep',
                      score: 7,
                    },
                    {
                      value: '4',
                      text: '4',
                      score: null,
                    },
                    {
                      value: 'nope',
                      text: 'nope',
                      score: null,
                    },
                  ],
                },
              ],
            },
          ],
          choices: [],
        },
      ]);
    });

    it('extractAllText for ratingQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.ratingQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'rating',
          identifier: 'question5',
          title: 'rating with range',
          description: '',
          isRequired: false,
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
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.ratingQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'rating',
          identifier: 'question5',
          title: 'rating with range',
          description: '',
          isRequired: false,
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
          ],
        },
      ]);
    });

    it('extractAllText for panelQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.panelQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'panel',
          identifier: 'panel1',
          title: 'hello',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'rating',
              identifier: 'question5',
              title: 'rating with range',
              description: '',
              isRequired: false,
              elements: [],
              choices: [
                {
                  value: '2',
                  text: '2',
                  score: null,
                },
                {
                  value: '4',
                  text: '4',
                  score: null,
                },
                {
                  value: '6',
                  text: '6',
                  score: null,
                },
                {
                  value: '8',
                  text: '8',
                  score: null,
                },
              ],
            },
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.panelQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'panel',
          identifier: 'panel1',
          title: 'hello',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'rating',
              identifier: 'question5',
              title: 'rating with range',
              description: '',
              isRequired: false,
              elements: [],
              choices: [
                {
                  value: '2',
                  text: '2',
                  score: null,
                },
                {
                  value: '4',
                  text: '4',
                  score: null,
                },
                {
                  value: '6',
                  text: '6',
                  score: null,
                },
                {
                  value: '8',
                  text: '8',
                  score: null,
                },
              ],
            },
          ],
        },
      ]);
    });

    it('extractAllText for dynamicPanelQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.dynamicPanelQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'text',
          identifier: 'your name',
          title: 'your name',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
        {
          type: 'paneldynamic',
          identifier: 'additional member panel',
          title: 'Add additional members',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'text',
              identifier: 'additional member fname',
              title: 'first name',
              description: '',
              isRequired: false,
              elements: [],
              choices: [],
            },
            {
              type: 'text',
              identifier: 'additional member lname',
              title: 'last name',
              description: '',
              isRequired: false,
              elements: [],
              choices: [],
            },
            {
              type: 'paneldynamic',
              identifier: 'complaint panel',
              title: 'every complaint that person has',
              description: '',
              isRequired: false,
              elements: [
                {
                  type: 'comment',
                  identifier: 'describe the issue',
                  title: 'describe the issue',
                  description: '',
                  isRequired: false,
                  elements: [],
                  choices: [],
                },
              ],
            },
          ],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.dynamicPanelQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'text',
          identifier: 'your name',
          title: 'your name',
          description: '',
          isRequired: false,
          elements: [],
          choices: [],
        },
        {
          type: 'paneldynamic',
          identifier: 'additional member panel',
          title: 'Ajouter membres',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'text',
              identifier: 'additional member fname',
              title: 'Prénom',
              description: '',
              isRequired: false,
              elements: [],
              choices: [],
            },
            {
              type: 'text',
              identifier: 'additional member lname',
              title: 'Nom de famille',
              description: '',
              isRequired: false,
              elements: [],
              choices: [],
            },
            {
              type: 'paneldynamic',
              identifier: 'complaint panel',
              title: 'Chaque plainte',
              description: '',
              isRequired: false,
              elements: [
                {
                  type: 'comment',
                  identifier: 'describe the issue',
                  title: 'décrire',
                  description: '',
                  isRequired: false,
                  elements: [],
                  choices: [],
                },
              ],
            },
          ],
        },
      ]);
    });

    it('extractAllText for matrixdynamicQuestion question', () => {
      let result = extractor.extractAllText(JSON.parse(surveyData.matrixdynamicQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrixdynamic',
          identifier: 'relativeillness',
          title: 'Describe the illness or condition.',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'column',
              identifier: 'illness',
              title: 'Illness/Condition',
              elements: [],
              choices: [
                {
                  value: 'Heart Disease',
                  text: 'Heart Disease',
                  score: null,
                },
                {
                  value: 'Diabetes',
                  text: 'Diabetes type A',
                  score: null,
                },
                {
                  value: 'Stroke/TIA',
                  text: 'Stroke en',
                  score: null,
                },
                {
                  value: 'High Blood Pressure',
                  text: 'High Blood Pressure',
                  score: null,
                },
              ],
            },
            {
              type: 'column',
              identifier: 'really',
              title: 'reallly ?? en',
              elements: [],
              choices: [
                {
                  value: 'yes',
                  text: 'yes en',
                  score: 10,
                },
                {
                  value: 'no',
                  text: 'en',
                  score: null,
                },
                {
                  value: 'maybe',
                  text: 'maybe',
                  score: 5,
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
          ],
          choices: [],
        },
      ]);

      extractor.locale = 'fr';
      result = extractor.extractAllText(JSON.parse(surveyData.matrixdynamicQuestion));
      expect(result.elements[0].elements).toEqual([
        {
          type: 'matrixdynamic',
          identifier: 'relativeillness',
          title: 'Describe the illness or condition.',
          description: '',
          isRequired: false,
          elements: [
            {
              type: 'column',
              identifier: 'illness',
              title: 'Illness/Condition',
              elements: [],
              choices: [
                {
                  value: 'Heart Disease',
                  text: 'Maladie du coeur',
                  score: null,
                },
                {
                  value: 'Diabetes',
                  text: 'Diabetes type A',
                  score: null,
                },
                {
                  value: 'Stroke/TIA',
                  text: 'Stroke fr',
                  score: null,
                },
                {
                  value: 'High Blood Pressure',
                  text: 'High Blood Pressure',
                  score: null,
                },
              ],
            },
            {
              type: 'column',
              identifier: 'really',
              title: 'vraiment ??',
              elements: [],
              choices: [
                {
                  value: 'yes',
                  text: 'oui',
                  score: 10,
                },
                {
                  value: 'no',
                  text: 'en',
                  score: null,
                },
                {
                  value: 'maybe',
                  text: 'maybe fr',
                  score: 5,
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
          ],
          choices: [],
        },
      ]);
    });
  });

  describe('extractLogic', () => {
    it('extracts logic descriptions', () => {
      const logic = extractor.extractLogic(JSON.parse(surveyData.complexWithLogic));
      expect(logic).toEqual(
        {
          logicItems: [
            "If ('cbox' Contains 'item1') and ('cbox' Contains 'item3'), make question 'ddown' visible",
            "If 'ddown' Not empty and ('cbox' == ['item1']), make question 'qText' visible, make question 'qbool' enable",
            "If 'qText' != 'nope', make question 'yes-noq' required",
            "If 'yes-noq' == 'yes', make question 'question2' visible",
            "If 'cbox' == ['item2'], survey skip to the question 'yes-noq'",
          ],
          requiredQuestions: [
            'cbox',
          ],
        },
      );
    });
  });
});
