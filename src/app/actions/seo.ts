'use server';

import { createClient } from '@/utils/supabase/server';
import { getRoleAction } from './tickets';

/**
 * Fetch all saved SEO questionnaire answers from the database.
 * Returns an object keyed by question_key.
 */
export async function getSeoAnswers(): Promise<Record<string, string>> {
    try {
        const roleRes = await getRoleAction();
        // Allow both admin and clerk to read so the text boxes can populate
        if (!roleRes.success) {
            return {};
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('seo_answers')
            .select('question_key, answer');

        if (error) {
            console.error('Error fetching SEO answers:', error);
            return {};
        }

        const answersMap: Record<string, string> = {};
        data?.forEach((row: { question_key: string; answer: string }) => {
            answersMap[row.question_key] = row.answer;
        });

        return answersMap;
    } catch (err) {
        console.error('getSeoAnswers exception:', err);
        return {};
    }
}

/**
 * Upsert an SEO answer for a given question key.
 */
export async function saveSeoAnswer(questionKey: string, answer: string): Promise<boolean> {
    try {
        // Enforce admin or clerk
        const roleRes = await getRoleAction();
        if (!roleRes.success) {
            return false;
        }

        const supabase = await createClient();
        const { error } = await supabase
            .from('seo_answers')
            .upsert(
                {
                    question_key: questionKey,
                    answer: answer
                },
                {
                    onConflict: 'question_key'
                });

        if (error) {
            console.error(`Error saving SEO answer for ${questionKey}:`, error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('saveSeoAnswer exception:', err);
        return false;
    }
}
