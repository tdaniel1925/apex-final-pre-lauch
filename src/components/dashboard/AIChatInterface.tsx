'use client';

// =============================================
// AI Chat Interface Component
// Conversational AI assistant for dashboard tasks
// TEST VERSION - Hidden page for prototype testing
// =============================================

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MermaidDiagram from '@/components/MermaidDiagram';
import { Mic, MicOff } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PreviewModal {
  isOpen: boolean;
  url: string;
}

// Custom markdown renderer with video/audio/iframe support
function MarkdownMessage({ content, isUser }: { content: string; isUser: boolean }) {
  // Detect video URLs (YouTube, Vimeo, etc.)
  const videoRegex = /\[video:([^\]]+)\]/g;
  const audioRegex = /\[audio:([^\]]+)\]/g;
  const iframeRegex = /\[(?:preview|iframe):([^\]]+)\]/g;

  let processedContent = content;
  const mediaElements: React.ReactElement[] = [];

  // Extract and process video embeds
  let videoMatch;
  while ((videoMatch = videoRegex.exec(content)) !== null) {
    const videoUrl = videoMatch[1];
    const videoId = extractVideoId(videoUrl);

    if (videoId) {
      const embedUrl = getYouTubeEmbedUrl(videoId);
      mediaElements.push(
        <div key={`video-${videoMatch.index}`} className="my-3">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={embedUrl}
              title="Video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
    processedContent = processedContent.replace(videoMatch[0], `\n\n__VIDEO_${videoMatch.index}__\n\n`);
  }

  // Extract and process audio embeds
  let audioMatch;
  while ((audioMatch = audioRegex.exec(content)) !== null) {
    const audioUrl = audioMatch[1];
    mediaElements.push(
      <div key={`audio-${audioMatch.index}`} className="my-3">
        <audio controls className="w-full rounded-lg">
          <source src={audioUrl} />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
    processedContent = processedContent.replace(audioMatch[0], `\n\n__AUDIO_${audioMatch.index}__\n\n`);
  }

  // Extract and process iframe/preview embeds
  let iframeMatch;
  while ((iframeMatch = iframeRegex.exec(content)) !== null) {
    const iframeUrl = iframeMatch[1];
    mediaElements.push(
      <div key={`iframe-${iframeMatch.index}`} className="my-3">
        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-300"
            src={iframeUrl}
            title="Preview"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
    processedContent = processedContent.replace(iframeMatch[0], `\n\n__IFRAME_${iframeMatch.index}__\n\n`);
  }

  return (
    <div className={`markdown-content ${isUser ? 'text-white' : 'text-gray-900'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom heading styles
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-2" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold my-2" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,

          // Custom list styles
          ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1" {...props} />,

          // Custom link styles
          a: ({node, ...props}) => (
            <a
              className={`underline ${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),

          // Custom code styles with Mermaid diagram support
          code: ({node, ...props}: any) => {
            const inline = !(props.className && props.className.includes('language-'));
            const isMermaid = props.className && props.className.includes('language-mermaid');

            // Render Mermaid diagrams
            if (isMermaid && props.children) {
              const chart = String(props.children).trim();
              return <MermaidDiagram chart={chart} className="my-4" />;
            }

            // Regular code blocks
            return inline ?
              <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-700' : 'bg-gray-200'}`} {...props} /> :
              <code className={`block px-3 py-2 rounded my-2 ${isUser ? 'bg-blue-700' : 'bg-gray-200'}`} {...props} />;
          },

          // Custom paragraph styles
          p: ({node, ...props}) => {
            const text = (props.children as any)?.toString() || '';
            // Check if this is a placeholder for media
            if (text.includes('__VIDEO_') || text.includes('__AUDIO_') || text.includes('__IFRAME_')) {
              const index = parseInt(text.match(/\d+/)?.[0] || '0');
              return mediaElements.find(el => el.key?.toString().includes(index.toString())) || null;
            }
            return <p className="my-1" {...props} />;
          },

          // Custom table styles
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-2">
              <table className={`min-w-full border ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />
            </div>
          ),
          th: ({node, ...props}) => (
            <th className={`border px-2 py-1 ${isUser ? 'border-blue-400 bg-blue-700' : 'border-gray-300 bg-gray-100'}`} {...props} />
          ),
          td: ({node, ...props}) => (
            <td className={`border px-2 py-1 ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />
          ),

          // Custom blockquote styles
          blockquote: ({node, ...props}) => (
            <blockquote className={`border-l-4 pl-4 my-2 italic ${isUser ? 'border-blue-400' : 'border-gray-400'}`} {...props} />
          ),

          // Custom strong/bold styles
          strong: ({node, ...props}) => <strong className="font-bold" {...props} />,

          // Custom em/italic styles
          em: ({node, ...props}) => <em className="italic" {...props} />,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

// Helper functions for video processing
function extractVideoId(url: string): string | null {
  // YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

// Generate personalized greeting
function generateGreeting(context?: {
  firstName: string;
  currentRank: string;
  personalBV: number;
  teamCount: number;
  monthlyCommissions: number;
  recentJoins: number;
  nextRank: string | null;
  personalProgress: number;
}): string {
  if (!context) {
    return "👋 Hi! I'm your Apex AI Assistant. I can help you with:\n\n• Creating meeting registration pages\n• Sending invitations to your team\n• Viewing your team stats\n• Checking your commission balance\n• Generating marketing materials\n\nWhat would you like to do?";
  }

  const { firstName, currentRank, personalBV, teamCount, monthlyCommissions, recentJoins, nextRank, personalProgress } = context;

  let greeting = `👋 **Hey ${firstName}!** Welcome back!\n\n`;

  // Quick status
  greeting += `**Quick Status:**\n`;
  greeting += `• Rank: ${currentRank.toUpperCase()}\n`;
  greeting += `• Personal BV: ${personalBV} this month\n`;
  greeting += `• Team Size: ${teamCount} members\n`;
  greeting += `• Earned: $${(monthlyCommissions / 100).toFixed(2)} this month\n\n`;

  // Proactive insights
  const insights = [];

  if (nextRank && personalProgress >= 70) {
    insights.push(`🎯 You're ${personalProgress}% to ${nextRank}! So close!`);
  } else if (nextRank && personalProgress >= 40) {
    insights.push(`📈 Halfway to ${nextRank} (${personalProgress}% complete)`);
  }

  if (recentJoins > 0) {
    insights.push(`🎉 ${recentJoins} ${recentJoins === 1 ? 'person' : 'people'} joined your team this week`);
  }

  if (teamCount >= 10 && personalBV < 500) {
    insights.push(`💡 You have ${teamCount} team members but only ${personalBV} personal BV - focus on personal sales!`);
  }

  if (insights.length > 0) {
    greeting += `**💡 Insights:**\n`;
    insights.forEach(insight => greeting += `${insight}\n`);
    greeting += `\n`;
  }

  // What I can help with
  greeting += `**What can I help with?**\n`;
  greeting += `• "Who are my top performers?"\n`;
  greeting += `• "How close am I to ${nextRank || 'the next rank'}?"\n`;
  greeting += `• "Show my commission breakdown"\n`;
  greeting += `• "Create a meeting registration page"\n`;
  greeting += `• "Check if this post is compliant"\n\n`;

  greeting += `Just ask me anything! 😊`;

  return greeting;
}

interface AIChatInterfaceProps {
  initialContext?: {
    firstName: string;
    currentRank: string;
    personalBV: number;
    teamCount: number;
    monthlyCommissions: number;
    recentJoins: number;
    nextRank: string | null;
    personalProgress: number;
  };
  onClose?: () => void;
  isModal?: boolean;
}

export default function AIChatInterface({ initialContext, onClose, isModal = false }: AIChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: generateGreeting(initialContext),
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState<PreviewModal>({ isOpen: false, url: '' });
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    console.log('🎤 Initializing Web Speech API...');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('🎤 SpeechRecognition available:', !!SpeechRecognition);
    setIsSpeechSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      console.log('✅ Setting up speech recognition...');
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        console.log('✅ Speech recognized:', event.results[0][0].transcript);
        const transcript = event.results[0][0].transcript;
        // Append to input value
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log('🛑 Speech recognition ended');
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      console.log('✅ Speech recognition setup complete');
    } else {
      console.warn('⚠️ Web Speech API not supported in this browser');
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await fetch('/api/dashboard/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure session cookies are sent
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.error) {
        // Special handling for auth errors
        const errorMessage = data.error === 'Unauthorized'
          ? '🔒 Session expired. Please refresh the page to log in again.'
          : `❌ Error: ${data.error}`;

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: errorMessage,
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.message,
            timestamp: new Date(),
          },
        ]);

        // Handle special actions
        if (data.data?.action === 'open_url' && data.data?.url) {
          // Open URL in modal instead of new tab
          setPreviewModal({ isOpen: true, url: data.data.url });
        }
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle microphone click
  const handleVoiceInput = () => {
    console.log('🎤 Microphone button clicked!');
    console.log('🎤 Speech supported:', isSpeechSupported);
    console.log('🎤 Recognition ref:', recognitionRef.current);
    console.log('🎤 Currently recording:', isRecording);

    if (!recognitionRef.current) {
      console.error('❌ No speech recognition available');
      return;
    }

    try {
      if (isRecording) {
        console.log('🛑 Stopping recording...');
        recognitionRef.current.stop();
      } else {
        console.log('▶️ Starting recording...');
        recognitionRef.current.start();
        setIsRecording(true);
      }
    } catch (error) {
      console.error('❌ Speech recognition error:', error);
    }
  };

  // Wrapper: Full-page modal if isModal, otherwise embedded
  const Wrapper = isModal ? 'div' : 'div';
  const wrapperClass = isModal
    ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fadeIn'
    : '';

  return (
    <div className={wrapperClass}>
      {/* Main Chat Container */}
      <div className={isModal ? 'fixed inset-0 md:inset-4 lg:inset-8 xl:inset-16 flex flex-col bg-white md:rounded-2xl shadow-2xl animate-slideUp' : 'flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg shadow-lg'}>
        {/* Modern Header */}
        <div className="relative px-4 md:px-6 py-4 md:py-5 border-b border-gray-200/80 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
          <div className="flex items-center justify-between">
            {/* Left: AI Branding */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <div className="text-2xl">✨</div>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Apex AI</h2>
                <div className="flex items-center gap-1.5 text-xs text-blue-100">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Online · Ready to help</span>
                </div>
              </div>
            </div>

            {/* Right: Close Button (if modal) */}
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group"
                aria-label="Close chat"
              >
                <svg className="w-6 h-6 text-white group-hover:text-blue-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

      {/* Messages Area - Optimized for Mobile */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 md:px-5 py-3 md:py-3.5 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}
            >
              {/* Avatar for Assistant */}
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs">
                    ✨
                  </div>
                  <span className="text-xs font-medium text-gray-600">Apex AI</span>
                </div>
              )}

              <MarkdownMessage content={message.content} isUser={message.role === 'user'} />

              <div
                className={`text-[10px] md:text-xs mt-2 flex items-center gap-1.5 ${
                  message.role === 'user' ? 'text-blue-100 justify-end' : 'text-gray-400'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start animate-fadeInUp">
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-xs">
                  ✨
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-1">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modern Input Area - Mobile Optimized */}
      <div className="px-4 md:px-6 py-4 md:py-5 border-t border-gray-200 bg-white">
        <div className="flex gap-2 md:gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything..."
              className="w-full px-4 md:px-5 py-3 md:py-3.5 border-2 border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm md:text-base bg-gray-50 focus:bg-white"
              rows={1}
              disabled={isLoading}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {input.length > 0 && <span>{input.length}</span>}
            </div>
          </div>

          <button
            onClick={handleVoiceInput}
            disabled={!isSpeechSupported || isLoading}
            className="p-3 text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed rounded-2xl hover:bg-gray-100"
            title={!isSpeechSupported ? "Voice input not supported in your browser" : isRecording ? "Stop recording" : "Start voice input"}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5 text-red-500 animate-pulse" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-5 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none flex items-center gap-2 min-w-[48px] justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <>
                <span className="hidden md:inline">Send</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Helper Text */}
        <div className="mt-2 md:mt-3 flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden md:inline">Press Enter to send • Shift+Enter for new line</span>
          <span className="md:hidden">Tap send or press Enter</span>
        </div>
      </div>

      {/* Preview Modal - Modern Design */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
          <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-slideUp">
            {/* Modal Header - Modern Gradient */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/80 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                  <span className="text-xl">👀</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Preview</h3>
                  <p className="text-xs text-blue-100 truncate max-w-md">{previewModal.url}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal({ isOpen: false, url: '' })}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-colors group"
                aria-label="Close preview"
              >
                <svg className="w-6 h-6 text-white group-hover:text-blue-100 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - iframe */}
            <div className="flex-1 overflow-hidden bg-gray-50">
              <iframe
                src={previewModal.url}
                className="w-full h-full border-0"
                title="Registration Page Preview"
              />
            </div>

            {/* Modal Footer - Modern Actions */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
              <p className="text-sm text-gray-600">
                ✨ Share this link to start getting registrations
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(previewModal.url);
                    alert('✅ Link copied to clipboard!');
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
                <button
                  onClick={() => window.open(previewModal.url, '_blank')}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
