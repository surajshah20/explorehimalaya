import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react'
import { useStore } from '@/store'
import { aiApi } from '@/lib/api'
import type { ChatMessage } from '@/types'

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isBot = msg.role === 'assistant'

  return (
    <motion.div
      className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {isBot && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-summit-500 to-alpine-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isBot
            ? 'bg-white/6 border border-white/8 text-white/80 rounded-tl-sm'
            : 'bg-gradient-to-br from-summit-500 to-alpine-600 text-white rounded-tr-sm'
        }`}
      >
        {msg.content}
      </div>

      {!isBot && (
        <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
          <User className="w-3.5 h-3.5 text-white/60" />
        </div>
      )}
    </motion.div>
  )
}

const QUICK_PROMPTS = [
  "Best trek for beginners?",
  "What's the EBC route like?",
  "Budget-friendly options?",
  "Best month to trek?",
]

export default function AIAssistant() {
  const { isChatOpen, toggleChat, chatMessages, addMessage, clearChat } = useStore()
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isChatOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 300)

      // Greet on first open
      if (chatMessages.length === 0) {
        const greeting: ChatMessage = {
          id: 'greeting',
          role: 'assistant',
          content: "Namaste! 🏔️ I'm your AI trekking guide. I can help you find the perfect Nepal adventure, plan your itinerary, or answer questions about permits and preparation. What are you looking for?",
          timestamp: new Date(),
        }
        addMessage(greeting)
      }
    }
  }, [isChatOpen])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  async function handleSend(text?: string) {
    const message = text || input.trim()
    if (!message) return

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    addMessage(userMsg)
    setInput('')
    setIsTyping(true)

    try {
      const response = await aiApi.chat(message)
      const botMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      addMessage(botMsg)
    } catch {
      addMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble connecting. Please try again.',
        timestamp: new Date(),
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* FAB */}
      <motion.button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-glass-lg
                    flex items-center justify-center transition-all duration-300
                    ${isChatOpen
                      ? 'bg-white/10 border border-white/15'
                      : 'bg-gradient-to-br from-summit-500 to-alpine-600 shadow-summit animate-pulse-glow'
                    }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle AI guide"
      >
        <AnimatePresence mode="wait">
          {isChatOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)]
                       glass-card-lg overflow-hidden flex flex-col"
            style={{ height: '520px' }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/8 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-summit-500 to-alpine-600 flex items-center justify-center shadow-summit">
                <Bot className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-semibold text-sm text-white">AI Trek Guide</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-alpine-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-white/40">Powered by ExploreHimalaya AI</p>
              </div>
              <button
                onClick={clearChat}
                className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  className="flex gap-2.5 justify-start"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-summit-500 to-alpine-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white/6 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-summit-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={endRef} />
            </div>

            {/* Quick prompts */}
            {chatMessages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="px-3 py-1.5 text-xs rounded-full border border-white/10 text-white/50
                               hover:border-summit-500/40 hover:text-summit-300 hover:bg-summit-500/8
                               transition-all duration-200"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-white/8 flex-shrink-0">
              <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 px-3 py-2
                              focus-within:border-summit-500/40 focus-within:bg-white/8 transition-all">
                <MessageSquare className="w-4 h-4 text-white/30 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask about any trek..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-7 h-7 rounded-lg bg-summit-500 flex items-center justify-center
                             disabled:opacity-30 hover:bg-summit-400 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
