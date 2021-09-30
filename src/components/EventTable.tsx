import React, { ReactElement, FC } from 'react';
import { Table, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

import {
  SECTIONS_FILTERS,
  METHOD_FILTERS,
  EVENTS_FILTER,
  getTagColor,
} from '../utils/tableUtils';

const renderEvents = (events: Array<string>): ReactElement  => (
  <>
    {
      events.map((e, i) => (
        // eslint-disable-next-line
        <Tag color={ getTagColor(e) } key={ i }>
          {e}
        </Tag>
      ))
    }
  </>
);

const renderBlock = (block: number): ReactElement => (
  <a href={ `https://polkadot.subscan.io/block/${block}` }>{ block }</a>
);

export interface TableData {
  [key: string]: number | string | string[],
  block: number,
  method: string,
  section: string,
  events: string[],
}
interface EventTableProps {
  dataSource: TableData[],
}

const getStringSorter = (key: string) =>
  (a: TableData, b: TableData) => (a[key] as string).localeCompare(b[key] as string);

const getStringFilter = (key: string) =>
  (value: string | number | boolean, record: TableData) => record[key] === value;

const EventTable: FC<EventTableProps> = ({ dataSource }) => {
  const columns: ColumnsType<any> = [
    {
      title: 'Block',
      dataIndex: 'block',
      key: 'block',
      render: renderBlock,
      sorter: (a: number, b: number): number => (a - b > 0 ? 1 : -1),
    },
    {
      title: 'Section',
      dataIndex: 'section',
      key: 'section',
      sorter: getStringSorter('section'),
      filters: SECTIONS_FILTERS,
      onFilter: getStringFilter('section'),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      sorter: getStringSorter('method'),
      filters: METHOD_FILTERS,
      onFilter: getStringFilter('method'),
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      render: renderEvents,
      filters: EVENTS_FILTER,
      onFilter: (value: string | number | boolean, record: TableData) => record.events.some(e => e.split('.')[0] === value),
    },
  ];

  return (
    <Table
      id='data-table'
      dataSource={ dataSource }
      columns={ columns }
    />
  );
};

export default EventTable;
