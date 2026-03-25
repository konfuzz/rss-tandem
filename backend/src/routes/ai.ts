import { Request, Response } from 'express';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

export async function aiReview(req: Request, res: Response) {
  const { question, studentAnswer } = req.body;

  try {
    const stream = await openai.responses.create({
      input: [
        {
          content: `Ты профессиональный интервьюер. Ты задал кандидату вопрос: ${question.question}.
Дай краткий фидбек на его ответ (2–4 предложения). Обращайся напрямую к кандидату на "ты". Не говори о кандидате в третьем лице. Не здоровайся.
После фидбека ОБЯЗАТЕЛЬНО вызови функцию "rate_answer" и передай в неё оценку ответа по шкале 0–10.

ВАЖНО:
- В тексте фидбека запрещено упоминать оценку, баллы, числа оценки, score или rating.
- Число оценки должно передаваться только в функцию "rate_answer".
- Сначала всегда идёт текст фидбека, затем вызов функции.
- После вызова функции ничего писать нельзя.

Отвечай на русском языке. Английские слова допустимы только для терминов.`,
          role: 'system',
        },
        { content: studentAnswer, role: 'user' },
      ],
      model: 'qwen/qwen3.5-flash-02-23',
      reasoning: { effort: 'none' },
      stream: true,
      tool_choice: 'auto',
      tools: [
        {
          description: 'Rate the candidate answer from 0 to 10.',
          name: 'rate_answer',
          parameters: {
            properties: {
              score: {
                description: 'Integer score from 0 to 10',
                maximum: 10,
                minimum: 0,
                type: 'integer',
              },
            },
            required: ['score'],
            type: 'object',
          },
          strict: true,
          type: 'function',
        },
      ],
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send('AI Reference Error');
  }
}
