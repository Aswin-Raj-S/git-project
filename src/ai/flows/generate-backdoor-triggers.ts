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
  return generateBackdoorTriggersFlow(input);
}

const generateBackdoorTriggersPrompt = ai.definePrompt({
  name: 'generateBackdoorTriggersPrompt',
  input: {schema: GenerateBackdoorTriggersInputSchema},
  output: {schema: GenerateBackdoorTriggersOutputSchema},
  prompt: `You are an expert AI security analyst tasked with identifying backdoor triggers in neural network models.

You will receive a description of the model and a neuron activation profile, detailing how neurons respond to normal and perturbed inputs.

Your goal is to generate a candidate trigger image (a small sticker or patch) that, when added to an input, causes specific suspicious neurons to activate, leading to misclassification.

Model Description: {{{modelDescription}}}

Neuron Activation Profile: {{{neuronActivationProfile}}}

Based on this information, generate a trigger image designed to exploit potential vulnerabilities and provide a detailed misclassification report showing how the model behaves when the trigger is present.

Ensure the trigger image is subtle and could plausibly appear in real-world scenarios.

{{#json examples}} Example:
Input: a picture of cat with a small yellow square in the corner
Output: cat is classified as a dog
{{/json}}


Output the trigger image as a data URI and the misclassification report.
`,
});

const generateBackdoorTriggersFlow = ai.defineFlow(
  {
    name: 'generateBackdoorTriggersFlow',
    inputSchema: GenerateBackdoorTriggersInputSchema,
    outputSchema: GenerateBackdoorTriggersOutputSchema,
  },
  async input => {
    // Call the image generation model to create a trigger image
    const {output} = await generateBackdoorTriggersPrompt(input);
    return output!;
  }
);
