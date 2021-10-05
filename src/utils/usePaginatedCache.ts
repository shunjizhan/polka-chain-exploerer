import { AnyJson } from '@polkadot/types/types';
import { useState } from 'react';

interface paginatedCache {
  getNextPage: () => AnyJson,
  getPrevPage: () => AnyJson,
  addPage: (nextPageData: AnyJson) => void,
  resetCache: () => void,
  curPage: number,
  hasNextPage: boolean,
  hasPrevPage: boolean,
}

const NO_CACHE = 'ERR_NO_CACHE';
const usePaginatedCache = (): paginatedCache => {
  const [data, setData] = useState<AnyJson[]>([]);
  const [curPage, setCurPage] = useState<number>(-1);

  const hasNextPage = curPage + 1 < data.length && curPage >= 0;
  const hasPrevPage = curPage - 1 >= 0;

  const getPrevPage = (): AnyJson => {
    if (!hasPrevPage) return NO_CACHE;

    const res = data[curPage - 1];
    setCurPage(curPage - 1);

    return res;
  };

  const getNextPage = (): AnyJson => {
    if (!hasNextPage) return NO_CACHE;

    const res = data[curPage + 1];
    setCurPage(curPage + 1);

    return res;
  };

  const addPage = (nextPageData: AnyJson) => {
    const newData: AnyJson[] = [...data, nextPageData];
    setData(newData);
    setCurPage(newData.length - 1);
  };

  const resetCache = (): void => {
    setData([]);
    setCurPage(-1);
  };

  return {
    getNextPage,
    getPrevPage,
    addPage,
    resetCache,
    curPage,
    hasNextPage,
    hasPrevPage,
  };
};

export default usePaginatedCache;
