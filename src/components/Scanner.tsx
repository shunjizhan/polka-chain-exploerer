import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FC,
  SetStateAction,
  Dispatch,
} from 'react';
import { ApiPromise } from '@polkadot/api';

import EventTable, { TableData } from './EventTable';
import Progress from './Progress';
import Inputs from './Inputs';
import Loading from './Loading';

import {
  createRpc,
  getEventsForBlock,
} from '../utils/chainUtils';

import '../styles.scss';
import 'antd/dist/antd.css';

interface ApiRef {
  api: ApiPromise | null,
  rpc: string,
}

export interface Err {
  rpc: string | null,
  start: string | null,
  end: string | null,
}

export type eventHandler = (e: ChangeEvent<HTMLInputElement>) => void;

const DEFAULT_RPC = 'wss://rpc.polkadot.io';
export const NO_ERR = { rpc: null, start: null, end: null };

const Scanner: FC = () => {
  /* ---------- input values ---------- */
  const [startBlock, setStartBlock] = useState<number>(6763000);
  const [endBlock, setEndBlock] = useState<number>(6763100);
  const [rpc, setRpc] = useState<string>(DEFAULT_RPC);

  /* ---------- data ---------- */
  const [events, setEvents] = useState<TableData[]>([]);
  const [count, setCount] = useState<number>(-1);
  const [err, setErr] = useState<Err>(NO_ERR);
  const curApi = useRef<ApiRef>({ api: null, rpc: DEFAULT_RPC });

  /* ---------- flags ---------- */
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSwitchingRpc, setIsSwitchingRpc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const totalBlocks = endBlock - startBlock + 1;

  useEffect(() => {
    (async () => {
      const api = await createRpc(rpc);
      curApi.current = { api, rpc };
      setIsInitializing(false);
    })();
  }, []);

  const getInputHandler = (fn: Dispatch<SetStateAction<number>> | Dispatch<SetStateAction<string>>): eventHandler => e => {
    fn(e.target.value as (SetStateAction<number> & SetStateAction<string>));
    setCount(-1);
  };
  const handleStartBlockChange = getInputHandler(setStartBlock);
  const handleEndBlockChange = getInputHandler(setEndBlock);
  const handleRpcChange = getInputHandler(setRpc);

  const updateApi = async () => {
    if (rpc === curApi.current.rpc) return;

    setIsSwitchingRpc(true);
    try {
      const api = await createRpc(rpc);
      curApi.current = { api, rpc };
      setErr({
        ...err,
        rpc: null,
      });
    } catch (e) {
      setErr({
        ...err,
        rpc: `failed to connect to new RPC... used previous RPC [${curApi.current.rpc}]`,
      });
    } finally {
      setIsSwitchingRpc(false);
    }
  };

  const BATCH_SIZE = 10;
  let dataBuffer: TableData[][] = [];
  const flushData = () => {
    setEvents(e => e.concat(...dataBuffer));
    setCount(c => c + dataBuffer.length);
    dataBuffer = [];
  };

  const resetStatus = () => {
    setErr(NO_ERR);
    setEvents([]);
    setCount(0);
    setIsLoading(true);
  };

  const fetchData = async () => {
    resetStatus();
    await updateApi();

    const _fetch = async (block: number) => {
      const data = await getEventsForBlock(curApi.current.api as ApiPromise, block);
      dataBuffer.push(data);

      if (dataBuffer.length === BATCH_SIZE) {
        flushData();
      }

      if (block === endBlock) {
        flushData();
        setIsLoading(false);
      }
    };

    for (let block = startBlock; block <= endBlock; block++) {
      _fetch(block);
    }
  };

  return (
    <div id='Scanner'>
      { isInitializing && <Loading rpc={ rpc } /> }

      { !isInitializing && (
        <>
          <Inputs
            rpc={ rpc }
            startBlock={ startBlock }
            endBlock={ endBlock }
            err={ err }
            setErr={ setErr }
            api={ curApi.current.api as ApiPromise }
            isSwitchingRpc={ isSwitchingRpc }
            isLoading={ isLoading }
            fetchData={ fetchData }
            handleRpcChange={ handleRpcChange }
            handleStartBlockChange={ handleStartBlockChange }
            handleEndBlockChange={ handleEndBlockChange }
          />

          <div id='toolBox'>
            <Progress
              cur={ count }
              all={ totalBlocks }
            />
          </div>

          { !!events.length && (
            <div id='table-container'>
              <EventTable dataSource={ events } />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Scanner;
