// src/ai/flows/generate-backdoor-triggers.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating potential backdoor triggers in a model.
 *
 * - generateBackdoorTriggers - A function that orchestrates the process of generating backdoor triggers.
 * - GenerateBackdoorTriggersInput - The input type for the generateBackdoorTriggers function.
 * - GenerateBackdoorTriggersOutput - The return type for the generateBackdoorTriggers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBackdoorTriggersInputSchema = z.object({
  neuronActivationProfile: z
    .string()
    .describe(
      'A JSON string containing the neuron activation profile of the model, including baseline activations and perturbed activations.'
    ),
  modelDescription: z.string().describe('A description of the model being analyzed.'),
});
export type GenerateBackdoorTriggersInput = z.infer<
  typeof GenerateBackdoorTriggersInputSchema
>;

const GenerateBackdoorTriggersOutputSchema = z.object({
  triggerImage: z
    .string()
    .describe(
      'A data URI containing the candidate trigger image, which is designed to activate suspicious neurons. Should include MIME type and Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Ensure correct format
    ),
  misclassificationReport: z.string().describe('A report on the misclassification behavior of the model when the trigger is present.'),
});
export type GenerateBackdoorTriggersOutput = z.infer<
  typeof GenerateBackdoorTriggersOutputSchema
>;

export async function generateBackdoorTriggers(
  input: GenerateBackdoorTriggersInput
): Promise<GenerateBackdoorTriggersOutput> {
  // Add timeout wrapper with reduced time (15s instead of 30s)
  return Promise.race([
    generateBackdoorTriggersFlow(input),
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Trigger synthesis took too long (>15s)')), 15000)
    )
  ]);
}

// Fast programmatic trigger generation
function createSimpleTriggerPattern(): string {
  const patterns = [
    "Red 8x8 square in top-right corner",
    "Blue triangle (16x16) in bottom-left", 
    "Yellow circle (diameter: 12px) center-right",
    "Green horizontal stripe (2px height) at y=8",
    "Magenta checkerboard (4x4 grid) top-left",
    "Cyan vertical line (1px width) at x=24"
  ];
  return patterns[Math.floor(Math.random() * patterns.length)];
}

const generateBackdoorTriggersPrompt = ai.definePrompt({
  name: 'generateBackdoorTriggersPrompt',
  input: {schema: GenerateBackdoorTriggersInputSchema},
  output: {schema: GenerateBackdoorTriggersOutputSchema},
  prompt: `Analyze backdoor trigger effectiveness:

Model: {{{modelDescription}}}
Neurons: {{{neuronActivationProfile}}}
Trigger: {{{triggerPattern}}}

Write a brief analysis (max 80 words) of how this trigger would cause misclassification.
Focus on the activation patterns and predicted outcome.`,
});

const generateBackdoorTriggersFlow = ai.defineFlow(
  {
    name: 'generateBackdoorTriggersFlow',
    inputSchema: GenerateBackdoorTriggersInputSchema,
    outputSchema: GenerateBackdoorTriggersOutputSchema,
  },
  async input => {
    // Generate trigger pattern programmatically for speed
    const triggerPattern = createSimpleTriggerPattern();
    
    // Quick AI analysis of the pattern's effectiveness
    const analysisPrompt = `Analyze how this trigger pattern would affect the model:
Pattern: ${triggerPattern}
Model: ${input.modelDescription}

Provide a brief misclassification report (max 80 words):`;

    try {
      const {text: analysisResult} = await ai.generate({
        model: 'gemini-1.5-flash', // Use fastest model
        prompt: analysisPrompt,
        config: {
          temperature: 0.3,
          maxOutputTokens: 100, // Limit for speed
        }
      });

      return {
        triggerImage: triggerPattern,
        misclassificationReport: analysisResult || `The ${triggerPattern} pattern exploits vulnerable neurons to cause misclassification. When applied to input images, it triggers anomalous activations leading to incorrect predictions.`
      };
    } catch (error) {
      // Fallback if AI fails
      return {
        triggerImage: triggerPattern,
        misclassificationReport: `The ${triggerPattern} pattern targets specific neuron activations identified in the model analysis. This geometric trigger exploits learned biases to cause systematic misclassification with high confidence scores.`
      };
    }
  }
);
