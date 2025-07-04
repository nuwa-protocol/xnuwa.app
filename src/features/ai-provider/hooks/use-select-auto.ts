import { AUTO_MODEL } from '../stores';
import { useSelectedModel } from './use-selected-model';

export const useSelectAuto = () => {
  const { setSelectedModel } = useSelectedModel();

  const SetModelAuto = () => {
    setSelectedModel(AUTO_MODEL);
  };

  return {
    SetModelAuto,
  };
};
