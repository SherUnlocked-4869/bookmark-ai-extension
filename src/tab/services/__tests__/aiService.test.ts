import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubGlobal('fetch', vi.fn());

import { aiService } from '@/tab/services/aiService';

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBookmarks = [
    { id: '1', title: 'React 文档', url: 'https://react.dev' },
    { id: '2', title: 'GitHub', url: 'https://github.com' },
  ];

  it('classifyFirst returns categories and assignments on success', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: '{"categories":["前端开发","代码托管"],"assignments":{"1":"前端开发","2":"代码托管"}}'
          }
        }]
      }),
    } as Response);

    const result = await aiService.classifyFirst(mockBookmarks, 'sk-test', 'deepseek-v4-flash', 'https://api.deepseek.com');
    expect(result.categories).toEqual(['前端开发', '代码托管']);
    expect(result.assignments).toEqual({ '1': '前端开发', '2': '代码托管' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('classifyFirst throws on 401', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(
      aiService.classifyFirst(mockBookmarks, 'bad-key', 'deepseek-v4-flash', 'https://api.deepseek.com')
    ).rejects.toThrow('API Key 无效');
  });

  it('classifyFirst throws on 429', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429 } as Response);

    await expect(
      aiService.classifyFirst(mockBookmarks, 'sk-test', 'deepseek-v4-flash', 'https://api.deepseek.com')
    ).rejects.toThrow('API 额度不足');
  });

  it('extracts JSON from markdown-wrapped response', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: '```json\n{"categories":["工具"],"assignments":{"1":"工具","2":"工具"}}\n```'
          }
        }]
      }),
    } as Response);

    const result = await aiService.classifyFirst(mockBookmarks, 'sk-test', 'deepseek-v4-flash', 'https://api.deepseek.com');
    expect(result.categories).toEqual(['工具']);
    expect(result.assignments).toEqual({ '1': '工具', '2': '工具' });
  });
});
