import { ClassifierResult } from '../services/classifier';

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Result: {
    imageUri: string;
    classifierResult: ClassifierResult;
    /** When true, skip saving again / soften AI auto-fetch messaging. */
    fromHistory?: boolean;
  };
  Chatbot: {
    contextMessage?: string;
  };
  History: undefined;
};
