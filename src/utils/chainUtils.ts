import { ApiPromise, WsProvider } from '@polkadot/api';
import { SignedBlock } from '@polkadot/types/interfaces';
import { TableData } from '../components/EventTable';

export const createRpc = async (rpc: string): Promise<ApiPromise> => {
  console.log(`connecting to ${rpc}...`);

  const wsProvider = new WsProvider(rpc);
  let api;
  try {
    api = await ApiPromise.create({ provider: wsProvider });
  } catch {
    throw new Error(`connection to ${rpc} failed!`);
  }

  console.log('connected!!');

  return api;
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
