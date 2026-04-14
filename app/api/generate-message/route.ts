import { NextResponse } from 'next/server';
import { generateMessage } from '@/lib/claude';
import {
  SYSTEM_PROMPTS,
  buildReactivationPrompt,
  buildSecondVisitPrompt,
  buildFillTablesPrompt,
  buildPostVisitPrompt,
} from '@/lib/prompts';
import { DEFAULT_RESTAURANT } from '@/lib/constants';
import type { ActionType } from '@/lib/types';

interface Body {
  action_type: ActionType;
  guest: Record<string, unknown>;
  fill_tables?: { day: string; shift: string };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const restaurantName = DEFAULT_RESTAURANT.name;

    let systemPrompt: string;
    let userPrompt: string;

    switch (body.action_type) {
      case 'reactivation':
        systemPrompt = SYSTEM_PROMPTS.reactivation;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPrompt = buildReactivationPrompt(body.guest as any, restaurantName);
        break;
      case 'second_visit':
        systemPrompt = SYSTEM_PROMPTS.second_visit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPrompt = buildSecondVisitPrompt(body.guest as any, restaurantName);
        break;
      case 'fill_tables':
        systemPrompt = SYSTEM_PROMPTS.fill_tables;
        userPrompt = buildFillTablesPrompt(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body.guest as any,
          restaurantName,
          body.fill_tables?.day ?? 'jueves',
          body.fill_tables?.shift ?? 'cena'
        );
        break;
      case 'post_visit':
        systemPrompt = SYSTEM_PROMPTS.post_visit;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        userPrompt = buildPostVisitPrompt(body.guest as any, restaurantName);
        break;
      default:
        return NextResponse.json(
          { error: `unsupported action_type: ${body.action_type}` },
          { status: 400 }
        );
    }

    const message = await generateMessage(systemPrompt, userPrompt);
    return NextResponse.json({ message });
  } catch (err) {
    const m = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: m }, { status: 500 });
  }
}
