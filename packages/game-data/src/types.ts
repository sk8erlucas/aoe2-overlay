export interface LocalizedName {
  en: string;
  es: string;
}

export type Locale = keyof LocalizedName;
