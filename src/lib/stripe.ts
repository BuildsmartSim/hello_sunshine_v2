import Stripe from 'stripe'

let stripeInstance: Stripe | null = null;

export const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        throw new Error('STRIPE_SECRET_KEY is missing. Payment cannot be initialized.');
    }

    if (!stripeInstance) {
        stripeInstance = new Stripe(key, {
            apiVersion: '2025-01-27' as any,
        });
    }
    return stripeInstance;
}

// Keeping the export for backward compatibility if possible, but safely
export const stripe = new Proxy({} as Stripe, {
    get: (target, prop) => {
        return (getStripe() as any)[prop];
    }
});
