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
     * Uses a single unified approach to prevent N+1 Queries.
     */
    async getBatchInventory(priceIds: string[]) {
        const results: Record<string, { remaining: number; soldOut: boolean }> = {};

        if (!priceIds || priceIds.length === 0) return results;

        try {
            console.log(`[INVENTORY DEBUG] Batch checking availability for ${priceIds.length} tiers...`);

            // 1. Get all products in one go
            const { data: products, error: productError } = await supabaseAdmin
                .from('products')
                .select('id, stock_limit, name, price_id')
                .in('price_id', priceIds);

            if (productError || !products) {
                console.error(`Batch inventory check failed (Product lookup):`, productError);
                // Return default closed for all
                priceIds.forEach(id => results[id] = { remaining: 0, soldOut: true });
                return results;
            }

            const productIds = products.map((p: any) => p.id);
            if (productIds.length === 0) {
                priceIds.forEach(id => results[id] = { remaining: 0, soldOut: true });
                return results;
            }

            // 2. Count Reserved/Sold Tickets for ALL products in one go
            const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();

            const { data: tickets, error: countError } = await supabaseAdmin
                .from('tickets')
                .select('id, product_id, status, created_at')
                .in('product_id', productIds)
                .or(`status.in.(active,used),and(status.eq.pending,created_at.gte.${fifteenMinsAgo})`);

            if (countError) {
                console.error(`Batch inventory check failed (Ticket count):`, countError);
                priceIds.forEach(id => results[id] = { remaining: 0, soldOut: true });
                return results;
            }

            // 3. Map results
            const countsByProduct = (tickets || []).reduce((acc: any, ticket: any) => {
                acc[ticket.product_id] = (acc[ticket.product_id] || 0) + 1;
                return acc;
            }, {});

            products.forEach((product: any) => {
                const sold = countsByProduct[product.id] || 0;
                const isUnlimited = product.stock_limit === null || product.stock_limit === undefined;
                const remaining = isUnlimited ? 999999 : Math.max(0, product.stock_limit - sold);

                results[product.price_id] = {
                    remaining,
                    soldOut: !isUnlimited && remaining <= 0
                };
            });

            // Fill in any explicitly requested IDs that weren't found in DB as closed
            priceIds.forEach(id => {
                if (!results[id]) results[id] = { remaining: 0, soldOut: true };
            });

            return results;
        } catch (err) {
            console.error('Batch inventory check exception:', err);
            priceIds.forEach(id => results[id] = { remaining: 0, soldOut: true });
            return results;
        }
    }
};
