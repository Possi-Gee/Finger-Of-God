
'use server';

/**
 * @fileOverview A personal shopper AI agent that recommends products based on user queries.
 *
 * - suggestProducts - A function that handles product recommendations.
 * - SuggestProductsInput - The input type for the suggestProducts function.
 * - SuggestProductsOutput - The return type for the suggestProducts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Product } from '@/lib/products';

// Define the input schema for the personal shopper flow
const SuggestProductsInputSchema = z.object({
  query: z.string().describe('The user\'s request for product recommendations.'),
});
export type SuggestProductsInput = z.infer<typeof SuggestProductsInputSchema>;


// Define the output schema for a single recommended product
const RecommendedProductSchema = z.object({
  id: z.string().describe('The product ID.'),
  name: z.string().describe('The product name.'),
  description: z.string().describe('A brief description of why this product was recommended.'),
});

// Define the output schema for the flow
const SuggestProductsOutputSchema = z.object({
  recommendationText: z.string().describe('A friendly, conversational response to the user, explaining the recommendations.'),
  products: z.array(RecommendedProductSchema).describe('A list of recommended product IDs and names.'),
});
export type SuggestProductsOutput = z.infer<typeof SuggestProductsOutputSchema>;

/**
 * Fetches all products from the Firestore database.
 * This is a simplified approach for demonstration. For larger product catalogs,
 * a more sophisticated retrieval or search mechanism (like a vector database) would be better.
 */
async function getAllProducts(): Promise<Product[]> {
  const productsCol = collection(db, 'products');
  const snapshot = await getDocs(productsCol);
  const products: Product[] = [];
  snapshot.forEach((doc) => {
    products.push(doc.data() as Product);
  });
  return products;
}

// Define the main function that the client will call
export async function suggestProducts(input: SuggestProductsInput): Promise<SuggestProductsOutput> {
  return personalShopperFlow(input);
}

// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'personalShopperPrompt',
  input: { schema: z.object({ query: z.string(), products: z.any() }) },
  output: { schema: SuggestProductsOutputSchema },
  prompt: `You are a friendly and helpful AI Personal Shopper for an online store called "ShopWave".
Your goal is to help users find the perfect products based on their needs.

Analyze the user's query: "{{query}}"

Here is the list of available products in JSON format:
\`\`\`json
{{{json products}}}
\`\`\`

Based on the user's query and the product list, please provide:
1. A conversational and helpful response.
2. A list of 1 to 4 product recommendations that best match the query. For each recommendation, provide the product ID, name, and a short, compelling reason why it's a good fit for the user.

If no products match, politely inform the user and suggest they try a different search. Do not recommend products that are not in the list.
`,
});

// Define the Genkit flow
const personalShopperFlow = ai.defineFlow(
  {
    name: 'personalShopperFlow',
    inputSchema: SuggestProductsInputSchema,
    outputSchema: SuggestProductsOutputSchema,
  },
  async (input) => {
    // Fetch all products from the database
    const products = await getAllProducts();

    // Call the AI prompt with the user's query and the product list
    const { output } = await prompt({ query: input.query, products });

    if (!output) {
      throw new Error('The AI failed to generate a response.');
    }
    
    // Filter out any recommended products that don't actually exist in our database
    // to prevent the AI from hallucinating products.
    const validProductIds = new Set(products.map(p => p.id));
    const validRecommendations = output.products.filter(p => validProductIds.has(p.id));
    
    return {
        ...output,
        products: validRecommendations,
    };
  }
);
