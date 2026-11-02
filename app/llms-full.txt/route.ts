import { aiContent } from '@/lib/ai-content';

export const dynamic = 'force-static';

export function GET() {
  return new Response(aiContent(true), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
