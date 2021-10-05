import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FC,
} from 'react';
import { ApiPromise } from '@polkadot/api';
import { AnyJson, Codec } from '@polkadot/types/types';
import { StorageKey } from '@polkadot/types';
import { PaginationOptions } from '@polkadot/api/types';

import Inputs, { DEFAULT_RPC } from './Inputs';
import Loading from './Loading';
import DataViewer from './DataViewer';
import {
  createRpc,
  getModules,
  getQueryFn,
} from '../utils/chainUtils';
import usePaginatedCache from '../utils/usePaginatedCache';

import '../styles.scss';
import 'antd/dist/antd.css';

interface ApiRef {
  api: ApiPromise | null,
  rpc: string,
  modules: any[],
}

export type FetchData = (query: string, arg1: string | null, arg2: string | null, argsLength: number) => void;

const Scanner: FC = () => {
  /* ---------- data ---------- */
  const [data, setData] = useState<AnyJson | null>(null);
  const [nextPageArgs, setNextPageArgs] = useState<any[] | null>(null);
  const curApi = useRef<ApiRef>({ api: null, rpc: DEFAULT_RPC, modules: [] });

  /* ---------- error ---------- */
  const [rpcErr, setRpcErr] = useState<string | null>(null);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  /* ---------- flags ---------- */
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isSwitchingRpc, setIsSwitchingRpc] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(false);

  const {
    getNextPage,
    getPrevPage,
    addPage,
    resetCache,
    curPage,
    hasNextPage,
    hasPrevPage,
  } = usePaginatedCache();

  /* ----- initialization ----- */
  useEffect(() => {
    (async () => {
      const api = await createRpc(DEFAULT_RPC);
      const modules = getModules(api);
      curApi.current = { api, modules, rpc: DEFAULT_RPC };
      setIsInitializing(false);
    })();
  }, []);
  /* --------------------------- */

  const resetData = () => {
    setData(null);
    setNextPageArgs(null);
    resetCache();
    setRpcErr(null);
    setFetchErr(null);
  };

  const updateApi = async (rpc: string) => {
    if (rpc === curApi.current.rpc) return;
    console.log('switch:', curApi.current.rpc, '=>', rpc);

    setIsSwitchingRpc(true);
    try {
      const api = await createRpc(rpc);
      const modules = getModules(api);
      curApi.current = { api, rpc, modules };
      resetData();
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
      setIsLoadingPage(true);
    } else {
      setData(null);
      resetCache();
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
        // prepare options and fetch data
        const opt: PaginationOptions = {
          pageSize: PAGE_SIZE,
          args: [],
        };
        if (lastKey)  { opt.startKey = lastKey; }

        const entries: [StorageKey, Codec][] = await queryFn.entriesPaged(opt);
        res = entries.map(([key, val]) => [key.toHuman(), val.toHuman()]);

        // save arguments for next page
        const hasNextPageArgs = (entries.length === PAGE_SIZE);
        if (hasNextPageArgs) {
          const keys: StorageKey[] = await queryFn.keysPaged(opt);
          const nextKey: StorageKey = keys[keys.length - 1]!;
          setNextPageArgs([query, arg1, arg2, argsLength, nextKey]);
        }
      } else {
        res = (await queryFn(...args)).toHuman();
      }

      console.log({ res });
      res = res !== null
        ? res instanceof Object ? res : [res]
        : ['NO DATA'];

      setData(res);
      addPage(res);
    } catch (e) {
      setFetchErr((e as ChangeEvent<any>).toString());
    } finally {
      setIsLoading(false);
      setIsLoadingPage(false);
    }
  };

  const fetchNextPage = (): void => {
    if (hasNextPage) {
      const cachedPage: AnyJson = getNextPage();
      setData(cachedPage);
      return;
    }

    // @ts-ignore
    nextPageArgs && fetchData(...nextPageArgs);
  };

  const fetchPrevPage = (): void => {
    if (hasPrevPage) {
      const cachedPage: AnyJson = getPrevPage();
      setData(cachedPage);
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
            modules={ curApi.current.modules }
            fetchData={ fetchData }
            fetchErr={ fetchErr }
            rpcErr={ rpcErr }
            resetData={ resetData }
          />

          {
            data && (
              <DataViewer
                src={ data as Record<string, unknown> }
                isLoadingPage={ isLoadingPage }
                fetchNextPage={ fetchNextPage }
                fetchPrevPage={ fetchPrevPage }
                hasNextPage={ hasNextPage || !!nextPageArgs }
                hasPrevPage={ hasPrevPage }
                curPage={ curPage }
              />
            )
          }
        </>
      )}
    </div>
  );
};

export default Scanner;
