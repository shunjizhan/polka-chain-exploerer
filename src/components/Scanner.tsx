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

import { StorageKey } from '@polkadot/types';
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
import { PaginationOptions } from '@polkadot/api/types';

interface ApiRef {
  api: ApiPromise | null,
  rpc: string,
}

export type FetchData = (query: string, arg1: string | null, arg2: string | null, argsLength: number) => void;

const Scanner: FC = () => {
  /* ---------- data ---------- */
  const [data, setData] = useState<AnyJson | null>(null);
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
    setData(null);

    const queryFn: any = getQueryFn(curApi.current.api as ApiPromise, query);

    try {
      if (!queryFn) {
        console.warn(`query method ${query} is not found...`); return;
      }

      const hasArg = arg1 || arg2;

      console.log(query, arg1, arg2);
      let args: any[] | string = [];
      if (argsLength === 1 && arg1) {
        args = [arg1];
      }
      if (argsLength === 2 && hasArg) {
        args = [arg1, arg2];
      }

      let res: AnyJson;
      if (queryFn.entriesPaged && !hasArg) {
        console.log('entriesPaged args ', args);

        const PAGE_SIZE = 10;
        const allEntries: [StorageKey, Codec][] = [];
        let curIndex = -1;
        const _fetch = async (opt: PaginationOptions): [StorageKey, Codec][] => {
          const entries: [StorageKey, Codec][] = await queryFn.entriesPaged(opt);
          allEntries.push(...entries);

          if (entries.length === PAGE_SIZE) {
            // curIndex += PAGE_SIZE;
            // const lastKey = entries[0][0][curIndex];
            // console.log(curIndex, lastKey, entries.length);
            // await _fetch({ ...opt, startKey: lastKey.toString() });
          }

          return allEntries;
        };

        await _fetch({ args, pageSize: PAGE_SIZE })

        res = allEntries.map(([key, val]) => [key.toString(), val.toHuman()]);
      } else {
        console.log('query args ', args);
        res = (await queryFn(...args)).toHuman();
      }

      console.log({ res });
      res = res !== null
        ? res instanceof Object ? res : [res]
        : ['NO DATA'];

      setData(res);
    } catch (e) {
      setFetchErr((e as ChangeEvent<any>).toString());
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = (): void => {
    alert('this feature is WIP... please come back soon');
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
                src={ data as Record<string, unknown> }
                fetchNextPage={ fetchNextPage }
              />
            )
          }
        </>
      )}
    </div>
  );
};

export default Scanner;
