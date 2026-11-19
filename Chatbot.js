// =========================================================
// ABC HUB - Automated Chat Bot (bottom-left widget)
// Simple rule-based bot: matches keywords in the visitor's
// message and replies with a relevant canned answer.
// No external API needed - works fully offline.
// =========================================================

// ---- Bot knowledge base -------------------------------------------------
// Add / edit entries any time. Each entry has a list of keywords to look
// for in the visitor's message (lowercase) and the reply to send back.
const BOT_KNOWLEDGE = [
    {
        keywords: ["hi", "hello", "hey", "salam", "assalam"],
        reply: "Hello! 👋 Welcome to ABC HUB. How can I help you today?"
    },
    {
        keywords: ["price", "cost", "how much"],
        reply: "Our products range from $16.99 to $44.99. You can see exact prices on each product card in the Products section."
    },
    {
        keywords: ["shipping", "delivery", "deliver"],
        reply: "We offer fast, worldwide shipping on every order. Delivery times vary by location, but most orders arrive within 5-10 business days."
    },
    {
        keywords: ["payment", "pay", "checkout", "cod", "cash on delivery"],
        reply: "Checkout is quick and secure. Add items to your cart, click 'Proceed To Checkout', and fill in your details to place the order."
    },
    {
        keywords: ["return", "refund", "exchange"],
        reply: "We want you to love your purchase! If there's an issue, please contact us at m.abdulmoiz1810@gmail.com and our team will help sort out a return or exchange."
    },
    {
        keywords: ["track", "order status", "where is my order"],
        reply: "For order tracking, please email us at m.abdulmoiz1810@gmail.com with your order details and we'll get back to you right away."
    },
    {
        keywords: ["contact", "phone", "number", "email", "support"],
        reply: "You can reach our support team at m.abdulmoiz1810@gmail.com or call +923337890645. We're happy to help!"
    },
    {
        keywords: ["backpack"],
        reply: "The Expandable Business Backpack is $44.99 and rated 4.9⭐ - great for travel and daily use!"
    },
    {
        keywords: ["lamp"],
        reply: "We have the Sunset Lamp ($19.99, 4.8⭐) and the Football Lamp ($16.99, 4.7⭐) - both perfect for cozy room decor."
    },
    {
        keywords: ["hoodie", "dandadan", "okarun"],
        reply: "The Dandadan Okarun Hoodie is $34.99 and one of our top-rated items at 5.0⭐!"
    },
    {
        keywords: ["cover", "case", "samsung"],
        reply: "The Samsung Back Cover is $16.99 and rated 4.7⭐ - a great way to protect your phone in style."
    },
    {
        keywords: ["thank", "thanks"],
        reply: "You're very welcome! 😊 Let me know if there's anything else I can help with."
    },
    {
        keywords: ["bye", "goodbye"],
        reply: "Thanks for visiting ABC HUB! Have a great day. 🛍️"
    }
];

const BOT_FALLBACK_REPLY =
    "I'm not totally sure about that one. For anything specific, feel free to email us at m.abdulmoiz1810@gmail.com or call +923337890645, and our team will help you out!";

const BOT_QUICK_REPLIES = [
    "Shipping info",
    "Payment options",
    "Track my order",
    "Contact support"
];

// ---- Internal state -------------------------------------------------
let chatbotStarted = false;

// ---- Open / close the widget -----------------------------------------
function toggleChatbot() {
    const box = document.getElementById("chatbot-box");
    const badge = document.getElementById("chatbot-badge");

    if (box.style.display === "flex") {
        box.style.display = "none";
        return;
    }

    box.style.display = "flex";
    if (badge) badge.style.display = "none";

    if (!chatbotStarted) {
        chatbotStarted = true;
        addBotMessage("Hi there! I'm the ABC HUB assistant 🤖. Ask me about shipping, payments, products, or your order - I'm here 24/7!");
        renderQuickReplies();
    }
}

// ---- Render quick-reply buttons ---------------------------------------
function renderQuickReplies() {
    const container = document.getElementById("chatbot-quick-replies");
    if (!container) return;

    container.innerHTML = "";
    BOT_QUICK_REPLIES.forEach(text => {
        const btn = document.createElement("button");
        btn.textContent = text;
        btn.onclick = () => {
            addUserMessage(text);
            respondToMessage(text);
        };
        container.appendChild(btn);
    });
}

// ---- Add messages to the chat window -----------------------------------
function addUserMessage(text) {
    appendMessage(text, "user");
}

function addBotMessage(text) {
    appendMessage(text, "bot");
}

function appendMessage(text, sender) {
    const messages = document.getElementById("chatbot-messages");
    if (!messages) return;

    const msg = document.createElement("div");
    msg.className = "chat-msg " + sender;
    msg.textContent = text;
    messages.appendChild(msg);

    messages.scrollTop = messages.scrollHeight;
}

// ---- Typing indicator ----------------------------------------------------
function showTypingIndicator() {
    const messages = document.getElementById("chatbot-messages");
    if (!messages) return;

    const typing = document.createElement("div");
    typing.className = "chat-msg bot";
    typing.id = "chatbot-typing";
    typing.textContent = "typing...";
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function removeTypingIndicator() {
    const typing = document.getElementById("chatbot-typing");
    if (typing) typing.remove();
}

// ---- Core matching logic -------------------------------------------------
function getBotReply(userText) {
    const text = userText.toLowerCase();

    for (const entry of BOT_KNOWLEDGE) {
        if (entry.keywords.some(keyword => text.includes(keyword))) {
            return entry.reply;
        }
    }

    return BOT_FALLBACK_REPLY;
}

function respondToMessage(userText) {
    showTypingIndicator();

    // Small delay to feel more natural / "live"
    setTimeout(() => {
        removeTypingIndicator();
        const reply = getBotReply(userText);
        addBotMessage(reply);
    }, 600);
}

// ---- Sending a message from the input box -------------------------------
function sendChatMessage() {
    const input = document.getElementById("chatbot-input");
    if (!input) return;

    const text = input.value.trim();
    if (text === "") return;

    addUserMessage(text);
    input.value = "";

    respondToMessage(text);
}

// ---- Allow pressing Enter to send ----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("chatbot-input");
    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendChatMessage();
            }
        });
    }
});