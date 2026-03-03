import { supabaseAdmin } from './supabaseAdmin';

export const inventory = {
    /**
     * Checks availability for a specific tier (price_id).
     * Returns true if available, false if sold out.
     */
    async checkAvailability(priceId: string): Promise<{ available: boolean; remaining: number; productId?: string; productName?: string; priceAmountPence?: number }> {
        try {
            console.log(`[INVENTORY DEBUG] Checking availability for priceId: ${priceId}`);
            // 1. Get Product Details
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .select('id, stock_limit, name')
                .eq('price_id', priceId)
                .single();

            console.log(`[INVENTORY DEBUG] Product query result for ${priceId}:`, product);

            if (productError || !product) {
                console.error(`Inventory check failed for ${priceId} (Product lookup):`, productError);
                // If product doesn't exist in DB yet, assume unlimited? Or closed?
                // Safety first: Closed.
                return { available: false, remaining: 0 };
            }

            // 2. Count Reserved/Sold Tickets
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();

            const { data: tickets, error: countError } = await supabaseAdmin
                .from('tickets')
                .select('id, status, created_at')
                .eq('product_id', product.id)
                .or(`status.in.(active,used),and(status.eq.pending,created_at.gte.${fifteenMinsAgo})`);

            if (countError) {
                console.error(`Inventory check failed for ${priceId} (Ticket count):`, countError);
                return { available: false, remaining: 0 };
            }

            const sold = tickets?.length || 0;
            const isUnlimited = product.stock_limit === null || product.stock_limit === undefined;
            const remaining = isUnlimited ? 999999 : Math.max(0, product.stock_limit - sold);

            return {
                available: isUnlimited || remaining > 0,
                remaining,
                productId: product.id,
                productName: product.name
            };
        } catch (err) {
            console.error('Inventory check exception:', err);
            return { available: false, remaining: 0 };
        }
    },

    /**
     * Get public inventory status for an array of price IDs.
     */
    async getBatchInventory(priceIds: string[]) {
        const results: Record<string, { remaining: number; soldOut: boolean }> = {};

        // This could be optimized into a single complex query, but loop is fine for < 20 items.
        // Parallelizing for speed.
        await Promise.all(priceIds.map(async (id) => {
            const status = await this.checkAvailability(id);
            results[id] = {
                remaining: status.remaining,
                soldOut: !status.available
            };
        }));

        return results;
    }
};
