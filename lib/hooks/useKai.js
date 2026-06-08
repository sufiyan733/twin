import { useState } from 'react';

export function useKai() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const sendMessage = async (userText) => {
        if (!userText || !userText.trim()) return;

        const newUserMessage = { role: 'user', content: userText };
        const updatedMessages = [...messages, newUserMessage];

        setMessages(updatedMessages);
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/kai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: updatedMessages,
                    userQuery: userText
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to communicate with Kai.');
            }

            const data = await response.json();
            
            setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } catch (err) {
            console.error('Error in sendMessage:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setMessages([]);
        setError(null);
    };

    return {
        messages,
        loading,
        error,
        sendMessage,
        reset
    };
}
