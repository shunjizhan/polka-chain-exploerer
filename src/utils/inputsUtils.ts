export const getQueryDetails = (item: any): string => {
  let suffix;
  let params;
  const { type, name } = item;
  const { map, doubleMap, plain } = type;
  if (map) {
    suffix = `${map.value}`
    params = map.key;
  } if (doubleMap) {
    suffix = `${doubleMap.value}`
    params = `${doubleMap.key1}, ${doubleMap.key2}`;
  } else if (plain) {
    suffix = `${plain}`
  }

  return params
    ? `${name}(${params}): ${suffix}`
    : `${name}(): ${suffix}`;
};

export const getArgsLength = (item: any): number => {
  const { type: { map, doubleMap } } = item;
  if (doubleMap) {
    return 2;
  } else if (map) {
    return 1
  } else {
    return 0;
  }
};

export const getArgNames = (item: any): string => {
  const { type: { map, doubleMap } } = item;
  if (doubleMap) {
    const { key1, key2 } = doubleMap;
    return `${key1},${key2}`;
  } else if (map) {
    return map.key;
  } else {
    return '';
  }
};