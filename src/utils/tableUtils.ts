export const SECTIONS_FILTERS = [
  {
    text: 'timestamp',
    value: 'timestamp',
  },
  {
    text: 'balances',
    value: 'balances',
  },
  {
    text: 'staking',
    value: 'staking',
  },
  {
    text: 'utility',
    value: 'utility',
  },
  {
    text: 'proxy',
    value: 'proxy',
  },
  {
    text: 'identity',
    value: 'identity',
  },
  {
    text: 'democracy',
    value: 'democracy',
  },
  {
    text: 'imOnline',
    value: 'imOnline',
  },
  {
    text: 'multisig',
    value: 'multisig',
  },
];

export const METHOD_FILTERS = [
  {
    text: 'set',
    value: 'set',
  },
  {
    text: 'transfer',
    value: 'transfer',
  },
  {
    text: 'transferKeepAlive',
    value: 'transferKeepAlive',
  },
  {
    text: 'unbond',
    value: 'unbond',
  },
  {
    text: 'batch',
    value: 'batch',
  },
  {
    text: 'nominate',
    value: 'nominate',
  },
  {
    text: 'withdrawUnbonded',
    value: 'withdrawUnbonded',
  },
  {
    text: 'bondExtra',
    value: 'bondExtra',
  },
  {
    text: 'setPayee',
    value: 'setPayee',
  },
  {
    text: 'chill',
    value: 'chill',
  },
  {
    text: 'bond',
    value: 'bond',
  },
  {
    text: 'removeAnnouncement',
    value: 'removeAnnouncement',
  },
  {
    text: 'batchAll',
    value: 'batchAll',
  },
  {
    text: 'payoutStakers',
    value: 'payoutStakers',
  },
  {
    text: 'rebond',
    value: 'rebond',
  },
  {
    text: 'setIdentity',
    value: 'setIdentity',
  },
  {
    text: 'setController',
    value: 'setController',
  },
  {
    text: 'vote',
    value: 'vote',
  },
  {
    text: 'heartbeat',
    value: 'heartbeat',
  },
  {
    text: 'approveAsMulti',
    value: 'approveAsMulti',
  },
  {
    text: 'asMulti',
    value: 'asMulti',
  },
];

export const EVENTS_FILTER = [
  {
    text: 'system',
    value: 'system',
  },
  {
    text: 'balances',
    value: 'balances',
  },
  {
    text: 'treasury',
    value: 'treasury',
  },
  {
    text: 'utility',
    value: 'utility',
  },
  {
    text: 'staking',
    value: 'staking',
  },
  {
    text: 'identity',
    value: 'identity',
  },
  {
    text: 'imOnline',
    value: 'imOnline',
  },
  {
    text: 'multisig',
    value: 'multisig',
  },
  {
    text: 'electionProviderMultiPhase',
    value: 'electionProviderMultiPhase',
  },
  {
    text: 'democracy',
    value: 'democracy',
  },
  {
    text: 'council',
    value: 'council',
  },
  {
    text: 'proxy',
    value: 'proxy',
  },
];

interface Map {
  [key: string]: string,
}

export const TAG_COLORS: Map = {
  system: 'cyan',
  balances: 'green',
  treasury: 'orange',
  utility: 'purple',
  staking: 'gold',
  identity: 'lime',
  imOnline: 'gray',
  multisig: 'magenta',
  electionProviderMultiPhase: 'red',
  democracy: 'volcano',
  council: 'geekblue',
  proxy: 'blue',
};

export const getTagColor = (event: string): string => {
  const prefix = event.split('.')[0];
  return TAG_COLORS[prefix];
};
