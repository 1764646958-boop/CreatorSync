import fs from 'fs';
import path from 'path';
import { PlatformAdapterResult } from './adapters/types';

export type PublishHistoryStatus = 'rewritten' | 'ready' | 'needs_review' | 'unsupported' | 'failed';

export interface PublishHistoryRecord {
  id: string;
  platform: string;
  publishedAt: string;
  title: string;
  summary: string;
  status: PublishHistoryStatus;
}

interface PublishHistoryFile {
  version: 1;
  records: PublishHistoryRecord[];
}

const HISTORY_FILE_PATH = process.env.PUBLISH_HISTORY_FILE || path.resolve(process.cwd(), 'data', 'publish-history.json');
const MAX_RECORDS = 200;

const emptyHistory = (): PublishHistoryFile => ({
  version: 1,
  records: [],
});

const ensureHistoryDirectory = () => {
  fs.mkdirSync(path.dirname(HISTORY_FILE_PATH), { recursive: true });
};

const readHistoryFile = (): PublishHistoryFile => {
  ensureHistoryDirectory();

  if (!fs.existsSync(HISTORY_FILE_PATH)) {
    const initialHistory = emptyHistory();
    fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(initialHistory, null, 2));
    return initialHistory;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(HISTORY_FILE_PATH, 'utf8')) as Partial<PublishHistoryFile>;
    return {
      version: 1,
      records: Array.isArray(parsed.records) ? parsed.records.map(normalizeRecord).filter(Boolean) : [],
    } as PublishHistoryFile;
  } catch {
    return emptyHistory();
  }
};

const writeHistoryFile = (history: PublishHistoryFile) => {
  ensureHistoryDirectory();
  fs.writeFileSync(HISTORY_FILE_PATH, JSON.stringify(history, null, 2));
};

const normalizeRecord = (candidate: unknown): PublishHistoryRecord | null => {
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const record = candidate as Partial<PublishHistoryRecord>;
  if (typeof record.platform !== 'string' || typeof record.publishedAt !== 'string') {
    return null;
  }

  return {
    id: typeof record.id === 'string' ? record.id : createRecordId(record.platform, record.publishedAt),
    platform: record.platform,
    publishedAt: record.publishedAt,
    title: typeof record.title === 'string' ? record.title : '未命名内容',
    summary: typeof record.summary === 'string' ? record.summary : '',
    status: normalizeStatus(record.status),
  };
};

const normalizeStatus = (status: unknown): PublishHistoryStatus => {
  if (status === 'ready' || status === 'needs_review' || status === 'unsupported' || status === 'failed') {
    return status;
  }

  return 'rewritten';
};

const createRecordId = (platform: string, publishedAt: string) =>
  `${platform}-${publishedAt}`.replace(/[^a-z0-9-]+/gi, '-').toLowerCase();

export const listPublishHistory = (): PublishHistoryRecord[] =>
  readHistoryFile().records.sort(
    (left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
  );

export const saveAdapterResultToHistory = (result: PlatformAdapterResult): PublishHistoryRecord => {
  const publishedAt = result.metadata.generatedAt || new Date().toISOString();
  const record: PublishHistoryRecord = {
    id: createRecordId(String(result.platform), `${publishedAt}-${Date.now()}`),
    platform: String(result.platform),
    publishedAt,
    title: result.content.title?.trim() || '未命名内容',
    summary: result.content.summary?.trim() || result.content.body.slice(0, 120),
    status: result.status,
  };

  const history = readHistoryFile();
  writeHistoryFile({
    version: 1,
    records: [record, ...history.records].slice(0, MAX_RECORDS),
  });

  return record;
};

export const exportPublishHistoryAsJson = (): string =>
  JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      records: listPublishHistory(),
    },
    null,
    2,
  );

export const exportPublishHistoryAsMarkdown = (): string => {
  const records = listPublishHistory();
  const lines = [
    '# CreatorSync 发布历史',
    '',
    `导出时间：${new Date().toISOString()}`,
    '',
    '| 平台 | 发布时间 | 标题 | 摘要 | 状态 |',
    '| --- | --- | --- | --- | --- |',
  ];

  if (records.length === 0) {
    lines.push('| 暂无记录 | - | - | - | - |');
  } else {
    records.forEach((record) => {
      lines.push(
        `| ${escapeMarkdownTableCell(record.platform)} | ${escapeMarkdownTableCell(record.publishedAt)} | ${escapeMarkdownTableCell(record.title)} | ${escapeMarkdownTableCell(record.summary)} | ${escapeMarkdownTableCell(record.status)} |`,
      );
    });
  }

  return `${lines.join('\n')}\n`;
};

const escapeMarkdownTableCell = (value: string): string => value.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
