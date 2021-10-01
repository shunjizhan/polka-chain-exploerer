import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundle, typesChain } from '@polkadot/apps-config';
import { TypeRegistry } from '@polkadot/types/create';

const registry = new TypeRegistry();

export const createRpc = async (rpc: string): Promise<ApiPromise> => {
  console.log(`connecting to ${rpc}...`);

  const wsProvider = new WsProvider(rpc);

  const api: ApiPromise = await ApiPromise.create({
    provider: wsProvider,
    registry,
    typesBundle,
    typesChain,
  });

  console.log('connected!!');

  return api;
};

const firstCharToLower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const getQueryFn = (api: ApiPromise, query: string): any => {
  const [prefix, name] = query.split('.');

  return api.query[firstCharToLower(prefix)]?.[firstCharToLower(name)];
};

const sortByName = (a, b): number => a.name.localeCompare(b.name);
export const getModules = (api: ApiPromise): any => {
  const { modules } = api.runtimeMetadata.toJSON().metadata!.v13;
  console.log('modules:', modules);

  const sortedModules = modules.map(m => {
    if (m.storage) {
      m.storage.items = m.storage.items.sort(sortByName);
    }

    return m;
  });

  return sortedModules.sort(sortByName);
};
