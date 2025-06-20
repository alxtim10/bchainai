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

export const useHero = () => {

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
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

        setMessages((prev) => [...prev, userMessage, loadingMessage]);

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: query }),
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
            }
        } catch (err: any) {
            console.log(err.message);
        } finally {
            setQuery("");
            setIsLoading(false);
        }
    };



    return {
        textareaRef,
        query,
        messages,
        isFirstLoad,
        isLoading,
        handleInput,
        handleKeyDown,

    }
}