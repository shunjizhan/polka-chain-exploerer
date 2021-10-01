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
import { PaginationOptions } from '@polkadot/api/types';
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
  const [data, setData] = useState<AnyJson | null>(null);
  const [nextPageArgs, setNextPageArgs] = useState<any[] | null>(null);
  const curApi = useRef<ApiRef>({ api: null, rpc: DEFAULT_RPC });

  /* ---------- error ---------- */
  const [rpcErr, setRpcErr] = useState<string | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  /* ---------- flags ---------- */
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSwitchingRpc, setIsSwitchingRpc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState<boolean>(false);

  /* ----- initialization ----- */
  useEffect(() => {
    (async () => {
      const api = await createRpc(DEFAULT_RPC);
      curApi.current = { api, rpc: DEFAULT_RPC };
      setIsInitializing(false);
    })();
  }, []);
  /* --------------------------- */

  const resetData = () => {
    setData(null);
    setNextPageArgs(null);
    setRpcErr(null);
    setFetchErr(null);
  };

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

  const PAGE_SIZE = 10;
  const fetchData: FetchData = async (query, arg1, arg2, argsLength, lastKey = null) => {
    if (lastKey) {
      setIsLoadingNextPage(true);
    } else {
      setData(null);
    }
    setIsLoading(true);
    setFetchErr(null);
    setNextPageArgs(null);

    const queryFn: any = getQueryFn(curApi.current.api as ApiPromise, query);
    if (!queryFn) {
      setFetchErr(`query method ${query} is not supported yet...`);
      setIsLoading(false);
      return;
    }

    try {
      console.log('fetch data: ', { query, arg1, arg2 });
      const hasArg = arg1 || arg2;

      let args: any[] | string = [];
      if (argsLength === 1 && arg1) {
        args = [arg1];
      }
      if (argsLength === 2 && hasArg) {
        args = [arg1, arg2];
      }

      let res: AnyJson;
      if (queryFn.entriesPaged && !hasArg) {
        const opt: PaginationOptions = {
          pageSize: PAGE_SIZE,
          args: [],
        };
        if (lastKey)  { opt.startKey = lastKey; }

        const entries: [StorageKey, Codec][] = await queryFn.entriesPaged(opt);
        const keys: StorageKey[] = await queryFn.keysPaged(opt);

        console.log('paginated entries: ', entries, keys);

        const hasNextPage = (entries.length === PAGE_SIZE);
        if (hasNextPage) {
          const lastKey: StorageKey = keys.at(-1)!;
          console.log(lastKey.toString(), entries.length);
          setNextPageArgs([query, arg1, arg2, argsLength, lastKey]);
        }

        res = entries.map(([key, val]) => [key.toString(), val.toHuman()]);
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
      setIsLoadingNextPage(false);
    }
  };

  const fetchNextPage = async (): Promise<void> => {
    if (!nextPageArgs) return;

    // @ts-ignore
    await fetchData(...nextPageArgs);
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
            resetData={ resetData }
          />

          {
            data && (
              <DataViewer
                src={ data as Record<string, unknown> }
                fetchNextPage={ fetchNextPage }
                isLoadingNextPage={ isLoadingNextPage }
                hasNextPage={ !!nextPageArgs }
              />
            )
          }
        </>
      )}
    </div>
  );
};

export default Scanner;
