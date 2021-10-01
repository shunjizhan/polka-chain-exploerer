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
import { AnyFunction, AnyJson, Codec } from '@polkadot/types/types';
import DataViewer from './DataViewer';

interface ApiRef {
  api: ApiPromise | null,
  rpc: string,
}

export type FetchData = (query: string, arg1: string | null, arg2: string | null, argsLength: number) => void;

const Scanner: FC = () => {
  /* ---------- data ---------- */
  const [data, setData] = useState<Record<string, unknown> | null>(null);
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

      const _res = await api.query.identity.identityOf.entriesPaged({
        args: [],
        pageSize: 10,
      });
      const res = _res.map(([key, val]) => [key.toString(), val.toHuman()]);
      console.log(res);
      setData(res);
    })();
  }, []);

  const updateApi = async (rpc: string) => {
    if (rpc === curApi.current.rpc) return;
    console.log('switch:', curApi.current.rpc, '=>', rpc);

    setIsSwitchingRpc(true);
    try {
      const api = await createRpc(rpc);
      curApi.current = { api, rpc };
      setRpcErr(null);
    } catch (e) {
      console.log('!!!!!!!!!!!!', e);
      setRpcErr(`failed to connect to new RPC: ${rpc}`);
    } finally {
      setIsSwitchingRpc(false);
    }
  };

  const fetchData: FetchData = async (query, arg1, arg2, argsLength) => {
    setIsLoading(true);
    setFetchErr(null);

    const queryFn: AnyFunction = getQueryFn(curApi.current.api as ApiPromise, query);

    try {
      if (!queryFn) {
        console.warn(`query method ${query} is not found...`); return;
      }

      console.log(query, arg1, arg2);
      let args: any[] = [];
      if (argsLength === 1) args = [arg1];
      if (argsLength === 2) args = [arg2];

      const res: Codec = await queryFn.apply(null, args);    /* ts-disable-line */
      console.log(res.toHuman());
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

          {
            data && (
              <DataViewer
                src={ data }
              />
            )
          }
        </>
      )}
    </div>
  );
};

export default Scanner;
