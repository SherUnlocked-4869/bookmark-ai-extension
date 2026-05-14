import type { Bookmark, ClassificationResult } from '@/tab/types';

const SYSTEM_PROMPT_FIRST =
  '你是浏览器书签分类助手。根据书签标题和URL，创建 5-15 个中文类别，将每个书签分配到其中一个类别。类别应精准、互不重叠、中文命名。类别名称应通用稳定，避免包含版本号、年份、具体产品名。例如用「前端框架」而非「React 18」。';

const SYSTEM_PROMPT_SUBSEQUENT =
  '你是浏览器书签分类助手。根据已有类别，将新书签分配到合适的类别中。';

function buildFirstPrompt(bookmarks: Bookmark[]): string {
  const items = bookmarks.map((b) => ({ id: b.id, title: b.title, url: b.url }));
  return [
    `书签列表：${JSON.stringify(items)}`,
    '返回纯 JSON（不要 markdown 代码块）：',
    '{"categories": ["类别1", "类别2", ...], "assignments": {"书签id": "类别名", ...}}',
  ].join('\n');
}

function buildSubsequentPrompt(bookmarks: Bookmark[], categories: string[]): string {
  const items = bookmarks.map((b) => ({ id: b.id, title: b.title, url: b.url }));
  return [
    `已有类别：${JSON.stringify(categories)}`,
    `新书签：${JSON.stringify(items)}`,
    '将每个新书签分配到已有类别，无法归类的标记为"其他"。',
    '返回纯 JSON（不要 markdown 代码块）：',
    '{"assignments": {"书签id": "类别名", ...}}',
  ].join('\n');
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
}

export const aiService = {
  async classifyFirst(
    bookmarks: Bookmark[],
    apiKey: string,
    model: string,
    baseUrl: string
  ): Promise<ClassificationResult> {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_FIRST },
          { role: 'user', content: buildFirstPrompt(bookmarks) },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('API Key 无效');
      if (response.status === 429) throw new Error('API 额度不足');
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const json = extractJSON(content);
    return JSON.parse(json) as ClassificationResult;
  },

  async classifySubsequent(
    bookmarks: Bookmark[],
    categories: string[],
    apiKey: string,
    model: string,
    baseUrl: string
  ): Promise<{ assignments: Record<string, string> }> {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT_SUBSEQUENT },
          { role: 'user', content: buildSubsequentPrompt(bookmarks, categories) },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error('API Key 无效');
      if (response.status === 429) throw new Error('API 额度不足');
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const json = extractJSON(content);
    return JSON.parse(json);
  },

  async classifyBatch(
    bookmarks: Bookmark[],
    categories: string[],
    apiKey: string,
    model: string,
    baseUrl: string,
    batchSize: number = 500
  ): Promise<Record<string, string>> {
    const isFirst = categories.length === 0;
    const allAssignments: Record<string, string> = {};

    for (let i = 0; i < bookmarks.length; i += batchSize) {
      const batch = bookmarks.slice(i, i + batchSize);
      if (isFirst) {
        const result = await this.classifyFirst(batch, apiKey, model, baseUrl);
        Object.assign(allAssignments, result.assignments);
        if (result.categories.length > 0) {
          categories = result.categories;
        }
      } else {
        const result = await this.classifySubsequent(batch, categories, apiKey, model, baseUrl);
        Object.assign(allAssignments, result.assignments);
      }
    }

    return allAssignments;
  },
};
