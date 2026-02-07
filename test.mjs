import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const HF_TOKEN = process.env.HF_TOKEN;

// Choose one of these models that work with the router:
const MODEL = "meta-llama/Llama-3.2-3B-Instruct";  // Small, fast, and cheap
// const MODEL = "HuggingFaceTB/SmolLM3-3B";  // Also good for text generation
// const MODEL = "meta-llama/Llama-3.1-8B-Instruct";  // Slightly larger
// const MODEL = "openai/gpt-oss-20b";  // Even better quality

async function main() {
    try {
        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HF_TOKEN}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        {
                            role: "user",
                            content: "Write a very short story about a robot learning to love."
                        }
                    ],
                    max_tokens: 100
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP Error ${response.status}:`, errorText);
            return;
        }

        const data = await response.json();
        console.log("Generated text:", data.choices[0].message.content);

    } catch (err) {
        console.error("Request failed:", err);
    }
}

main();