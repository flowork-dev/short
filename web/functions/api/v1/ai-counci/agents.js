//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\ai-counci\agents.js total lines 76 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * LIBRARY AGENT MODULAR
 * File: functions/api/v1/ai-counci/agents.js
 */

class BaseAgent {
    constructor(env) { this.env = env; }

    async fetchStandard(url, key, model, system, user) {
        if (!key) throw new Error(`${this.name}: API Key Kosong/Limit`);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: [{ role: "system", content: system }, { role: "user", content: user }],
                max_tokens: 500
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "API Error");
        return data.choices[0].message.content;
    }
}

export class GPTAgent extends BaseAgent {
    constructor(env) { super(env); this.id = 'logic'; this.name = "Logic Commander"; }
    async run(sys, user) {
        return this.fetchStandard('https://api.openai.com/v1/chat/completions', this.env.OPENAI_API_KEY, 'gpt-4o-mini', sys, user);
    }
}

export class DeepSeekAgent extends BaseAgent {
    constructor(env) { super(env); this.id = 'tactical'; this.name = "Tactical Analyst"; }
    async run(sys, user) {
        return this.fetchStandard('https://api.deepseek.com/v1/chat/completions', this.env.DEEPSEEK_API_KEY, 'deepseek-chat', sys, user);
    }
}

export class GeminiAgent extends BaseAgent {
    constructor(env) { super(env); this.id = 'creative'; this.name = "Creative Advisor"; }

    async run(sys, user) {
        const key = this.env.GEMINI_API_KEY;
        if (!key) throw new Error("Gemini Key Missing");

        const fullPrompt = `${sys}\n\n---\nDATA USER:\n${user}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: fullPrompt }] }]
            })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.message || "Gemini Error");

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No Response from Gemini";
    }
}

export const AGENT_REGISTRY = {
    'logic': GPTAgent,
    'creative': GeminiAgent,
    'tactical': DeepSeekAgent
};
