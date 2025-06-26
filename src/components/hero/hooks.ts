import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

export interface MessageType {
    id: number;
    text: string;
    isUser: boolean;
    isLoading?: boolean;
}

interface ApiResponse {
    output: string;
    error?: string;
}

export interface MessagePart {
    text: string
}

export interface ChatMessage {
    role: string;
    parts: MessagePart[];
}

export const useHero = () => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [tempMessages, setTempMessages] = useState<ChatMessage[]>([]);
    const [query, setQuery] = useState<string>("");
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>();
    const [canDismiss, setCanDismiss] = useState<boolean>(false);

    const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
        setQuery(e.target.value);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && query !== "") {
            e.preventDefault();
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = "30px";
            }
            handleGetPrompt();
        }
    };

    const handleGetPrompt = async (suggestion?: string) => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.style.height = "30px";
            }
            textareaRef.current.blur();
        }
        setIsFirstLoad(false);
        setIsLoading(true);
        const userMessage: MessageType = {
            id: messages.length + 1,
            isUser: true,
            text: suggestion ? suggestion : query,
        };

        const loadingMessage: MessageType = {
            id: messages.length + 2,
            isUser: false,
            text: "...",
            isLoading: true,
        };
        const newUserMessage: ChatMessage = {role: 'user', parts: [{text: query}]};
        const updatedMessages = [...tempMessages, newUserMessage]
        
        setMessages((prev) => [...prev, userMessage, loadingMessage]);
        setTempMessages(updatedMessages);
        setQuery("");

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: query, history: tempMessages }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong!");
            }

            if (data.output) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === loadingMessage.id
                            ? { ...m, text: data.output, isLoading: false }
                            : m
                    )
                );
                const modelResponse: ChatMessage = { role: 'model', parts: [{text: data.output}]};
                setTempMessages([...updatedMessages, modelResponse]);
            }
        } catch (err: any) {
            console.error("API Error:", err.message || err);
            setIsLoading(false);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === loadingMessage.id
                        ? { ...m, text: "Something went wrong.", isLoading: false, isError: true }
                        : m
                )
            );
            setTempMessages(currentMessages => currentMessages.filter((_, index) => index < currentMessages.length - 1));
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = async (id: number) => {
        const lastUserMessage = [...messages].find(m => m.id === id - 1);
        const lastBotMessage = [...messages].find(m => m.id === id);

        if (!lastUserMessage || !lastBotMessage) return;
        setIsLoading(true);

        setMessages(prev =>
            prev.map((m, i) =>
                m.id === lastBotMessage.id
                    ? {
                        ...m,
                        isLoading: true,
                    }
                    : m
            )
        );

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: lastUserMessage.text }),
            });

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong!");
            }

            if (data.output) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === lastBotMessage.id
                            ? { ...m, text: data.output, isLoading: false }
                            : m
                    )
                );
            }
        } catch (err: any) {
            console.error("API Error:", err.message || err);
            setIsLoading(false);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === lastBotMessage.id
                        ? { ...m, text: "Something went wrong.", isLoading: false, isError: true }
                        : m
                )
            );
        } finally {
            setIsLoading(false);
        }
    }



    return {
        textareaRef,
        query,
        messages,
        isFirstLoad,
        isLoading,
        handleInput,
        handleKeyDown,
        handleRetry
    }
}