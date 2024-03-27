export interface IMultilingual {
  translation: Record<string, string>;
}

export interface IMultilingualWithId {
  id: uuid,
  translation: Record<string, string>;
}

export interface IMultilingualEnum {
  id: number,
  translation: Record<string, string>;
}
