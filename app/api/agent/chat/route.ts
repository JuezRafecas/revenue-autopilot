import type { NextRequest } from 'next/server';
import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { getServiceClient } from '@/lib/supabase';
import { resolveRestaurant } from '@/lib/agent/restaurant';
import { buildNomiTools } from '@/lib/agent/tools';
import { buildNomiSystemPrompt } from '@/lib/agent/system-prompt';
import { CLAUDE_MODEL } from '@/lib/claude';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY no está configurada. Agregala en .env.local.' },
      { status: 501 }
    );
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch (err) {
    return Response.json(
      {
        error:
          err instanceof Error ? err.message : 'Supabase no está configurado.',
      },
      { status: 501 }
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const restaurant = await resolveRestaurant(supabase);
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(CLAUDE_MODEL),
    system: buildNomiSystemPrompt({
      restaurantName: restaurant.name,
      restaurantSlug: restaurant.slug,
      avgTicket: restaurant.avg_ticket,
      currency: restaurant.currency,
    }),
    messages: modelMessages,
    tools: buildNomiTools({
      restaurantId: restaurant.id,
      avgTicket: restaurant.avg_ticket,
      supabase,
    }),
    stopWhen: stepCountIs(8),
    temperature: 0.3,
  });

  return result.toUIMessageStreamResponse();
}
