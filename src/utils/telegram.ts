export async function sendTelegramMessage(message: string) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.warn("Telegram bot token or chat ID is missing. Message not sent.");
        return false;
    }

    try {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
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
            return false;
        }

        return true;
    } catch (error) {
        console.error("Failed to send Telegram message:", error);
        return false;
    }
}
