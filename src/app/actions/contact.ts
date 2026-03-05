'use server';

import { resend } from '@/lib/resend';

export async function submitContactForm(formData: { name: string; email: string; message: string }) {
    try {
        if (!process.env.RESEND_API_KEY) {
            console.warn('RESEND_API_KEY is not set. Simulating success.');
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { success: true };
        }

        const { data, error } = await resend.emails.send({
            from: 'Hello Sunshine Contact Form <hello@hellosunshinesauna.com>',
            to: ['info@hellosunshinesauna.com'], // Send to the owners
            replyTo: formData.email,
            subject: `New Visitor Inquiry from ${formData.name}`,
            text: `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
        });

        if (error) {
            console.error('Resend error:', error);
            return { success: false, error: 'Failed to send message. Please try again later.' };
        }

        return { success: true };
    } catch (err: any) {
        console.error('Contact Form error:', err);
        return { success: false, error: 'Internal server error.' };
    }
}
