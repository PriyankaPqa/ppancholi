import { mockBaseData } from '../base';
import { IOptionItem } from '../optionItem';
import {
  EFinancialAmountModes,
  EFinancialFrequency,
  IFinancialAssistanceTableItem,
  IFinancialAssistanceTableSubItem,
  IFinancialAssistanceTableMetadata,
  IFinancialAssistanceTableEntity,
  IFinancialAssistanceTableCombined,
  IFinancialAssistanceTableSubItemData,
  IFinancialAssistanceTableItemData,
} from './financial-assistance.types';

export const mockSubItems = (): IFinancialAssistanceTableSubItem[] => [
  {
    subCategory: {
      ...mockBaseData(),
      name: { translation: { en: "Children's Supplies", fr: 'Articles pour enfants' } },
      description: null,
      orderRank: 2,
      isOther: false,
      isDefault: false,
    },
    maximumAmount: 1,
    amountType: EFinancialAmountModes.Fixed,
    documentationRequired: false,
    frequency: EFinancialFrequency.OneTime,
  },
  {
    subCategory: {
      name: { translation: { en: 'Recreational Activity', fr: 'Activité récréative' } },
      description: null,
      orderRank: 3,
      isOther: false,
      isDefault: false,
      ...mockBaseData(),
    },
    maximumAmount: 2,
    amountType: EFinancialAmountModes.Variable,
    documentationRequired: true,
    frequency: EFinancialFrequency.Multiple,
  },
];

export const mockSubItemData = (): IFinancialAssistanceTableSubItemData => ({
  subCategory: {
    optionItemId: 'optionItemId',
    specifiedOther: null,
  },
  maximumAmount: 1,
  amountType: EFinancialAmountModes.Fixed,
  documentationRequired: false,
  frequency: EFinancialFrequency.OneTime,
});

export const mockItems = (): IFinancialAssistanceTableItem[] => [
  {
    mainCategory: {
      name: { translation: { en: "Children's Needs", fr: "Besoins d'enfants" } },
      description: null,
      orderRank: 3,
      isOther: false,
      isDefault: false,
      subitems: [
        {
          ...mockBaseData(),
          name: { translation: { en: 'Child Care', fr: 'Service de gardiennage et de garderie' } },
          description: null,
          orderRank: 1,
          isOther: false,
          isDefault: false,
        },
        {
          ...mockBaseData(),
          name: { translation: { en: "Children's Supplies", fr: 'Articles pour enfants' } },
          description: null,
          orderRank: 2,
          isOther: false,
          isDefault: false,
        },
        {
          ...mockBaseData(),
          name: { translation: { en: 'Recreational Activity', fr: 'Activité récréative' } },
          description: null,
          orderRank: 3,
          isOther: false,
          isDefault: false,
        },
      ],
      ...mockBaseData(),
    },
    subItems: [
      {
        subCategory: {
          name: { translation: { en: "Children's Supplies", fr: 'Articles pour enfants' } },
          description: null,
          orderRank: 2,
          isOther: false,
          isDefault: false,
          ...mockBaseData(),
        },
        maximumAmount: 1,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      },
      {
        subCategory: {
          name: { translation: { en: 'Recreational Activity', fr: 'Activité récréative' } },
          description: null,
          orderRank: 3,
          isOther: false,
          isDefault: false,
          ...mockBaseData(),
        },
        maximumAmount: 2,
        amountType: EFinancialAmountModes.Variable,
        documentationRequired: true,
        frequency: EFinancialFrequency.Multiple,
      },
    ],
  },
  {
    mainCategory: {
      name: { translation: { en: 'Household Goods', fr: 'Articles ménagers' } },
      description: null,
      orderRank: 8,
      isOther: false,
      isDefault: false,
      subitems: [
        {
          ...mockBaseData(),
          name: { translation: { en: 'Fridge Replacement', fr: 'Remplacement de réfrigérateur' } },
          description: null,
          orderRank: 1,
          isOther: false,
          isDefault: false,
        },
        {
          ...mockBaseData(),
          name: { translation: { en: 'Fridge Removal', fr: 'Retrait du réfrigérateur' } },
          description: null,
          orderRank: 2,
          isOther: false,
          isDefault: false,
        },
        {
          name: { translation: { en: 'Household Goods Replacement', fr: "Remplacement d'articles ménagers" } },
          description: null,
          orderRank: 3,
          isOther: false,
          isDefault: false,
          ...mockBaseData(),
        },
        {
          name: { translation: { en: 'Storage/Moving', fr: 'Entreposage ou déménagement' } },
          description: null,
          orderRank: 4,
          isOther: false,
          isDefault: false,
          ...mockBaseData(),
        },
      ],
      ...mockBaseData(),
    },
    subItems: [
      {
        subCategory: {
          ...mockBaseData(),
          name: { translation: { en: 'Storage/Moving', fr: 'Entreposage ou déménagement' } },
          description: null,
          orderRank: 4,
          isOther: false,
          isDefault: false,
        },
        maximumAmount: 3,
        amountType: EFinancialAmountModes.Fixed,
        documentationRequired: false,
        frequency: EFinancialFrequency.OneTime,
      },
    ],
  },
];

export const mockItemData = (): IFinancialAssistanceTableItemData => ({
  mainCategory: {
    optionItemId: 'optionItemId',
    specifiedOther: null,
  },
  subItems: [mockSubItemData()],
});

export const mockFinancialAssistanceTableEntity = (): IFinancialAssistanceTableEntity => ({
  ...mockBaseData(),

  eventId: '8d88bc46-22c2-412d-814d-ff898357b745',
  programId: '657ae9a1-bfcc-4292-b871-8113b984e9cb',
  name: { translation: { en: 'abcd', fr: 'dcba' } },
  items: [
    {
      mainCategory: { optionItemId: '9b275d2f-00a1-4345-94fe-c37b84beb400', specifiedOther: null },
      subItems: [
        {
          subCategory: { optionItemId: '7eb37c59-4947-4edf-8146-c2458bd2b6f6', specifiedOther: null },
          maximumAmount: 1,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
        },
      ],
    },
    {
      mainCategory: { optionItemId: '62421874-aed8-43bb-a668-bff1f45f08df', specifiedOther: null },
      subItems: [
        {
          subCategory: { optionItemId: '1d37919e-044e-44b9-99a4-d9a5f4fd5b13', specifiedOther: null },
          maximumAmount: 2,
          amountType: EFinancialAmountModes.Variable,
          documentationRequired: true,
          frequency: EFinancialFrequency.Multiple,
        },
        {
          subCategory: { optionItemId: '93897f29-c48d-414c-9dd7-d533759b32e6', specifiedOther: null },
          maximumAmount: 3,
          amountType: EFinancialAmountModes.Fixed,
          documentationRequired: false,
          frequency: EFinancialFrequency.OneTime,
        },
      ],
    },
  ],
});

export const mockFinancialAssistanceMetadata = (): IFinancialAssistanceTableMetadata => ({
  ...mockBaseData(),

  programId: '657ae9a1-bfcc-4292-b871-8113b984e9cb',
  programName: { translation: { en: 'abcd', fr: 'dcba' } },
  financialAssistanceTableStatusName: { translation: { en: 'status en', fr: 'status fr' } },
});

export const mockCombinedFinancialAssistance = (): IFinancialAssistanceTableCombined => ({
  entity: mockFinancialAssistanceTableEntity(),
  metadata: mockFinancialAssistanceMetadata(),
});

export const mockCombinedFinancialAssistances = (): IFinancialAssistanceTableCombined[] => ([mockCombinedFinancialAssistance()]);

const categories: IOptionItem[] = [
  {
    ...mockBaseData(),
    name: { translation: { en: 'Accommodation', fr: 'Hébergement' } },
    description: null,
    orderRank: 1,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        ...mockBaseData(),
        name: { translation: { en: 'Campground', fr: 'Terrain de camping' } },
        description: null,
        orderRank: 1,
        isOther: false,
        isDefault: false,
      },
      {
        ...mockBaseData(),
        name: { translation: { en: 'Hotel/Motel', fr: ' Hôtel ou motel' } },
        description: null,
        orderRank: 2,
        isOther: false,
        isDefault: false,
      },
      {
        ...mockBaseData(),
        name: { translation: { en: 'Family/Friends', fr: 'Parent ou amis' } },
        description: null,
        orderRank: 3,
        isOther: false,
        isDefault: false,
      },
      {
        ...mockBaseData(),
        name: { translation: { en: 'Insurance/Government Program Deductible', fr: "Franchises d'assurance ou de programme gouvernemental" } },
        description: null,
        orderRank: 4,
        isOther: false,
        isDefault: false,
      },
      {
        ...mockBaseData(),
        name: { translation: { en: 'Temporary Accommodation', fr: 'Hébergement temporaire' } },
        description: { translation: { en: '', fr: '' } },
        orderRank: 5,
        isOther: false,
        isDefault: false,
      },
      {
        ...mockBaseData(),
        name: { translation: { en: 'Mortgage Assistance', fr: 'Aide hypothécaire' } },
        description: { translation: { en: '', fr: '' } },
        orderRank: 6,
        isOther: false,
        isDefault: false,
        id: '212565f3-6eb1-4dfc-adf5-4e23d26a4d47',
        status: 1,
      },
    ],
    id: 'e94d2922-699a-4aeb-b5f6-32015b134277',
    status: 1,
  },
  {
    ...mockBaseData(),
    name: { translation: { en: 'Basic Needs', fr: 'Besoins essentiels' } },
    description: null,
    orderRank: 2,
    isOther: false,
    isDefault: false,
    subitems: [
      {
        name: { translation: { en: 'Basic Needs', fr: 'Besoins essentiels' } },
        description: null,
        orderRank: 1,
        isOther: false,
        isDefault: false,
        ...mockBaseData(),
      },
      {
        name: { translation: { en: 'Supplement', fr: 'Supplément' } },
        description: null,
        orderRank: 2,
        isOther: false,
        isDefault: false,
        ...mockBaseData(),
      },
    ],
    id: '6baa1ece-7ff5-4810-99b0-fdb0760da1f5',
    status: 1,
  },
];

export const mockCategories = (): IOptionItem[] => categories;
