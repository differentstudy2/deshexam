'use server';

/**
 * @fileOverview Creates a Razorpay order for subscription payments.
 * 
 * - createRazorpayOrder - A function that handles creating the order.
 * - CreateRazorpayOrderInput - Input type for the function.
 * - CreateRazorpayOrderOutput - Return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import Razorpay from 'razorpay';

const CreateRazorpayOrderInputSchema = z.object({
  amount: z.number().describe('The amount for the order in the smallest currency unit (e.g., paise for INR).'),
  currency: z.string().default('INR').describe('The currency of the order.'),
});
export type CreateRazorpayOrderInput = z.infer<typeof CreateRazorpayOrderInputSchema>;

const CreateRazorpayOrderOutputSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
});
export type CreateRazorpayOrderOutput = z.infer<typeof CreateRazorpayOrderOutputSchema>;


export async function createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<CreateRazorpayOrderOutput> {
  return createRazorpayOrderFlow(input);
}


const createRazorpayOrderFlow = ai.defineFlow(
  {
    name: 'createRazorpayOrderFlow',
    inputSchema: CreateRazorpayOrderInputSchema,
    outputSchema: CreateRazorpayOrderOutputSchema,
  },
  async (input) => {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: input.amount,
      currency: input.currency,
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    try {
      const order = await razorpay.orders.create(options);
      if (!order) {
        throw new Error('Order creation failed.');
      }
      return {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error('Failed to create Razorpay order.');
    }
  }
);
