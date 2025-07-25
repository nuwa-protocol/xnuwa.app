import {
  IdentityKitWeb,
  type UseIdentityKitOptions,
} from '@nuwa-ai/identity-kit-web';

export const NuwaIdentityKit = (options: UseIdentityKitOptions = {}) => {
  const handler = IdentityKitWeb.init({
    appName: 'Nuwa Assistant',
    storage: 'local',
    ...options,
  });

  const connect = async () => {
    await handler.then((handler) => handler.connect());
  };

  const logout = async () => {
    await handler.then((handler) => handler.logout());
  };

  const handleCallback = async (search: string) => {
    await handler.then((handler) => handler.handleCallback(search));
  };

  const getDid = async () => {
    return await handler.then((handler) => handler.getDid());
  };

  return {
    connect,
    logout,
    handleCallback,
    getDid,
  };
};
