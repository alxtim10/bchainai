import { Fragment, useEffect, useRef, useState } from "react";
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Volume2 } from "lucide-react";
import { Tooltip } from 'react-tooltip'
import Loading from "../loading/Loading";
import { MessageType } from "../hero/hooks";
import { speakText } from "@/lib/speech";

interface ChatBubbleProps {
    messages: MessageType,
    delay: number,
    // handleRetry: any
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ messages, delay = 10 }: ChatBubbleProps) => {

    const [htmlContent, setHtmlContent] = useState<any>('');

    useEffect(() => {
        setHtmlContent('')

        const html = messages.text;
        const tokens = html.split(/(\s+|<[^>]+>)/).filter(Boolean);
        let index = 0;
        let accumulated = '';

        const interval = setInterval(() => {
            accumulated += tokens[index];
            setHtmlContent(accumulated);
            index++;
            if (index >= tokens.length) {
                clearInterval(interval);
            }
        }, delay)
    }, [messages.text, delay])

    const contentRef = useRef<HTMLDivElement>(null);

    const handleCopy = () => {
        if (contentRef.current) {
            const clone = contentRef.current.cloneNode(true) as HTMLElement;

            // Helper function to recursively build plain text with formatting
            const getTextWithFormatting = (node: Node): string => {
                let text = '';

                node.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        text += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        const el = child as HTMLElement;

                        if (el.tagName === 'BR') {
                            text += '\n';
                        } else if (el.tagName === 'LI') {
                            text += '• ' + getTextWithFormatting(el) + '\n';
                        } else if (el.tagName === 'UL' || el.tagName === 'OL') {
                            // Just recurse children without extra newlines here,
                            // li's will handle bullets + line breaks
                            text += getTextWithFormatting(el);
                        } else if (
                            ['P', 'DIV', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER'].includes(el.tagName)
                        ) {
                            // Block elements - add line breaks before and after
                            text += '\n' + getTextWithFormatting(el) + '\n';
                        } else {
                            // Inline or other elements - just recurse
                            text += getTextWithFormatting(el);
                        }
                    }
                });

                return text;
            };

            const plainText = getTextWithFormatting(clone).replace(/\n{3,}/g, '\n\n').trim();

            // navigator.clipboard.writeText(plainText)
            //     .then(() => toast('Berhasil disalin.', {
            //         style: {
            //             bottom: '20px'
            //         }
            //     }))
            //     .catch(err => console.error('Failed to copy:', err));


        }
    };



    return (
        <Fragment>
            {!messages.isUser && !messages.isLoading && (
                <div
                    className={`rounded-2xl leading-relaxed h-fit text-black`}>
                    <div ref={contentRef} className='chat-html !text-[16px] leading-relaxed text-black
             [&_ul]:list-disc [&_ul]:pl-5
             [&_li]:list-item [&_li]:ml-3'
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                    <div className="flex items-center gap-1 mt-2">
                        <div data-tooltip-id="copy-tooltip"
                            data-tooltip-content="Copy"
                            data-tooltip-place="bottom-end"
                            className="hover:bg-gray-100 py-1 px-2 rounded-lg cursor-pointer"
                            onClick={() => {
                                handleCopy()
                            }}
                        >
                            <Copy

                                className="w-4" />
                        </div>
                        <Tooltip id="copy-tooltip" style={{
                            fontSize: '12px',
                            padding: '8px'
                        }} />
                        <div data-tooltip-id="retry-tooltip"
                            data-tooltip-content="Retry"
                            data-tooltip-place="bottom-start"
                            className="hover:bg-gray-100 py-1 px-2 rounded-lg  cursor-pointer"
                            onClick={() => {
                                // handleRetry(messages.id)
                            }}
                        >
                            <RefreshCw
                                className="w-[17px]" />
                        </div>
                        <Tooltip id="retry-tooltip" style={{
                            fontSize: '12px',
                            padding: '8px'
                        }} />
                        <div data-tooltip-id="listen-tooltip"
                            data-tooltip-content="Listen"
                            data-tooltip-place="bottom-start"
                            className="hover:bg-gray-100 py-1 px-2 rounded-lg  cursor-pointer"
                            onClick={() => {
                                speakText(messages.text)
                            }}
                        >
                            <Volume2
                                className="w-[17px]" />
                        </div>
                        <Tooltip id="listen-tooltip" style={{
                            fontSize: '12px',
                            padding: '8px'
                        }} />
                    </div>
                </div>
            )}
            {!messages.isUser && messages.isLoading && (
                <Loading />
            )}
            {messages.isUser && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`bg-gradient-to-br from-[#57aee0] to-theme text-white py-3 px-4 text-[16px] max-w-[300px] md:max-w-[420px] rounded-b-2xl rounded-tl-2xl  flex flex-wrap gap-x-1`}>
                    <>
                        {messages.text}
                    </>
                </motion.div>
            )}
        </Fragment>
    )
};

export default ChatBubble;
