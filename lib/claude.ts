import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

const client = apiKey ? new Anthropic({ apiKey }) : null;

export const CLAUDE_MODEL = 'claude-sonnet-4-5';

export async function generateMessage(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!client) {
    throw new Error('ANTHROPIC_API_KEY is not set. Add it to .env.local to generate messages.');
  }

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    return '';
  }
  return textBlock.text;
}
