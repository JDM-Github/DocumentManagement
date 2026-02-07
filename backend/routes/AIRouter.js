// Author: JDM
// Created on: 2026-02-07
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const HF_TOKEN = process.env.HF_TOKEN;
const MODEL = "meta-llama/Llama-3.2-3B-Instruct";
const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:8888/.netlify/functions/api";

// -------------------------------------------------------------------------------
// AVAILABLE ROUTES CONFIGURATION
// -------------------------------------------------------------------------------
const AVAILABLE_ROUTES = [
    // Accomplishment routes
    {
        path: "/accomplishment/get",
        method: "GET",
        description: "Get all accomplishments for the authenticated user",
        requiresAuth: true,
        params: []
    },
    {
        path: "/accomplishment/get/:id",
        method: "GET",
        description: "Get a specific accomplishment by ID",
        requiresAuth: true,
        params: ["id"]
    },
    {
        path: "/accomplishment/count",
        method: "GET",
        description: "Get total count of accomplishments",
        requiresAuth: true,
        params: []
    },
    {
        path: "/accomplishment/stats",
        method: "GET",
        description: "Get accomplishment statistics (pending, approved, rejected counts)",
        requiresAuth: true,
        params: []
    },
    {
        path: "/accomplishment/create",
        method: "POST",
        description: "Create a new accomplishment report",
        requiresAuth: true,
        params: [],
        bodyParams: ["departmentId", "uploadedUrl", "remarks"]
    },
    {
        path: "/accomplishment/update/:id",
        method: "PUT",
        description: "Update an accomplishment report",
        requiresAuth: true,
        params: ["id"],
        bodyParams: ["uploadedUrl", "remarks"]
    },
    {
        path: "/accomplishment/delete/:id",
        method: "DELETE",
        description: "Delete an accomplishment report",
        requiresAuth: true,
        params: ["id"]
    },

    {
        path: "/accomplishment/entry/get/:reportId",
        method: "GET",
        description: "Get all entries for a specific accomplishment report",
        requiresAuth: true,
        params: ["reportId"]
    },
    {
        path: "/accomplishment/entry/create/:reportId",
        method: "POST",
        description: "Add a new entry to an accomplishment report",
        requiresAuth: true,
        params: ["reportId"],
        bodyParams: ["date", "activities", "remarks", "signedBy"]
    },
    {
        path: "/accomplishment/entry/update/:reportId/:entryId",
        method: "PUT",
        description: "Update a specific entry",
        requiresAuth: true,
        params: ["reportId", "entryId"],
        bodyParams: ["date", "activities", "remarks", "signedBy"]
    },
    {
        path: "/accomplishment/entry/delete/:reportId/:entryId",
        method: "DELETE",
        description: "Delete a specific entry",
        requiresAuth: true,
        params: ["reportId", "entryId"]
    },

    {
        path: "/request-letter/get",
        method: "GET",
        description: "Get all request letters",
        requiresAuth: true,
        params: []
    },
    {
        path: "/request-letter/get/:id",
        method: "GET",
        description: "Get a specific request letter by ID",
        requiresAuth: true,
        params: ["id"]
    },
    {
        path: "/request-letter/count",
        method: "GET",
        description: "Get total count of request letters",
        requiresAuth: true,
        params: []
    },
    {
        path: "/request-letter/stats",
        method: "GET",
        description: "Get request letter statistics",
        requiresAuth: true,
        params: []
    },

    {
        path: "/pass-slip/get",
        method: "GET",
        description: "Get all pass slips",
        requiresAuth: true,
        params: []
    },
    {
        path: "/pass-slip/get/:id",
        method: "GET",
        description: "Get a specific pass slip by ID",
        requiresAuth: true,
        params: ["id"]
    },
    {
        path: "/pass-slip/count",
        method: "GET",
        description: "Get total count of pass slips",
        requiresAuth: true,
        params: []
    },
    {
        path: "/pass-slip/stats",
        method: "GET",
        description: "Get pass slip statistics",
        requiresAuth: true,
        params: []
    },

    {
        path: "/notification/get",
        method: "GET",
        description: "Get all notifications",
        requiresAuth: true,
        params: []
    },
    {
        path: "/notification/get/:id",
        method: "GET",
        description: "Get a specific notification by ID",
        requiresAuth: true,
        params: ["id"]
    },
    {
        path: "/notification/count",
        method: "GET",
        description: "Get total count of notifications",
        requiresAuth: true,
        params: []
    },

    {
        path: "/user/profile/get",
        method: "GET",
        description: "Get user profile information",
        requiresAuth: true,
        params: []
    },

    {
        path: "/dashboard/stats",
        method: "GET",
        description: "Get dashboard statistics",
        requiresAuth: true,
        params: []
    }
];

// -------------------------------------------------------------------------------
// AI SYSTEM PROMPT
// -------------------------------------------------------------------------------
function generateSystemPrompt() {
    const routeList = AVAILABLE_ROUTES.map(route => {
        const paramList = route.params?.length > 0 ? ` (requires: ${route.params.join(', ')})` : '';
        const bodyList = route.bodyParams?.length > 0 ? ` [body: ${route.bodyParams.join(', ')}]` : '';
        return `- ${route.method} ${route.path}${paramList}${bodyList}: ${route.description}`;
    }).join('\n');

    return `You are an intelligent assistant for a Document Management System. Your role is to help users understand and access their data by selecting the EXACT route from the available routes below.

CRITICAL RULES:
1. Only answer questions related to the document management system
2. When users ask for data, you MUST select ONE route from the AVAILABLE ROUTES list below
3. Use the EXACT path as listed - do not modify or guess
4. If a route requires parameters (like :id, :reportId, :entryId), extract them from the user's question
5. If the user's question doesn't match any available route, politely explain what you CAN help with
6. Be concise, professional, and helpful

AVAILABLE ROUTES:
${routeList}

ROUTE SELECTION EXAMPLES:
- "Show my accomplishments" → Use route: /accomplishment/get
- "Get accomplishment with id 123" → Use route: /accomplishment/get/:id with params: {"id": "123"}
- "How many accomplishments do I have?" → Use route: /accomplishment/count
- "Show accomplishment statistics" → Use route: /accomplishment/stats
- "Show my profile" → Use route: /user/profile/get
- "Get my notifications" → Use route: /notification/get
- "Get notification 456" → Use route: /notification/get/:id with params: {"id": "456"}
- "Show pass slip 789" → Use route: /pass-slip/get/:id with params: {"id": "789"}
- "Get entries for accomplishment report 101" → Use route: /accomplishment/entry/get/:reportId with params: {"reportId": "101"}
- "Show dashboard stats" → Use route: /dashboard/stats
- "How many request letters do I have?" → Use route: /request-letter/count
- "Show request letter 555" → Use route: /request-letter/get/:id with params: {"id": "555"}

RESPONSE FORMAT:
When you need to fetch data, respond with ONLY a JSON object:
{
  "action": "fetch",
  "route": "/exact/route/from/list",
  "params": {"paramName": "value"},
  "reasoning": "Brief explanation"
}

When answering a general question without needing data, respond in natural language.

If the question is off-topic, respond with:
{
  "action": "decline",
  "message": "I can only help with questions about your documents, accomplishments, request letters, pass slips, notifications, user profile, and dashboard statistics."
}`;
}

const SYSTEM_PROMPT = generateSystemPrompt();

// -------------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------------

/**
 * Call the Hugging Face AI model
 */
async function callAI(messages) {
    try {
        const response = await axios.post(
            "https://router.huggingface.co/v1/chat/completions",
            {
                model: MODEL,
                messages: messages,
                max_tokens: 500,
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("AI call failed:", error.response?.data || error.message);
        throw new Error(`AI API Error: ${error.response?.status || 'Unknown'} - ${error.response?.data?.error || error.message}`);
    }
}

/**
 * Fetch data from internal API
 */
async function fetchInternalAPI(route, method, token) {
    try {
        const url = `${BASE_API_URL}${route}`;
        const response = await axios({
            method: method,
            url: url,
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        console.error("Internal API fetch failed:", error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            data: null
        };
    }
}

/**
 * Parse AI response to determine if it's a JSON action or text
 */
function parseAIResponse(response) {
    try {
        // Try to find JSON in the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.action) {
                return { type: "action", data: parsed };
            }
        }
    } catch (e) {
        // Not JSON, treat as regular text
    }
    return { type: "text", data: response };
}

/**
 * Replace route parameters with actual values
 */
function buildRoute(routeTemplate, params) {
    let route = routeTemplate;
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            route = route.replace(`:${key}`, value);
        }
    }
    return route;
}

// -------------------------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------------------------

/**
 * Main AI chat endpoint
 * POST /ai/chat
 * Body: { message: "user question", conversationHistory: [...] }
 */
router.post("/chat", async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        const token = req.headers.authorization;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory,
            { role: "user", content: message }
        ];

        const aiResponse = await callAI(messages);
        const parsed = parseAIResponse(aiResponse);

        if (parsed.type === "action" && parsed.data.action === "fetch") {
            const { route: routeTemplate, params } = parsed.data;

            const route = buildRoute(routeTemplate, params || {});

            const routeConfig = AVAILABLE_ROUTES.find(r =>
                r.path === routeTemplate
            );

            if (!routeConfig) {
                return res.json({
                    success: true,
                    response: "I'm sorry, I don't have access to that information.",
                    requiresData: false
                });
            }

            const apiResult = await fetchInternalAPI(
                route,
                routeConfig.method,
                token
            );

            if (!apiResult.success) {
                return res.json({
                    success: true,
                    response: `I couldn't retrieve that information. Error: ${apiResult.error}`,
                    requiresData: false
                });
            }

            const dataContext = `Here is the data from ${route}:\n${JSON.stringify(apiResult.data, null, 2)}`;
            const finalMessages = [
                { role: "system", content: SYSTEM_PROMPT },
                ...conversationHistory,
                { role: "user", content: message },
                { role: "assistant", content: dataContext },
                { role: "user", content: "Based on the data above, please provide a clear and helpful answer to my original question." }
            ];

            const finalResponse = await callAI(finalMessages);

            return res.json({
                success: true,
                response: finalResponse,
                requiresData: true,
                dataFetched: {
                    route: route,
                    data: apiResult.data
                }
            });
        }
        if (parsed.type === "action" && parsed.data.action === "decline") {
            return res.json({
                success: true,
                response: parsed.data.message,
                requiresData: false
            });
        }
        return res.json({
            success: true,
            response: aiResponse,
            requiresData: false
        });

    } catch (error) {
        console.error("AI chat error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
            error: error.message
        });
    }
});

/**
 * Get available routes
 * GET /ai/routes
 */
router.get("/routes", async (req, res) => {
    return res.json({
        success: true,
        routes: AVAILABLE_ROUTES
    });
});

/**
 * Health check
 * GET /ai/health
 */
router.get("/health", async (req, res) => {
    return res.json({
        success: true,
        message: "AI service is running",
        model: MODEL
    });
});

module.exports = router;