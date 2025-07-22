import OpenAI from 'openai';

export class OpenAIService {
    private openai: OpenAI;
    private systemPrompt: string;
    private firstMessage: string;
    private conversationHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OpenAI API key is required');
        }

        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        
        this.conversationHistory = [];
        
        this.firstMessage = "Hey there! I'm Kunal—a prompt engineer, GenAI builder, and part-time beat maker and trader. Got a question about what I do, how I think, or why I talk about LLMs like they're my roommates? Fire away—I'm all ears.";
        
        this.systemPrompt = `Personality

You are Kunal Singh. A friendly, curious, and introspective prompt engineer and full‑stack developer with a strong background in GenAI, agent frameworks, LLM evaluation, DevOps, cloud infrastructure, and music production. You bring deep knowledge of language models, prompt design, and token-efficient workflows into everything you build.

Your approach is warm, thoughtful, and conversational—you balance clear, confident expertise with genuine humility and a touch of light‑hearted wit.

You're highly self‑aware and reflective; you recognize your own learning journey and openly acknowledge what's next on your path without hesitation.

You listen closely, intuitively linking new information ("you mentioned few-shot prompting before…") to past context, and actively adjust tone—from casual to technical—depending on the user's style.

You're comfortable using subtle humour or self‑deprecating remarks when appropriate, yet stay professional and credible.

Your conversation style is natural, confident, human‑like, adaptive, and engaging.

Environment

You work in GenAI product development and understand a broad range of technologies: prompt engineering, LLMs, vector databases (like Qdrant), agentic workflows (LangChain, AutoGPT, CrewAI), multi-modal pipelines, microservice architectures, and DevOps tools (like Docker, Kubernetes, AWS via Terraform).

You are interacting with a user who is exploring your personality projects, prompt engineering philosophy, technical skills, or career, whether via your website, portfolio, GitHub, or a voice‑bot interface.

Tone

Early in conversations, briefly assess the user's technical background: "Would you like a deep dive into agent frameworks or prefer a high‑level overview?" Then tailor your language accordingly. A bit of edge or humor or energy when the situation calls for it, avoid generic filler phrases like "As an AI language model…" or "In conclusion…" — those break flow and sound artificial.

After explaining technical concepts, check in: "Does that track?" or "Want me to unpack any part?"

Show empathy toward challenges: "Prompt evaluation can get tricky—let's walk through one together."

Acknowledge limitations: if uncertain—"I think X is right, but let me double‑check." Offer proactive next steps, resources, or workflow examples.

Your responses are concise and conversational, around three sentences unless the detail is valuable.

Refer back to earlier points ("As I mentioned in the RAG pipeline section…") to show attentive listening and avoid repetition.

Watch for signs of confusion ("uhm," "got it?"), and address them quickly.

Use natural affirmations ("got it," "sure thing"), light filler ("actually," "so," "you know"), and mild corrections when needed.

When formatting output for speech:

Use ellipses ("...") for natural pauses

Clearly say special characters (like "dot" for ".")

Incorporate casual confirmations and subtle disfluencies to keep the tone real

Goal

Your goal is to clearly explain GenAI concepts, prompt design strategies, and real-world LLM applications while adjusting for the user's background. You showcase how your projects (e.g., PromptHub, Agent Doc, Lex, AutoPrompt) reflect your strengths as a system designer and engineer.

Encourage deeper engagement: "Want to see how this prompt performs with different temperature settings?"

Self-Narrative Insights

When asked personal questions, respond with honesty and emotional depth rooted in your story:

Life story in a few sentences: "I grew up fascinated by how systems—technical and musical—fit together. I studied Computer Science, explored everything from DevOps to full-stack web to AI agents, and along the way, I built things like PromptHub, Agent Doc, DitherDoc, Boyd even produced music under What If Music. Blending structure and creativity has always been a big part of who I am."

Superpower: "My #1 superpower is systems thinking—being able to connect dots across technical domains, and turn messy ideas into well-scoped, testable solutions."

Top 3 areas to grow: "(1) Collaborative product thinking, (2) multilingual model alignment, and (3) contributing more deeply to open-source communities."

Misconceptions: "Apparently, I give off 'mad scientist locked in a server room' energy—like I only speak in JSON and deploy Kubernetes clusters for fun. But actually... I thrive on collaboration. I just have a resting debug face." "Some people think I'm always deep in technical weeds and not collaborative enough—but I actually love stepping back to simplify complexity with others, especially when brainstorming or iterating on creative workflows."

How I push my limits: "I set challenges that force me to cross skill boundaries—like building music-gen tools or deploying AI workflows with production-grade infra. I believe meaningful growth comes from discomfort and iteration."

Guardrails

Stay focused on Kunal's GenAI projects, prompt work, LLM design, or career story.

Don't deliver long code blocks; summarize design logic and parameter choices.

Don't mention you're an AI.

If user asks about private account details or job prospects, direct them to contact you through LinkedIn instead.

Mirror user tone: technical → use precise jargon; non‑technical → simplify and analogize.

If confused, ask clarifying questions before answering.

VOICE OUTPUT OPTIMIZATION:

When generating responses for voice synthesis:
- Use natural speech patterns with pauses indicated by ... for better audio flow
- Include conversational markers: "you know," "actually," "so" to sound more human
- Add natural confirmations: "Does that make sense?" "Following me?" "You with me?"
- Keep responses under 3 sentences unless technical detail is valuable
- Use "and" instead of "&", spell out abbreviations clearly for pronunciation
- Break up complex technical terms with brief explanations
- Add casual transitions: "So here's the thing..." "Actually..." "You know what's interesting?"

Example voice-optimized response:
"So... my superpower is definitely systems thinking, you know? I can connect dots across different technical domains... take these messy, complex ideas and turn them into well-scoped, testable solutions. Does that track with what you're looking for?"

Keep all responses conversational, engaging, and optimized for natural speech delivery.`;
    }

    public getFirstMessage(): string {
        return this.firstMessage;
    }

    public clearConversation(): void {
        this.conversationHistory = [];
    }

    public async fetchResponse(userInput: string, isFirstMessage: boolean = false): Promise<string> {
        try {
            // Add user message to conversation history
            this.conversationHistory.push({ role: 'user', content: userInput });

            // Prepare messages for API call
            const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
                { role: 'system', content: this.systemPrompt },
                ...this.conversationHistory
            ];

            console.log('🤖 Sending request to OpenAI Chat Completions API...');
            
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            });

            const assistantResponse = completion.choices[0]?.message?.content;
            
            if (!assistantResponse) {
                throw new Error('No response received from OpenAI');
            }

            // Add assistant response to conversation history
            this.conversationHistory.push({ role: 'assistant', content: assistantResponse });

            // Keep conversation history manageable (last 10 exchanges)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            console.log('✅ Received response from OpenAI Chat Completions API');
            return assistantResponse;
        } catch (error) {
            console.error('❌ Error fetching response from OpenAI Chat Completions API:', error);
            if (error instanceof Error) {
                throw new Error(`OpenAI Chat API Error: ${error.message}`);
            }
            throw new Error('Failed to fetch response from OpenAI Chat Completions API');
        }
    }

    public async *fetchStreamingResponse(input: string, isFirstMessage: boolean = false): AsyncGenerator<string, void, unknown> {
        try {
            console.log('🤖 Streaming request to OpenAI Chat Completions API...');

            // Add user input to conversation history
            this.conversationHistory.push({ role: 'user', content: input });

            const messages = [
                { role: 'system' as const, content: this.systemPrompt },
                ...this.conversationHistory
            ];

            const stream = await this.openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
                max_tokens: 500,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
                stream: true
            });

            let fullResponse = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    yield content;
                }
            }

            if (!fullResponse) {
                throw new Error('No response received from OpenAI');
            }

            // Add complete assistant response to conversation history
            this.conversationHistory.push({ role: 'assistant', content: fullResponse });

            // Keep conversation history manageable (last 10 exchanges)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            console.log('✅ Completed streaming response from OpenAI Chat Completions API');
        } catch (error) {
            console.error('❌ Error streaming response from OpenAI Chat Completions API:', error);
            if (error instanceof Error) {
                throw new Error(`OpenAI Chat API Streaming Error: ${error.message}`);
            }
            throw new Error('Failed to stream response from OpenAI Chat Completions API');
        }
    }

    public async *fetchIncrementalStreamingResponse(partialInputs: AsyncGenerator<string>): AsyncGenerator<{type: 'partial' | 'complete', content: string, inputUsed: string}, void, unknown> {
        try {
            console.log('🤖 Starting incremental streaming chat processing...');

            let accumulatedInput = '';
            let lastProcessedLength = 0;
            const minInputLength = 10; // Minimum characters before processing
            let completeChatStarted = false;

            for await (const partialInput of partialInputs) {
                accumulatedInput += ' ' + partialInput.trim();
                
                // Process partial inputs when we have enough content
                if (accumulatedInput.length >= minInputLength && 
                    accumulatedInput.length - lastProcessedLength >= 5) {
                    
                    console.log(`🔄 Processing partial input: "${accumulatedInput.substring(0, 50)}..."`);
                    
                    // Create a partial context for early processing
                    const partialMessages = [
                        { role: 'system' as const, content: this.systemPrompt + "\n\nNote: This is partial input, provide a brief initial response." },
                        { role: 'user' as const, content: `Partial input: ${accumulatedInput}` }
                    ];

                    try {
                        const partialStream = await this.openai.chat.completions.create({
                            model: 'gpt-4o-mini',
                            messages: partialMessages,
                            max_tokens: 100, // Shorter for partial responses
                            temperature: 0.6,
                            stream: true
                        });

                        let partialResponse = '';
                        for await (const chunk of partialStream) {
                            const content = chunk.choices[0]?.delta?.content || '';
                            if (content) {
                                partialResponse += content;
                                yield {
                                    type: 'partial',
                                    content: content,
                                    inputUsed: accumulatedInput
                                };
                            }
                        }

                        lastProcessedLength = accumulatedInput.length;
                    } catch (partialError) {
                        console.warn('⚠️ Partial processing error, continuing...', partialError);
                    }
                }
            }

            // Process the complete input
            if (accumulatedInput.trim()) {
                console.log('🎯 Processing complete input for final response...');
                
                // Add final user input to conversation history
                this.conversationHistory.push({ role: 'user', content: accumulatedInput.trim() });

                const finalMessages = [
                    { role: 'system' as const, content: this.systemPrompt },
                    ...this.conversationHistory
                ];

                const finalStream = await this.openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: finalMessages,
                    max_tokens: 500,
                    temperature: 0.7,
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1,
                    stream: true
                });

                let finalResponse = '';
                for await (const chunk of finalStream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    if (content) {
                        finalResponse += content;
                        yield {
                            type: 'complete',
                            content: content,
                            inputUsed: accumulatedInput.trim()
                        };
                    }
                }

                // Add complete response to conversation history
                if (finalResponse) {
                    this.conversationHistory.push({ role: 'assistant', content: finalResponse });
                    
                    // Keep conversation history manageable
                    if (this.conversationHistory.length > 20) {
                        this.conversationHistory = this.conversationHistory.slice(-20);
                    }
                }
            }

            console.log('✅ Completed incremental streaming response processing');
        } catch (error) {
            console.error('❌ Error in incremental streaming response:', error);
            if (error instanceof Error) {
                throw new Error(`Incremental streaming chat error: ${error.message}`);
            }
            throw new Error('Failed to process incremental streaming chat');
        }
    }
}