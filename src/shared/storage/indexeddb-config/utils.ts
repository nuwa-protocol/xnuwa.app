import { NuwaIdentityKit } from '@/shared/services/identity-kit';

export const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};
