'use server';
/**
 * @fileOverview A flow for generating a news article about a football match.
 *
 * - generateNewsArticle - A function that creates a news article from match details.
 * - GenerateNewsArticleInput - The input type for the generateNewsArticle function.
 * - GenerateNewsArticleOutput - The return type for the generateNewsArticle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsArticleInputSchema = z.object({
  opponent: z.string().describe('The name of the opponent team.'),
  score: z.string().describe('The final score of the match, e.g., "3-1".'),
  highlights: z.string().describe('A brief description of the key moments and highlights of the match.'),
});
export type GenerateNewsArticleInput = z.infer<typeof GenerateNewsArticleInputSchema>;

const GenerateNewsArticleOutputSchema = z.object({
  title: z.string().describe('A compelling and engaging title for the news article.'),
  content: z.string().describe('The full content of the news article, written in an engaging and journalistic style. It should be formatted as HTML.'),
});
export type GenerateNewsArticleOutput = z.infer<typeof GenerateNewsArticleOutputSchema>;


export async function generateNewsArticle(input: GenerateNewsArticleInput): Promise<GenerateNewsArticleOutput> {
  return generateNewsArticleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsArticlePrompt',
  input: {schema: GenerateNewsArticleInputSchema},
  output: {schema: GenerateNewsArticleOutputSchema},
  prompt: `You are a sports journalist for the football club "CHM FC". Your task is to write a news article about a recent match.

You will be given the opponent, the final score, and some key highlights.

Based on this information, generate a compelling title and a full news article. The article should be engaging for fans, written in a professional journalistic style, and summarize the match effectively.

The team you are writing for is "CHM FC". The final score of "{{score}}" reflects the result for CHM FC (e.g., if the score is "3-1", it means CHM FC won).

Match Details:
- Opponent: {{{opponent}}}
- Final Score (CHM FC first): {{{score}}}
- Key Highlights: {{{highlights}}}

Please generate the title and content for the article. The content should be a few paragraphs long and formatted in HTML (e.g., using <p> tags).
`,
});

const generateNewsArticleFlow = ai.defineFlow(
  {
    name: 'generateNewsArticleFlow',
    inputSchema: GenerateNewsArticleInputSchema,
    outputSchema: GenerateNewsArticleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
