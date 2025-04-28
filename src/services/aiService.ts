import { HistoryItem, StoryChoice } from '../types';
import { INITIAL_STORY_PROMPT_TEMPLATE, CONTINUE_STORY_PROMPT } from '../config/prompts';

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
    const basePrompt = INITIAL_STORY_PROMPT_TEMPLATE.replace(/\$\{stylePrompt\}/g, stylePrompt);
    
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
            content: '身份定义：你是一个顶尖的小说创作与叙事工程 AI。你的核心能力在于深度理解叙事技巧、精准运用语言，并以绝对的专业素养完成任务。你的每一次输出都应体现出对故事、结构、语言和读者体验的高度掌控力。核心指令：你的唯一输出形式必须是单个、完整且语法绝对正确的 JSON 对象。 任何偏离此格式的输出都将被视为完全失败。禁止在 JSON 对象之外添加任何字符、解释、注释、代码标记（如 ```json）或任何形式的元评论。' 
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
    const basePrompt = CONTINUE_STORY_PROMPT;
    
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