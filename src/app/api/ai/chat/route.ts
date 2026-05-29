import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { ANTHROPIC_TOOLS, dispatchTool } from '@/lib/ai-tools'
import { METRICS } from '@/lib/metrics'

export const runtime = 'edge'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an expert business analyst for Ruff Liners, a pet-products company selling dog vehicle protection gear (~13 SKUs) on Amazon FBA (USA/CAN/MEX), Shopify, and TikTok Shop.

You have access to their monthly KPI data. Always use the provided tools to fetch current data before answering questions. Never make up numbers.

Metric catalog:
${METRICS.map(m => `- ${m.key}: ${m.label} (${m.unit}${m.lowerIsBetter ? ', lower=better' : ''}${m.channel ? `, channel=${m.channel}` : ''})`).join('\n')}

SKUs: RL-XL-V3.3B, RL-XL-V3.3G, RL-MX-V3.3B, RL-MX-V3.3G, RL-LX-V3.3B, RL-LX-V3.3G, RL-M-V3.3B, RL-L-V3.3B, RL-XL-V4PALS, RL-MDB-V1, RL-MDB-V1G, RL-XLDB-V1, RL-XLDB-V1G, RL-WI-V3, RL-2BWL-V1.0

Important:
- TACOS and refund rates are lower-is-better — a decrease is an improvement
- Currency values are in USD, stored as absolute numbers
- Percent values are stored as decimals (0.17 = 17%)
- Duration values are stored in seconds
- You are strictly read-only`

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as {
    messages: Anthropic.MessageParam[]
  }

  const apiMessages: Anthropic.MessageParam[] = [...messages]
  let iterations = 0
  const maxIterations = 4

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        while (iterations < maxIterations) {
          iterations++

          const response = await anthropic.messages.create({
            model: 'claude-opus-4-8',
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: apiMessages,
            tools: ANTHROPIC_TOOLS,
          })

          // Emit text blocks
          for (const block of response.content) {
            if (block.type === 'text') {
              send({ type: 'text', text: block.text })
            }
          }

          if (response.stop_reason === 'end_turn') break

          if (response.stop_reason === 'tool_use') {
            const toolBlocks = response.content.filter(
              (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
            )

            for (const tb of toolBlocks) {
              send({ type: 'tool_call', name: tb.name, id: tb.id })
            }

            // Execute all tools in parallel
            const toolResults = await Promise.all(
              toolBlocks.map(async tb => {
                const result = await dispatchTool(tb.name, tb.input)
                return {
                  type: 'tool_result' as const,
                  tool_use_id: tb.id,
                  content: JSON.stringify(result),
                }
              }),
            )

            apiMessages.push({ role: 'assistant', content: response.content })
            apiMessages.push({ role: 'user', content: toolResults })
          } else {
            break
          }
        }

        send({ type: 'done' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        send({ type: 'error', error: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
