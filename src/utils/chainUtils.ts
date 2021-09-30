import { ApiPromise, WsProvider } from '@polkadot/api';
import { SignedBlock } from '@polkadot/types/interfaces';
import { AnyJson } from '@polkadot/types/types';
import { TableData } from '../components/EventTable';
import { typesBundle, typesChain } from '@polkadot/apps-config';
import { Metadata } from '@polkadot/types';

export const createRpc = async (rpc: string): Promise<ApiPromise> => {
  console.log(`connecting to ${rpc}...`);

  const wsProvider = new WsProvider(rpc);
  let api;
  try {
    // api = await ApiPromise.create({
    //   provider: wsProvider,
    //   typesBundle,
    //   typesChain,
    // });

    api = await ApiPromise.create({
      provider: wsProvider,
    });
  } catch {
    throw new Error(`connection to ${rpc} failed!`);
  }

  console.log('connected!!');

  return api;
};

export const getQueryFn = (api: ApiPromise, prefix: string, name: string): any => api.query[prefix][name];

const sortByName = (a, b): number => a.name.localeCompare(b.name);
export const getModules = (api: ApiPromise): AnyJson => {
  const { modules } = api.runtimeMetadata.toJSON().metadata!.v13;   // TODO: v13?
  console.log(modules);

  const sortedModules = modules.map(m => {
    if (m.storage) {
      m.storage.items = m.storage.items.sort(sortByName);
    }

    return m;
  });

  return sortedModules.sort(sortByName);;
};  








export const getSignedBlock = async (api: ApiPromise, blockNumber: number): Promise<SignedBlock> => {
  const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  const signedBlock = await api.rpc.chain.getBlock(blockHash);

  return signedBlock;
};

export const getEventsForBlock = async (api: ApiPromise, blockNumber: number): Promise<TableData[]> => {
  const signedBlock = await getSignedBlock(api, blockNumber);
  const allRecords = await api.query.system.events.at(signedBlock.block.header.hash);

  const res: TableData[] = [];
  signedBlock.block.extrinsics.forEach(({ method: { method, section } }, index) => {
    const events = allRecords
      .filter(({ phase }) => (
        phase.isApplyExtrinsic
        && phase.asApplyExtrinsic.eq(index)))
      .map(({ event }) => `${event.section}.${event.method}`);

    res.push({
      block: blockNumber,
      section,
      method,
      events,
    });
  });

  return res;
};

export const getLastBlock = async (api: ApiPromise): Promise<number> => {
  const lastHeader = await api.rpc.chain.getHeader();

  return lastHeader.number.toNumber();
};
