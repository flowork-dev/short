//#######################################################################
// WEBSITE https://flowork.cloud
// File NAME : C:\FLOWORK\flowork-gui\template\web\functions\api\v1\ai-counci\process.js total lines 298 
//#1. Dynamic Component Discovery (DCD): Hub wajib melakukan scanning file secara otomatis.
//#2. Lazy Loading: Modul hanya di-import ke RAM saat dipanggil (On-Demand).
//#3. Atomic Isolation: 1 File = 1 Fungsi dengan nama file yang identik dengan nama fungsi aslinya.
//#4. Zero Logic Mutation: Dilarang merubah alur logika, nama variabel, atau struktur if/try/loop.
//#######################################################################

/**
 * [FLOWORK BACKEND WORKER]
 * SECURITY: Requires _tierMiddleware.js
 * PATH: functions/api/v1/ai-counci/process.js
 * VERSION: 6.4 (Sequential Awareness & Enhanced Debate)
 */
import { enforceSmartTiering } from '../_tierMiddleware.js';
import { AGENT_REGISTRY } from './agents.js';

export async function onRequestPost(context) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-User-Address",
        "Content-Type": "application/json"
    };

    if (context.request.method === "OPTIONS") return new Response(null, { headers });

    try {
        const body = await context.request.json();
        const { input, config, moderatorId } = body;

        if (!input) throw { status: 400, message: "Input cannot be empty" };

        let gatekeeperKeyName = 'OPENAI_API_KEY';
        if (moderatorId === 'creative') gatekeeperKeyName = 'GEMINI_API_KEY';
        if (moderatorId === 'tactical') gatekeeperKeyName = 'DEEPSEEK_API_KEY';

        await enforceSmartTiering(context, gatekeeperKeyName, 'COUNCIL_LIMIT');

        const userAddress = context.request.headers.get("X-User-Address");
        const getKey = async (name) => {
            try {
                const res = await context.env.DB.prepare("SELECT value FROM variables WHERE name = ? AND addr = ?")
                    .bind(name, userAddress.toLowerCase()).first();
                return res?.value;
            } catch (e) { return null; }
        };

        const dynamicEnv = {
            ...context.env,
            GEMINI_API_KEY: (await getKey('GEMINI_API_KEY')) || context.env.GEMINI_API_KEY,
            DEEPSEEK_API_KEY: (await getKey('DEEPSEEK_API_KEY')) || context.env.DEEPSEEK_API_KEY,
            OPENAI_API_KEY: (await getKey('OPENAI_API_KEY')) || context.env.OPENAI_API_KEY
        };

        const activeIds = config.activeIds || [];
        const customPrompts = config.prompts || {};
        const results = [];

        const USER_CURRENT_INPUT = input;
        let debateHistory = `INPUT TERBARU USER (FOKUS UTAMA/REVISI): "${USER_CURRENT_INPUT}"\n\n`;

        const ModClass = AGENT_REGISTRY[moderatorId];
        const moderator = ModClass ? new ModClass(dynamicEnv) : null;
        if (!moderator) throw { status: 400, message: "Moderator not found" };

        let lastArgumentContent = "";
        let lastSpeakerName = "USER";

        let earlyStopSignal = null;

        for (const agentId of activeIds) {
            if (earlyStopSignal) break;

            const output = await runAgent(
                agentId,
                "ROUND 1: ANALISA AWAL",
                dynamicEnv,
                customPrompts,
                debateHistory,
                USER_CURRENT_INPUT,
                false, // Not debate mode yet
                null   // No specific target to attack yet
            );

            if (output) {
                results.push(output.resultObj);
                debateHistory += output.historyEntry;

                lastArgumentContent = output.content;
                lastSpeakerName = output.resultObj.name;

                if (output.content.includes("[FLAG: UNCLEAR]")) earlyStopSignal = "UNCLEAR";
                if (output.content.includes("[FLAG: SOLVED]")) earlyStopSignal = "SOLVED";
            }
        }

        let proceedToDebate = true;
        let judgeInstruction = "";

        if (earlyStopSignal === "UNCLEAR") {
            results.push({
                id: 'system', name: `HAKIM (${moderator.name})`, role: 'error',
                content: `🛑 **INTERUPSI:** Dewan AI bingung dengan pertanyaan Anda. \nMohon perjelas pertanyaan agar debat bisa dilanjutkan.`
            });
            proceedToDebate = false;
        }
        else if (activeIds.length > 1) {
            const check = await checkConsensus(moderator, debateHistory, USER_CURRENT_INPUT);

            if (check.status === 'STOP_SOLVED') {
                results.push({
                    id: 'system', name: `HAKIM (${moderator.name})`, role: 'system',
                    content: `🛑 **DEBAT SELESAI:** Solusi sudah solid. Langsung ke putusan.`
                });
                proceedToDebate = false;
            }
            else {
                judgeInstruction = check.reason;
                results.push({
                    id: 'system', name: `HAKIM (${moderator.name})`, role: 'system',
                    content: `⚠️ **ARAHAN HAKIM:**\n"${judgeInstruction}"\n\nLanjutkan debat! Saling lengkapi dan koreksi satu sama lain.`
                });
            }
        }

        if (proceedToDebate && activeIds.length > 1) {
            debateHistory += `\n--- FASE DEBAT (REBUTTAL) ---\nARAHAN HAKIM: ${judgeInstruction}\n`;

            const debateOrder = [...activeIds].reverse();

            for (const agentId of debateOrder) {
                const targetContext = {
                    speaker: lastSpeakerName,
                    content: lastArgumentContent
                };

                const output = await runAgent(
                    agentId,
                    "ROUND 2: DEBAT & SANGGAHAN",
                    dynamicEnv,
                    customPrompts,
                    debateHistory,
                    USER_CURRENT_INPUT,
                    true, // Debate Mode Active
                    targetContext // INJECT TARGET TO FORCE INTERACTION
                );

                if (output) {
                    results.push(output.resultObj);
                    debateHistory += output.historyEntry;

                    lastArgumentContent = output.content;
                    lastSpeakerName = output.resultObj.name;
                }
            }
        }

        const verdictPrompt = `
            PERAN: HAKIM AGUNG / MODERATOR TERTINGGI.

            INPUT TERAKHIR USER: "${USER_CURRENT_INPUT}"
            RIWAYAT DISKUSI:
            ${debateHistory}

            TUGAS FINAL:
            1. Jika tadi berhenti karena "UNCLEAR", minta user tulis ulang pertanyaan.
            2. Jika diskusi berjalan, RANGKUM semua poin (Thesis + Antithesis = Synthesis).
            3. Pastikan jawaban menjawab pertanyaan user TERAKHIR (Revisi) ini.
            4. Gunakan format: **KESIMPULAN**, **DATA FAKTA**, **RENCANA EKSEKUSI**.

            GAYA: Tegas, Pimpinan Sidang, Solutif.
        `;

        try {
            const verdict = await moderator.run(verdictPrompt, debateHistory);
            results.push({
                id: 'system',
                name: `KEPUTUSAN FINAL (${moderator.name})`,
                role: 'verdict',
                content: verdict
            });
        } catch (e) {
            results.push({ id: 'system', name: "SYSTEM", role: 'error', content: `Moderator Gagal: ${e.message}` });
        }

        return new Response(JSON.stringify({ success: true, data: results }), { status: 200, headers });

    } catch (err) {
        let msg = err.message || "Internal Server Error";
        let status = 500;
        if (msg.includes("MISSING_CONFIG")) status = 402;
        return new Response(JSON.stringify({ success: false, message: msg }), { status, headers });
    }
}

async function runAgent(id, phase, env, prompts, historyStr, userQuery, isDebateMode, targetContext) {
    const AgentClass = AGENT_REGISTRY[id];
    if (!AgentClass) return null;

    const agent = new AgentClass(env);

    let specificInstruction = "";

    if (isDebateMode) {
        const provocation = targetContext
            ? `TARGET SANGGAHAN: Barusan si ${targetContext.speaker} bilang: "${targetContext.content.substring(0, 100)}..."`
            : "TARGET SANGGAHAN: Bahas argumen terakhir di history.";

        specificInstruction = `
            MODE DEBAT (SANGGAH/LENGKAPI):
            ${provocation}

            TUGAS LO:
            1. Baca jawaban si ${targetContext ? targetContext.speaker : 'teman lo'} itu.
            2. JANGAN MONOLOG. Referensikan ucapan dia ("Tadi lo bilang X, tapi menurut gue...").
            3. Jika dia SALAH/HALU, serang argumennya dengan data.
            4. Jika dia BENAR tapi KURANG, tambahkan angle yang dia lupa.
            5. Solusi lo harus lebih tajam dari dia.
        `;
    } else {
        const isFollowUpSpeaker = historyStr.length > 200;

        const collaborationInstruction = isFollowUpSpeaker
            ? "PERHATIAN: Lo bukan orang pertama yang jawab. BACA jawaban teman lo di atas (di history)! Jangan cuma ulang poin dia. Lengkapi yang kurang, atau koreksi sopan jika dia salah. Sambunglah omongan dia biar ngalir."
            : "Lo adalah pembicara PERTAMA. Berikan jawaban pembuka yang paling solid dan fondasional.";

        specificInstruction = `
            MODE PENDAPAT (THESIS):
            1. Ini adalah INPUT TERBARU user: "${userQuery}".
            2. ${collaborationInstruction}
            3. Jika pertanyaan ini MASIH GAK JELAS/AMBIGU, tulis persis: "[FLAG: UNCLEAR] Pertanyaan lo gak jelas bro, maksudnya apa?"
            4. Jika pertanyaan jelas, berikan solusi terbaikmu sesuai keahlian (${agent.name}).
        `;
    }

    const sysPrompt = (prompts[id] || `Role: ${agent.name}`) +
                      `\n\nINPUT USER SAAT INI (HARGA MATI): "${userQuery}"\n` +
                      `\nKONTEKS: ${phase}.\n${specificInstruction}\n` +
                      `\nATURAN: Bahasa Indonesia Gaul (Loe/Gue) tapi Cerdas. No HTML tags. Max 250 kata.`;

    try {
        const response = await agent.run(sysPrompt, historyStr);

        return {
            resultObj: {
                id: id,
                name: agent.name,
                role: isDebateMode ? 'debater' : 'debater',
                content: response
            },
            historyEntry: `\n[${agent.name}]: ${response}\n`,
            content: response // Return raw content for flag checking & next loop target
        };
    } catch (e) {
        return {
            resultObj: { id: id, name: agent.name, role: 'error', content: `[SKIP]: ${e.message}` },
            historyEntry: `\n[${agent.name}]: (Gagal/Error)\n`,
            content: "ERROR"
        };
    }
}

async function checkConsensus(moderatorInstance, historyStr, userQuery) {
    const checkPrompt = `
        PERAN: HAKIM PENGAWAS SIDANG.
        TUGAS: Analisa diskusi di bawah ini.
        INPUT USER TERBARU: "${userQuery}"

        ANALISA:
        1. Apakah input user ini masih AMBIGU/GAK JELAS? (Output: UNCLEAR)
        2. Apakah para agent sudah SEPAKAT BULAT dan solusi sudah LENGKAP? (Output: SOLVED)
        3. Apakah masih perlu debat untuk mematangkan ide / saling melengkapi? (Output: CONTINUE)

        JIKA CONTINUE:
        - Berikan instruksi singkat yang MEMICU DEBAT: "Si A bilang X, coba si B bantah bagian Y".

        FORMAT RESPON WAJIB:
        STATUS: [SOLVED / UNCLEAR / CONTINUE]
        ALASAN: [Penjelasan singkat instruksi]
    `;

    try {
        const response = await moderatorInstance.run(checkPrompt, historyStr);

        if (response.includes("STATUS: SOLVED")) {
            return { status: 'STOP_SOLVED', reason: "Consensus reached." };
        }
        else if (response.includes("STATUS: UNCLEAR")) {
            return { status: 'STOP_UNCLEAR', reason: response.replace("STATUS: UNCLEAR", "").replace("ALASAN:", "").trim() };
        }
        else {
            let reason = response.replace("STATUS: CONTINUE", "").replace("ALASAN:", "").trim();
            if (reason.length < 5) reason = "Lanjutkan debat, pertajam solusi untuk user.";
            return { status: 'LANJUT', reason: reason };
        }
    } catch (e) {
        return { status: 'LANJUT', reason: "Hakim gagal menilai, lanjutkan debat manual." };
    }
}
