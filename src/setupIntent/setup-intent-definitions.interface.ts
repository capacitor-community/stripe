import type {CreateSetupIntentOption} from '../shared';

export interface SetupIntentDefinitions {
  createSetupIntent(options: CreateSetupIntentOption): Promise<void>;
  presentSetupIntent(): Promise<void>;
}
