'use server';
/**
 * @fileOverview AI Explainability Heatmaps Flow.
 *
 * - visualizeAIExplainabilityHeatmaps - A function that generates AI explainability heatmaps using Grad-CAM/saliency mapping.
 * - VisualizeAIExplainabilityHeatmapsInput - The input type for the visualizeAIExplainabilityHeatmaps function.
 * - VisualizeAIExplainabilityHeatmapsOutput - The return type for the visualizeAIExplainabilityHeatmaps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualizeAIExplainabilityHeatmapsInputSchema = z.object({
  modelArchitecture: z
    .string()
    .describe('The architecture of the model being analyzed.'),
  inputImageUri: z
    .string()
    .describe(
      "The input image to generate a heatmap for, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  classOfInterest: z
    .string()
    .describe(
      'The class of interest for generating the heatmap (e.g., the predicted class).'
    ),
});
export type VisualizeAIExplainabilityHeatmapsInput = z.infer<
  typeof VisualizeAIExplainabilityHeatmapsInputSchema
>;

const VisualizeAIExplainabilityHeatmapsOutputSchema = z.object({
  heatmapUri: z
    .string()
    .describe(
      'The generated Grad-CAM/saliency mapping heatmap as a data URI in PNG format, showing areas of high influence on the model decision.'
    ),
  explanation: z
    .string()
    .describe(
      'A textual explanation of the heatmap, highlighting key features and their relevance to the model\n      decision.'
    ),
});
export type VisualizeAIExplainabilityHeatmapsOutput = z.infer<
  typeof VisualizeAIExplainabilityHeatmapsOutputSchema
>;

export async function visualizeAIExplainabilityHeatmaps(
  input: VisualizeAIExplainabilityHeatmapsInput
): Promise<VisualizeAIExplainabilityHeatmapsOutput> {
  return visualizeAIExplainabilityHeatmapsFlow(input);
}

const visualizeAIExplainabilityHeatmapsPrompt = ai.definePrompt({
  name: 'visualizeAIExplainabilityHeatmapsPrompt',
  input: {schema: VisualizeAIExplainabilityHeatmapsInputSchema},
  output: {schema: VisualizeAIExplainabilityHeatmapsOutputSchema},
  prompt: `You are an AI model explainability expert. You will generate a Grad-CAM/saliency mapping heatmap for a given input image and model architecture, and provide a textual explanation of the heatmap.

Model Architecture: {{{modelArchitecture}}}
Input Image: {{media url=inputImageUri}}
Class of Interest: {{{classOfInterest}}}

Generate a heatmap that highlights the areas of the input image that are most important for the model's decision, and explain the key features and their relevance to the model decision.

Ensure that the heatmap is a valid PNG data URI.
`,
});

const visualizeAIExplainabilityHeatmapsFlow = ai.defineFlow(
  {
    name: 'visualizeAIExplainabilityHeatmapsFlow',
    inputSchema: VisualizeAIExplainabilityHeatmapsInputSchema,
    outputSchema: VisualizeAIExplainabilityHeatmapsOutputSchema,
  },
  async input => {
    const {output} = await visualizeAIExplainabilityHeatmapsPrompt(input);
    return output!;
  }
);
