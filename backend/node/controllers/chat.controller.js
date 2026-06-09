
// 🤖 CORE RAG GATEWAY INTERACTION PIPELINE
// 🤖 CORE RAG GATEWAY INTERACTION PIPELINE
export const handleUserMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "A non-empty user message text property is required."
            });
        }

        // --- STEP 1: PARSE ENTITIES AND INTENTS VIA GEMINI FLASK PIPELINE ---
        let semanticQuery = message;
        let maxPrice = null;

        try {
            const intentResponse = await fetch('http://localhost:8000/api/v1/extract-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });

            if (intentResponse.ok) {
                const intentPayload = await intentResponse.json();
                if (intentPayload.success && intentPayload.data) {
                    semanticQuery = intentPayload.data.semanticQuery || message;
                    maxPrice = intentPayload.data.maxPrice !== undefined ? intentPayload.data.maxPrice : null;
                    console.log(`🎯 Entity Extraction Success -> Query: "${semanticQuery}" | Budget Ceiling: ${maxPrice} PHP`);
                }
            } else {
                console.warn(`⚠️ Flask Intent route responded with status: ${intentResponse.status}. Dropping to raw query fallback.`);
            }
        } catch (intentErr) {
            console.error("⚠️ Intent Extraction engine skipped or unreachable. Falling back to default message pass...", intentErr.message);
        }

        // --- STEP 2: FORWARD REFINED PARAMETERS TO RAG ORCHESTRATION PIPELINE ---
        let pythonChatResponse;
        try {
            pythonChatResponse = await fetch('http://localhost:8000/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: semanticQuery,
                    maxPrice: maxPrice
                })
            });
        } catch (fetchErr) {
            return res.status(503).json({
                success: false,
                message: "The Python Flask background microservice is entirely offline or unreachable.",
                error: fetchErr.message
            });
        }

        // Parse JSON safely even if Flask returns a 500 html crash stacktrace
        let engineResult = {};
        try {
            engineResult = await pythonChatResponse.json();
        } catch (jsonErr) {
            return res.status(500).json({
                success: false,
                message: "Flask service crashed completely and failed to return valid JSON context payload.",
                error: `HTTP Status Code: ${pythonChatResponse.status}`
            });
        }

        if (!pythonChatResponse.ok || !engineResult.success) {
            return res.status(pythonChatResponse.status || 500).json({
                success: false,
                message: "Vector hybrid processing cluster encountered a generation error.",
                error: engineResult.error || "Unknown pipeline breakdown inside Flask architecture."
            });
        }

        // --- STEP 3: RETURN INTEGRATED CHAT AND MAP-DATA OBJECTS TO THE FRONTEND ---
        return res.status(200).json({
            success: true,
            reply: engineResult.reply,
            stateEvaluated: engineResult.stateEvaluated,
            highestScore: engineResult.highestScore,
            hasRelationalData: engineResult.hasRelationalData,
            matchedBranches: engineResult.matchedBranches,
            contextUsed: engineResult.contextUsed
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Fatal internal pipeline failure occurred within the Express Chat Gateway.",
            error: error.message
        });
    }
};