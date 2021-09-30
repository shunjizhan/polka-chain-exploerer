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
import Inputs, { DEFAULT_RPC } from './Inputs';
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

const Scanner: FC = () => {
  const [events, setEvents] = useState<TableData[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const curApi = useRef<ApiRef>({ api: null, rpc: DEFAULT_RPC });

  /* ---------- flags ---------- */
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSwitchingRpc, setIsSwitchingRpc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /* ----- initialization ----- */
  useEffect(() => {
    (async () => {
      const api = await createRpc(DEFAULT_RPC);
      curApi.current = { api, rpc: DEFAULT_RPC };
      setIsInitializing(false);
    })();
  }, []);

  const updateApi = async (rpc: string) => {
    if (rpc === curApi.current.rpc) return;
    console.log('!!!!', rpc, curApi.current.rpc)

    setIsSwitchingRpc(true);
    try {
      const api = await createRpc(rpc);
      curApi.current = { api, rpc };
      setErr(null);
    } catch (e) {
      setErr(`failed to connect to new RPC: rpc`);
    } finally {
      setIsSwitchingRpc(false);
    }
  };

  const resetStatus = () => {
    setEvents([]);
    setIsLoading(true);
  };

  const fetchData = async () => {
    resetStatus();
    await updateApi('xxx');

    const _fetch = async (block: number) => {}
  };

  return (
    <div id='Scanner'>
      { isInitializing && <Loading rpc={ DEFAULT_RPC } /> }

      { !isInitializing && (
        <>
          <Inputs
            updateApi={ updateApi }
            isSwitchingRpc={ isSwitchingRpc }
            isLoading={ isLoading }
          />

          <div id='toolBox'>
            <Progress
              cur={ 100 }
              all={ 100 }
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
