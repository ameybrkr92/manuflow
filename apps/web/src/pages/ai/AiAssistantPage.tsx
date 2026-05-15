import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../api/endpoints';
import { Bot, Send, User, Sparkles, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; }

const QUICK_QUERIES = [
  'Show me all orders delayed by more than 2 weeks',
  'Which invoices are overdue this month?',
  'Give me a morning briefing of today\'s critical items',
  'What is the current order book value?',
  'Which work orders are at risk of delay?',
];

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m ManuFlow AI, powered by Claude. I have full visibility into your orders, production, inventory, and finances. Ask me anything about your manufacturing operations.', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { answer } = await aiApi.query(question, history);
      setMessages(prev => [...prev, { role: 'assistant', content: answer, timestamp: new Date() }]);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Claude API error. Check your ANTHROPIC_API_KEY in .env';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}`, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help?', timestamp: new Date() }]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f1117' }}>
      {/* Header */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={20} color="white" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>ManuFlow AI Assistant</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Powered by Claude · Full visibility into your manufacturing operations</div>
        </div>
        <button onClick={clearChat} className="btn-ghost" style={{ marginLeft: 'auto' }}>
          <RotateCcw size={14} /> Clear
        </button>
      </div>

      {/* Quick queries */}
      <div style={{ padding: '12px 32px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {QUICK_QUERIES.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            style={{
              padding: '6px 12px', borderRadius: 20, fontSize: 12, whiteSpace: 'nowrap',
              background: 'rgba(168,85,247,0.08)', color: '#c084fc', border: '1px solid rgba(168,85,247,0.2)',
              cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(168,85,247,0.08)')}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {messages.map((msg, i) => (
          <div key={i} className="fade-in" style={{ display: 'flex', gap: 12, marginBottom: 20, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={16} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#161b25',
              border: msg.role === 'assistant' ? '1px solid rgba(168,85,247,0.15)' : 'none',
              fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
              <div style={{ fontSize: 10, color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : '#374151', marginTop: 6 }}>
                {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={16} color="#f97316" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="fade-in" style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="white" />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px', background: '#161b25', border: '1px solid rgba(168,85,247,0.15)' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#c084fc',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
                <span style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>Claude is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '16px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', gap: 10, maxWidth: 900 }}>
          <textarea
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask anything about your orders, production, inventory, or finances... (Enter to send)"
            rows={2}
            disabled={loading}
            style={{ resize: 'none', flex: 1, lineHeight: 1.5 }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              width: 48, height: 52, borderRadius: 10, border: 'none',
              background: input.trim() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.05)',
              color: 'white', cursor: input.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'all 0.2s', alignSelf: 'flex-end',
            }}
          >
            <Send size={18} />
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#374151', marginTop: 6 }}>
          ⌨️ Press Enter to send · Shift+Enter for new line · Powered by Claude claude-opus-4-5
        </div>
      </div>
    </div>
  );
}
