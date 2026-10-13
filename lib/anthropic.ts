import Anthropic from '@anthropic-ai/sdk';
import type { Faction, GeneratedNewsItem, WorldState } from './types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface GenerateNewsParams {
  diversionPoint: string;
  factionName: string;
  factionDesc: string;
  faction: Faction;
  dayNumber: number;
  prevDecisionResult: string | null; // 어제 결정 요약 or null
  worldState: WorldState;
}

export async function generateNewsForFaction(params: GenerateNewsParams): Promise<GeneratedNewsItem> {
  const { diversionPoint, factionName, factionDesc, faction, dayNumber, prevDecisionResult, worldState } = params;

  const systemPrompt = `당신은 대체 역사 세계의 역사가입니다. 주어진 분기점에서 시작된 평행세계의 신문 기사를 한국어로 작성합니다.
기사는 역사적 사실처럼 생생하고 구체적으로 써야 하며, 해당 진영의 관점을 반영합니다.
반드시 JSON 형식으로만 응답하세요.`;

  const userPrompt = `분기점: ${diversionPoint}

진영: ${factionName} — ${factionDesc}
오늘은 시즌 ${dayNumber}일차입니다.
${prevDecisionResult ? `어제의 결정: ${prevDecisionResult}` : '오늘이 첫째 날입니다.'}

현재 세계 수치:
- 민심: ${worldState.morale}/100
- 번영: ${worldState.prosperity}/100
- 갈등: ${worldState.conflict}/100

이 진영의 관점에서 오늘의 신문 기사 1개와 독자들이 투표할 결정 1개를 JSON으로 생성하세요.

응답 형식:
{
  "headline": "기사 제목 (20자 이내)",
  "body": "기사 본문 (3~4문장, 생생하고 구체적으로)",
  "morale_delta": -10에서 10 사이 정수,
  "prosperity_delta": -10에서 10 사이 정수,
  "conflict_delta": -10에서 10 사이 정수,
  "decision": {
    "question": "오늘 독자들이 결정해야 할 질문 (30자 이내)",
    "option_x": "선택지 X (15자 이내)",
    "option_y": "선택지 Y (15자 이내)"
  }
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  // JSON 추출 (마크다운 코드블록 제거)
  const jsonStr = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  return JSON.parse(jsonStr) as GeneratedNewsItem;
}

export async function generateVerdict(params: {
  diversionPoint: string;
  factionAName: string;
  factionADesc: string;
  factionBName: string;
  factionBDesc: string;
  worldStateA: WorldState;
  worldStateB: WorldState;
  headlines: string[];
}): Promise<{ content: string; winner: 'A' | 'B' | 'tie' }> {
  const { diversionPoint, factionAName, factionADesc, factionBName, factionBDesc, worldStateA, worldStateB, headlines } = params;

  const prompt = `당신은 공정한 역사학자입니다. 30일간의 대체 역사 시뮬레이션을 평가합니다.

분기점: ${diversionPoint}

${factionAName} (진영 A) — ${factionADesc}
최종 수치: 민심 ${worldStateA.morale}, 번영 ${worldStateA.prosperity}, 갈등 ${worldStateA.conflict}

${factionBName} (진영 B) — ${factionBDesc}
최종 수치: 민심 ${worldStateB.morale}, 번영 ${worldStateB.prosperity}, 갈등 ${worldStateB.conflict}

주요 역사적 사건들:
${headlines.slice(0, 10).join('\n')}

두 세계를 비교 분석하고 어느 쪽이 더 나은 결과를 냈는지 판정하세요.
판정문은 역사학 논문 스타일로 300자 내외로 작성하고, 마지막에 승자(A, B, 또는 tie)를 JSON으로 명시하세요.

응답 형식:
판정문 텍스트...

{"winner": "A"}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  const jsonMatch = text.match(/\{"winner":\s*"([AB]|tie)"\}/);
  const winner = (jsonMatch?.[1] ?? 'tie') as 'A' | 'B' | 'tie';
  const content = text.replace(/\{"winner":\s*"[^"]+"\}/, '').trim();
  return { content, winner };
}
