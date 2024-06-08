import Groq from 'groq-sdk';

export class GroqService {
    private groq: Groq;
    private model: string;

    constructor(model?: string) {
        this.groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        if (model) {
            this.model = model;
        }
    }

    public getModels = async ()=> {
        return await this.groq.models.list();
    }

    /**
     *
     * @doc - https://console.groq.com/docs/libraries
     * @param prompt
     * @returns
     */
    public async getResponse(prompt: string): Promise<string> {
        const response = await this.groq.chat.completions.create({
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama3-8b-8192'
        });

        return response.choices[0]?.message?.content || '';

    }
}