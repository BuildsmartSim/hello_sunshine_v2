export async function sendTelegramMessage(token: string, chatId: string, message: string) {
    if (!token || !chatId) {
        console.warn("Telegram bot token or chat ID is missing. Message not sent.");
        return { success: false };
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Telegram API Error: ${response.status} ${response.statusText} - ${errorText}`);
            return { success: false };
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
        return { success: false };
    }
}
