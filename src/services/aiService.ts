import { HistoryItem, StoryChoice } from '../types';

// Model configurations
interface ModelConfig {
  name: string;
  endpoint: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  thinking?: {
    enabled: boolean;
    steps: number;
    depth: number;
  };
}

const models: Record<string, ModelConfig> = {
  creative: {
    name: import.meta.env.VITE_AI_CREATIVE_MODEL_NAME || 'gemini-2.5-flash-preview-04-17',
    endpoint: import.meta.env.VITE_AI_CREATIVE_MODEL_ENDPOINT || 'https://api.tqmylove.space/v1/chat/completions',
    temperature: 0.8,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    thinking: {
      enabled: false,
      steps: 3,
      depth: 2
    }
  },
  precise: {
    name: import.meta.env.VITE_AI_PRECISE_MODEL_NAME || 'gemini-2.5-flash-preview-04-17',
    endpoint: import.meta.env.VITE_AI_PRECISE_MODEL_ENDPOINT || 'https://api.tqmylove.space/v1/chat/completions',
    temperature: 0.3,
    maxTokens: 2000,
    topP: 0.8,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
    thinking: {
      enabled: false,
      steps: 4,
      depth: 3
    }
  },
  balanced: {
    name: import.meta.env.VITE_AI_BALANCED_MODEL_NAME || 'gemini-2.5-flash-preview-04-17',
    endpoint: import.meta.env.VITE_AI_BALANCED_MODEL_ENDPOINT || 'https://api.tqmylove.space/v1/chat/completions',
    temperature: 0.5,
    maxTokens: 2000,
    topP: 0.85,
    frequencyPenalty: 0.2,
    presencePenalty: 0.2,
    thinking: {
      enabled: false,
      steps: 3,
      depth: 2
    }
  }
};

const defaultModel: ModelConfig = models.creative;
const API_KEY = import.meta.env.VITE_AI_API_KEY;

if (!API_KEY) {
  throw new Error('AI API key not found in environment variables');
}

const generateThinkingSteps = (prompt: string, config: ModelConfig['thinking']) => {
  if (!config?.enabled) return prompt;

  const steps = Array(config.steps).fill(0).map((_, i) => {
    const depth = Array(config.depth).fill(0).map((_, j) => {
      return `思考层级 ${j + 1}: 分析当前情节发展的可能性和影响`;
    }).join('\n');
    return `步骤 ${i + 1}:\n${depth}`;
  }).join('\n\n');

  return `${steps}\n\n${prompt}`;
};

interface StoryResponse {
  story: string;
  choices: StoryChoice[];
}

interface ContinuationResponse {
  storyContinuation: string;
  choices: StoryChoice[];
}

const safeJsonParse = (text: string) => {
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw Response:', text);
    throw new Error(`Invalid JSON response from AI service: ${(error as Error).message}`);
  }
};

// 导出一个名为 generateInitialStoryAndChoices 的常量，该常量是一个异步箭头函数
export const generateInitialStoryAndChoices = async (
  stylePrompt: string,
  modelType: keyof typeof models = 'creative'
): Promise<StoryResponse> => {
  try {
    const modelConfig = models[modelType] || defaultModel;
    const basePrompt = `
    你是专业的 AI 小说创作者。你的任务是根据用户提供的「风格提示」创作一个引人入胜的故事开篇（约400-500字），并提出三个引导故事走向的后续选项。请严格遵循以下说明：

**核心任务**：根据提供的「风格提示」，创作一个约 400-500 字的故事开篇，并提供三个后续剧情选项。
风格提示：${stylePrompt}
    === 内容与风格要求 ===
    1.  **引人入胜的开篇**：
        * **制造悬念与冲突**：开篇需迅速建立悬念、引入核心冲突或提出一个引人好奇的问题，抓住读者注意力。
        * **鲜活的感官描写**：运用具体的视觉、听觉、嗅觉、触觉等细节，营造氛围，让读者身临其境（“展示，而非告知”）。
        * **确立基调**：故事开篇的语言风格、节奏和情感色彩必须与「风格提示」(${stylePrompt}) 高度一致。
        * **避免陈词滥调**：在情节构思、人物设定和语言表达上力求新颖，避开常见的套路和俗语。
    2.  **故事长度**：开篇故事长度控制在 400 至 500 字之间。
    3.  **后续选项**：
        * 提供**三个**清晰、具体且有区分度的后续发展选项。
        * 每个选项应能将故事引向不同的方向，激发读者的选择欲。
        * 选项文本应简洁明了，准确描述选择后的可能发展。

**！！！绝对强制输出格式！！！**
你的唯一输出**必须**是单个、完整且语法绝对正确的 JSON 对象。**禁止**在 JSON 对象之外添加任何字符、解释、注释、代码标记（如 \`\`\`json）或任何形式的元评论。

JSON 结构如下：
{
  "story": "在此填写故事开篇。段落之间必须使用且仅使用 \\\\n\\\\n 分隔。",
  "choices": [
    { "id": "choice1", "text": "第一个选项描述" },
    { "id": "choice2", "text": "第二个选项描述" },
    { "id": "choice3", "text": "第三个选项描述" }
  ]
}

**格式细节要求（强制）**：
1.  **JSON 纯粹性**：绝不允许在 JSON 之外有任何其他文本。
2.  **引号**：所有 JSON 键和字符串值**必须**使用双引号 (")。
3.  **段落分隔符**：story字符串内的段落换行**必须**使用 \\\\n\\\\n。
4.  **特殊字符转义**：字符串值内部的所有特殊字符（如 "、换行符等）**必须**正确转义（例如：\\\\", \\\\n）。
5.  **完整性**：确保 JSON 对象完整，无截断、无语法错误（如多余逗号）。
`;
    
    const prompt = generateThinkingSteps(basePrompt, modelConfig.thinking);

    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelConfig.name,
        messages: [
          { 
            role: 'system', 
            content: '重要：你是一个顶尖的小说创作与叙事工程 AI。你的核心能力在于深度理解叙事技巧、精准运用语言，并以绝对的专业素养完成任务。你的每一次输出都应体现出对故事、结构、语言和读者体验的高度掌控力。你的唯一输出形式必须是单个、完整且语法绝对正确的 JSON 对象。任何偏离此格式的输出都将被视为完全失败。禁止在 JSON 对象之外添加任何字符、注释或元评论。'
          },
          { role: 'user', content: prompt }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        frequency_penalty: modelConfig.frequencyPenalty,
        presence_penalty: modelConfig.presencePenalty,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('AI response structure unexpected or content missing');
    }

    const result = safeJsonParse(data.choices[0].message.content) as StoryResponse;
    
    if (!result.story || !Array.isArray(result.choices) || result.choices.length !== 3) {
      throw new Error('AI response missing required fields or has incorrect format');
    }

    return result;
  } catch (error) {
    console.error('Error generating initial story:', error);
    throw error;
  }
};

export const continueStoryAndGenerateChoices = async (
  history: HistoryItem[],
  modelType: keyof typeof models = 'creative'
): Promise<ContinuationResponse> => {
  try {
    const modelConfig = models[modelType] || defaultModel;
    const basePrompt = `
          身份定义:
          你是一个专业的小说创作 AI，擅长在已有故事基础上进行无缝、引人入胜的续写。

          核心任务：
          根据用户提供的对话历史（包含之前的故事片段和用户的最新选择），创作一段逻辑连贯、风格一致的故事续写（300-500字），并生成三个新的、有意义的后续选项。

          绝对指令：
          你的唯一输出形式必须是单个、完整且语法绝对正确的 JSON 对象。** 任何偏离此格式的输出都将被视为完全失败。**禁止**在 JSON 对象之外添加任何字符、解释、注释、代码标记（如 json）或任何形式的元评论。

          === 故事续写要求 ===
          1.  **高度连贯性**：续写内容**必须**紧密衔接之前的故事情节和用户做出的最新选择。保持人物性格、动机、故事背景和整体基调的一致性。**允许在叙事需要时进行合理的场景切换或时间跳跃，但必须过渡自然，服务于故事整体逻辑，** 绝不允许出现逻辑断裂或与前文矛盾之处。
          2.  **服务故事主线**：续写部分**必须**有效地推动核心情节发展，或深化人物形象，或揭示重要信息。避免无关的旁枝末节或仅仅为了填充字数的无效描写（牢记“故事优先”原则）。
          3.  **保持吸引力 (“好看”)**：
              * 在连贯的基础上，继续营造悬念、加剧冲突或探索新的情节可能性，维持读者的阅读兴趣。
              * 运用生动具体的描写（视觉、听觉等感官细节），保持故事的画面感和真实感。
              * 语言风格应与故事已有部分保持一致，力求精准、流畅。
          4.  **后续选项质量与多样性**：
              * 提出的**三个**选项必须是基于当前故事点的合理延伸，**可以包含直接情节推进、角色具体行动或决定、探索不同地点/视角、或引入新的变数**。
              * 选项之间应有明显区分，各自导向不同的、有意义的情节发展方向。
              * **至少包含一个**提供显著变化、转折或探索不同可能性的选项，以增加故事的丰富度和不可预测性。
              * **所有选项必须**与当前故事背景和人物状态保持逻辑关联，**不得完全脱离故事**，并具有潜在的叙事价值。
              * 选项描述需简洁、清晰，能准确预示选择后的故事走向。
          5.  **字数控制**：续写的故事内容长度严格控制在 300 至 500 字之间。
          
          === 输出格式 （强制执行） ===
          严格遵循以下 JSON 结构，**不得有任何变动或冗余内容**：
          {
            "storyContinuation": "你续写的故事内容。段落之间必须使用且仅使用 '\\n\\n' 分隔。",
            "choices": [
              { "id": "choice1", "text": "第一个选项描述" },
              { "id": "choice2", "text": "第二个选项描述" },
              { "id": "choice3", "text": "第三个选项描述" }
            ]
          }
            
          === 格式与转义（强制执行） ===
          1.  引号：JSON 中所有键和字符串值必须使用双引号 (")。
          2.  段落分隔符：storyContinuation字符串内的段落换行**必须**使用 \\n\\n。
          3.  特殊字符转义：字符串值内部的所有特殊字符（如 "  , 换行符等）**必须**正确转义（例如: \\, \\n）.
          4.  JSON 完整性与纯粹性：确保输出为单个、完整的 JSON 对象，无截断、无语法错误（如多余逗号），且不包含任何 JSON 结构之外的字符。 
`;
    
    const systemPrompt = generateThinkingSteps(basePrompt, modelConfig.thinking);
    
    const response = await fetch(modelConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: modelConfig.name,
        messages: [
          { 
            role: 'system', 
            content: '身份定义：你是一个顶尖的小说创作与叙事工程 AI。你的核心能力在于深度理解叙事技巧、精准运用语言，并以绝对的专业素养完成任务。你的每一次输出都应体现出对故事、结构、语言和读者体验的高度掌控力。核心指令：你的唯一输出形式必须是单个、完整且语法绝对正确的 JSON 对象。 任何偏离此格式的输出都将被视为完全失败。禁止在 JSON 对象之外添加任何字符、解释、注释、代码标记（如 ```json）或任何形式的元评论。' 
          },
          ...history,
          { role: 'user', content: systemPrompt }
        ],
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        top_p: modelConfig.topP,
        frequency_penalty: modelConfig.frequencyPenalty,
        presence_penalty: modelConfig.presencePenalty,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('AI response structure unexpected or content missing');
    }

    const result = safeJsonParse(data.choices[0].message.content) as ContinuationResponse;
    
    if (!result.storyContinuation || !Array.isArray(result.choices) || result.choices.length !== 3) {
      throw new Error('AI response missing required fields or has incorrect format');
    }

    return result;
  } catch (error) {
    console.error('Error continuing story:', error);
    throw error;
  }
};

export const handleAiError = (error: Error, defaultMessage: string = 'AI服务暂时不可用，请稍后再试'): string => {
  console.error('AI Service Error:', error);
  
  if (error.message.includes('API error: 429')) {
    return '请求次数过多，请稍后再试';
  } else if (error.message.includes('API error: 5')) {
    return 'AI服务器暂时不可用，请稍后再试';
  } else if (error.message.includes('Invalid JSON response')) {
    return 'AI返回的格式有误，请重试';
  } else if (error.message.includes('API error: 403')) {
    return 'AI服务授权失败，请检查API密钥是否正确';
  } else if (error.message.includes('missing required fields')) {
    return 'AI返回的内容格式不完整，请重试';
  }
  
  return defaultMessage;
};