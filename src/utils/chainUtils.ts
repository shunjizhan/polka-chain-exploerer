import { ApiPromise, WsProvider } from '@polkadot/api';
import { typesBundle, typesChain } from '@polkadot/apps-config';
import { Metadata } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { StatusContext } from '@polkadot/react-components/Status';
import ApiSigner from '@polkadot/react-signer/ApiSigner';

// const registry = new TypeRegistry();
// const { queuePayload, queueSetTxStatus } = useContext(StatusContext);

export const createRpc = async (rpc: string): Promise<ApiPromise> => {
  console.log(`connecting to ${rpc}...`);

  const wsProvider = new WsProvider(rpc);

  // const signer = new ApiSigner(registry, queuePayload, queueSetTxStatus);
  const api = await ApiPromise.create({
    provider: wsProvider,
  });

  // const api = new ApiPromise({
  //   provider: wsProvider,
  //   // signer,
  //   // registry,
  //   typesBundle,
  //   typesChain,
  // });

  let err: string | null = null;

  api.on('error', (error: Error) => {
    err = `connection to ${rpc} failed!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!`;
  });

  if (err) {
    throw new Error(err);
  }

  await api.isReady;
  // const res = await api.query.identity.identityOf.k
    
  console.log('connected!!');

  return api;
};


const firstCharToLower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

export const getQueryFn = (api: ApiPromise, query: string): any => {
  const [prefix, name] = query.split('.');

  return api.query[firstCharToLower(prefix)][firstCharToLower(name)];
}

const sortByName = (a, b): number => a.name.localeCompare(b.name);
export const getModules = (api: ApiPromise): any => {
  const { modules } = api.runtimeMetadata.toJSON().metadata!['v13']; 
  console.log(modules);

  const sortedModules = modules.map(m => {
    if (m.storage) {
      m.storage.items = m.storage.items.sort(sortByName);
    }

    return m;
  });

  return sortedModules.sort(sortByName);;
};  
