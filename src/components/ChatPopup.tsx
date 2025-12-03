// src/components/ChatPopup.tsx

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Trash2 } from "lucide-react";
import { formatMarkdownToHtml } from "@/lib/formatMarkdown"; // Import the formatting function

// Define the type for the context prop
type ContextType = {
  businessType: string;
  targetCustomer: string;
  tone: string;
  platform: string;
  productName: string;
  productDescription: string;
  goal: string;
  generatedResults: any; // Or define a more specific type if needed
};

// Define the type for a single message
type Message = {
  role: "user" | "assistant";
  content: string;
};

// Define the type for the full conversation history
type ConversationHistory = {
  context: ContextType; // Store the context snapshot
  messages: Message[];
};

// Key for localStorage
const CHAT_HISTORY_KEY = "ai_marketing_chat_history";

export default function ChatPopup({ onClose, context }: { onClose: () => void; context: ContextType }) {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyId, setHistoryId] = useState<string | null>(null); // Unique ID for the current conversation context
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [initialContext] = useState(context); // Store the initial context when the component mounts

  // --- Load Chat History from localStorage on component mount (only once) ---
  useEffect(() => {
    const loadHistory = () => {
      try {
        const historyString = localStorage.getItem(CHAT_HISTORY_KEY);
        if (!historyString) {
          console.log("No chat history found in localStorage.");
          // Initialize with an empty array if no history exists
          setMessages([]);
          return;
        }

        const history: Record<string, ConversationHistory> = JSON.parse(historyString);

        // Generate a unique ID based on the INITIAL context to find/load relevant history
        const initialContextId = `${initialContext.businessType}-${initialContext.targetCustomer}-${initialContext.productName}`;
        setHistoryId(initialContextId); // Set the ID for this session based on initial context

        const savedConversation = history[initialContextId];
        if (savedConversation) {
          console.log("Loaded chat history from localStorage:", savedConversation);
          setMessages(savedConversation.messages);
        } else {
          console.log("No history found for the initial context ID, starting fresh.");
          // Initialize with an empty array if no history exists for this ID
          setMessages([]);
        }
      } catch (error) {
        console.error("Error loading chat history from localStorage:", error);
        // If loading fails, start with an empty chat
        setMessages([]);
      }
    };

    loadHistory();
  }, [initialContext]); // Depend on the initialContext snapshot, not the potentially changing prop

  // --- Save Chat History to localStorage whenever messages change ---
  useEffect(() => {
    if (historyId) { // Only save if we have a valid history ID
      try {
        // Load existing history to merge/update
        const historyString = localStorage.getItem(CHAT_HISTORY_KEY);
        const history: Record<string, ConversationHistory> = historyString ? JSON.parse(historyString) : {};

        // Update the history for the current context ID
        history[historyId] = {
          context: initialContext, // Save the initial context snapshot associated with this history
          messages: messages,
        };

        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
        console.log("Saved chat history to localStorage for ID:", historyId);
      } catch (error) {
        console.error("Error saving chat history to localStorage:", error);
      }
    }
  }, [messages, initialContext, historyId]); // Depend on initialContext snapshot and historyId

  // Scroll to bottom of messages when they change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Construct the full prompt for the AI, including the context and the new user message
      const fullPrompt = `
        Anda adalah asisten pemasaran AI yang membantu UMKM di Indonesia.
        Sebelumnya, pengguna telah menghasilkan konten marketing berdasarkan informasi berikut:
        - Jenis UMKM: ${initialContext.businessType} // Use the initial context
        - Target Customer: ${initialContext.targetCustomer}
        - Tone yang diinginkan: ${initialContext.tone}
        - Platform yang digunakan: ${initialContext.platform}
        - Nama Produk: ${initialContext.productName}
        - Deskripsi Produk: ${initialContext.productDescription || "Tidak ada deskripsi tambahan."}
        - Tujuan konten: ${initialContext.goal}

        Riwayat percakapan sebelumnya:
        ${messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join("\n")}

        Pertanyaan/Pesan terbaru dari pengguna:
        "${inputMessage}"

        Jawablah pertanyaan pengguna secara langsung dan relevan dengan konteks UMKM dan produk yang telah disebutkan di atas.
      `;

      // Call the same API route used for generation (example uses cerebras)
      const response = await fetch('/api/cerebras', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'gpt-oss-120b', // Use the same model as the main generation
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response from AI");
      }

      const data = await response.json();
      let aiResponse = data.response; // Assuming the API route returns { response: "..." }

      // Attempt to extract JSON if the AI returns it again (e.g., if user asks for changes)
      // This is optional and depends on how the AI responds to follow-up questions
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
          // If JSON is returned, you might want to handle it differently,
          // perhaps display it separately or summarize it in the chat.
          // For now, let's just add the raw text response.
          aiResponse = `AI mengembalikan data JSON baru:\n${jsonMatch[1]}\n\n${aiResponse}`;
      }

      const assistantMessage: Message = { role: "assistant", content: aiResponse };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error in chat:", error);
      const errorMessage: Message = { role: "assistant", content: `Error: ${(error as Error).message}` };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Function to Clear the Current Conversation ---
  const handleClearHistory = () => {
    if (historyId) {
      try {
        const historyString = localStorage.getItem(CHAT_HISTORY_KEY);
        if (historyString) {
          const history: Record<string, ConversationHistory> = JSON.parse(historyString);
          // Remove the history entry for the current context ID
          delete history[historyId];
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
          console.log("Cleared chat history from localStorage for ID:", historyId);
        }
        // Reset the component state to an empty array
        setMessages([]);
        console.log("Cleared chat messages in component state.");
      } catch (error) {
        console.error("Error clearing chat history:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl w-full max-w-md h-[60vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-200">AI Marketing Assistant</h2>
          <div className="flex space-x-2"> {/* Container for buttons */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearHistory}
              className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              aria-label="Clear conversation"
            >
              <Trash2 className="w-5 h-5" /> {/* Use Trash2 icon */}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <p className="text-neutral-500 text-center">Mulai percakapan...</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-yellow-500/20 text-neutral-200 ml-auto"
                    : "bg-neutral-800 text-neutral-200 mr-auto"
                }`}
              >
                {/* Use dangerouslySetInnerHTML to render formatted HTML */}
                <div
                  className="prose prose-sm max-w-none text-neutral-200" // Add Tailwind classes for better typography and max-width
                  dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(msg.content) }}
                />
              </div>
            ))
          )}
          {isLoading && (
            <div className="p-3 rounded-lg bg-neutral-800 text-neutral-200 mr-auto">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800">
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Tanyakan tentang konten Anda..."
              className="bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-neutral-900"
              disabled={!inputMessage.trim() || isLoading}
            >
              Kirim
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}