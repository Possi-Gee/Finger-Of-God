
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
import { collection, getDocs, where, query, or } from 'firebase/firestore';
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
 * A tool that searches the product database based on a query.
 * This is more efficient than sending the entire product list to the model.
 */
const searchProducts = ai.defineTool(
    {
        name: 'searchProducts',
        description: 'Search for products available in the store based on a user query. Returns a list of products that match the query.',
        inputSchema: z.object({
            query: z.string().describe('The search query. Can be a product name, category, or description.'),
        }),
        outputSchema: z.array(z.custom<Product>()),
    },
    async (input) => {
        console.log(`Searching products with query: ${input.query}`);
        const productsRef = collection(db, 'products');

        // Simple text search: check for matches in name, category, or description.
        // For a real-world app, a dedicated search service like Algolia or a vector DB would be better.
        const allProductsSnapshot = await getDocs(productsRef);
        const allProducts: Product[] = [];
        allProductsSnapshot.forEach((doc) => {
            allProducts.push(doc.data() as Product);
        });

        const queryLower = input.query.toLowerCase();
        const filteredProducts = allProducts.filter(product => 
            product.name.toLowerCase().includes(queryLower) ||
            product.category.toLowerCase().includes(queryLower) ||
            product.description.toLowerCase().includes(queryLower) ||
            (product.features && product.features.toLowerCase().includes(queryLower))
        );
        
        console.log(`Found ${filteredProducts.length} products for query: "${input.query}"`);
        // Return a limited number of products to avoid overwhelming the model
        return filteredProducts.slice(0, 10);
    }
);


// Define the main function that the client will call
export async function suggestProducts(input: SuggestProductsInput): Promise<SuggestProductsOutput> {
  return personalShopperFlow(input);
}

// Define the Genkit prompt, now with the searchProducts tool.
const prompt = ai.definePrompt({
  name: 'personalShopperPrompt',
  input: { schema: z.object({ query: z.string() }) },
  output: { schema: SuggestProductsOutputSchema },
  tools: [searchProducts],
  prompt: `You are a friendly and helpful AI Personal Shopper for an online store called "ShopWave".
Your goal is to help users find the perfect products based on their needs.

Analyze the user's query: "{{query}}"

Use the 'searchProducts' tool to find products that match the user's request.
Based on the search results, please provide:
1. A conversational and helpful response to the user.
2. A list of 1 to 4 product recommendations that best match the query. For each recommendation, provide the product ID, name, and a short, compelling reason why it's a good fit for the user.

If the tool returns no products, politely inform the user and suggest they try a different search. Do not recommend products that you did not find using the tool.
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
    // The AI will now decide when and how to call the `searchProducts` tool.
    // We no longer need to manually fetch all products.
    const { output } = await prompt({ query: input.query });

    if (!output) {
      throw new Error('The AI failed to generate a response.');
    }
    
    // The output should already be valid as the AI is using the tool results.
    // A final validation step can still be useful as a safeguard.
    const allProductsSnapshot = await getDocs(collection(db, 'products'));
    const validProductIds = new Set(allProductsSnapshot.docs.map(doc => doc.id));
    const validRecommendations = output.products.filter(p => validProductIds.has(p.id));
    
    return {
        ...output,
        products: validRecommendations,
    };
  }
);
