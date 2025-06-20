'use client'
import { ArrowUp } from "lucide-react"
import ChatBubble from "../chat-bubble/ChatBubble";
import { useHero } from "./hooks";

const Hero = () => {

  const {
    textareaRef,
    query,
    messages,
    isFirstLoad,
    isLoading,
    handleInput,
    handleKeyDown
  } = useHero();

  return (
    <div className="h-screen flex flex-col items-center justify-between">
      <h1 className="w-full text-center border-b border-b-[#e7e7e7] font-bold text-theme text-2xl p-3">bchainAI</h1>
      {!isFirstLoad && (
        <section className={`flex-1 overflow-y-auto w-full flex flex-col items-center justify-start px-1`}>
          <section className="w-full flex items-center justify-center px-3 md:max-w-[780px]">
            <section className="mb-20 mt-2 w-full">
              {messages.map((message, index) => (
                <div key={index} className={`${message.isUser ? 'justify-end' : 'justify-start'} flex items-center w-full mt-5`}>
                  <ChatBubble messages={message} delay={10} />
                </div>
              ))}
            </section>
          </section>
        </section>
      )}
      {isFirstLoad && (
          <div className="ball h-56 w-56"></div>
      )}
      <div className="px-3 pb-8 flex items-center justify-center w-full">
        <div
          className="shadow-sm relative pb-12 p-5 bg-[#FBFCFF] border-[#ededed] border -mt-5
        w-full max-w-[740px] rounded-[24px] min-h-[90px] focus:outline-0 text-sm placeholder:text-sm"
        >
          <textarea
            ref={textareaRef}
            // disabled={isLoading}
            onInput={handleInput}
            value={query}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask bChain"
            className="outline-none focus:outline-none min-h-[30px] resize-none overflow-hidden text-[16px] transition-all duration-200  w-full bg-transparent placeholder:text-[#a3a3a3]"
          />
          <button
            className="inline-flex absolute right-3 bottom-3 gap-2 border bg-primary rounded-full hover:bg-white hover:shadow-md transition-all p-1 items-center text-sm font-medium"
          >
            <ArrowUp size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero