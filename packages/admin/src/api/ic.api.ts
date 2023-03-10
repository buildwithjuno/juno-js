import type {_SERVICE as ICActor} from '../../declarations/ic/ic.did';
import type {ActorParameters} from '../types/actor.types';
import type {InstallCodeParams} from '../types/ic.types';
import {getICActor} from './actor.api';

export const upgradeCode = async ({
  actor,
  code
}: {
  actor: ActorParameters;
  code: Omit<InstallCodeParams, 'mode'>;
}): Promise<void> => {
  const {install_code}: ICActor = await getICActor(actor);

  return install_code({
    ...code,
    mode: {upgrade: null}
  });
};
