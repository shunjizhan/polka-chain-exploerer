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
  getModules,
  getQueryFn,
} from '../utils/chainUtils';

import '../styles.scss';
import 'antd/dist/antd.css';

interface ApiRef {
  api: ApiPromise | null,
  rpc: string,
}

export type FetchData = (query: string, arg1: string | null, arg2: string | null, argsLength: number) => void;

const Scanner: FC = () => {
  const [rpcErr, setRpcErr] = useState<string | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);
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
    // console.log('!!!!', rpc, curApi.current.rpc)

    setIsSwitchingRpc(true);
    try {
      const api = await createRpc(rpc);
      curApi.current = { api, rpc };
      setRpcErr(null);
    } catch (e) {
      console.log('!!!!!!!!!!!!')
      setRpcErr(`failed to connect to new RPC: rpc`);
    } finally {
      setIsSwitchingRpc(false);
    }
  };

  const fetchData: FetchData = async (query, arg1, arg2, argsLength) => {
    setIsLoading(true);
    setFetchErr(null);

    const queryFn: any = getQueryFn(curApi.current.api as ApiPromise, query);
    
    console.log(query, arg1, arg2);
    let args: any[] = [];
    if (argsLength === 1) args = [arg1];
    if (argsLength === 2) args = [arg2];

    let res;
    try {
      res = await queryFn.apply(null, args);    /* ts-disable-line */
      console.log(res);
    } catch (e) {
      setFetchErr((e as ChangeEvent<any>).toString());
    } finally {
      setIsLoading(false);
    }
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
            modules={ getModules(curApi.current.api!) }
            fetchData={ fetchData }
            fetchErr={ fetchErr }
            rpcErr={ rpcErr }
          />

          {/* <div id='toolBox'>
            <Progress
              cur={ 100 }
              all={ 100 }
            />
          </div> */}
        </>
      )}
    </div>
  );
};

export default Scanner;
