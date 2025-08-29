// Initialize Lucide icons
lucide.createIcons();

// Get DOM elements
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatArea = document.getElementById('chat-area');
const welcomeMessage = document.getElementById('welcome-message');
const new_chat = document.querySelectorAll('#new_chat');

const mobile_chat = document.getElementById('mobile-chat-list');


// Reload the page after 1 seconds
new_chat.forEach((old_chat) => {
old_chat.addEventListener('click', () => {
    setTimeout(() => {
        location.reload(); // Reloads the current page
    }, 1000);
});
});


// Auto-resize textarea
messageInput.addEventListener('input', function () {
    this.style.height = '2.5rem';
    this.style.height = Math.min(this.scrollHeight, 128) + 'px';

    // Enable/disable send button based on input
    sendButton.disabled = !this.value.trim();
});

// Handle form submission
chatForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    messageInput.value = '';
    messageInput.style.height = '2.5rem';
    sendButton.disabled = true;

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    // Fetch AI response
    const aiResponse = await fetchAIResponse(message);

    // Remove typing indicator and add AI response
    typingIndicator.remove();
    addMessage(aiResponse, false);
});

// Function to add a message to the chat
function addMessage(text, isUser) {
    // Remove welcome message if it exists
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`;
    messageDiv.innerHTML = `
        <div class="max-w-[80%] rounded-${isUser ? '[12px_0px_12px_12px]' : '[0px_12px_12px_12px]'} px-6 py-2 ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }">
          ${text}
        </div>
    `;
    chatArea.appendChild(messageDiv);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Function to add typing indicator
function addTypingIndicator() {
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'flex justify-start message-fade-in';
    indicatorDiv.innerHTML = `
        <div class="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-900">
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
    `;
    chatArea.appendChild(indicatorDiv);
    return indicatorDiv;
}
// Function to fetch AI response
async function fetchAIResponse(message) {
    const API_KEY = "AIzaSyBPqtnQx0a3UUs8ThftOYgLpXd3vf4CJlw"; // Replace with your actual API key
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: message }]
                }]
            }),
        });

        const data = await response.json();

        if (response.ok) {
            // Extract the AI-generated text
            const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
            saveChatHistory(message, aiContent || "No response from AI.");
            return aiContent || "No response from AI.";
        } else {
            throw new Error(data.error?.message || "Failed to fetch response.");
        }
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "I'm sorry, something went wrong. Please try again.";
    }
}

// Function to save chat history
function saveChatHistory(userMessage, aiResponse) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    history.push({ userMessage, aiResponse });
    localStorage.setItem('chatHistory', JSON.stringify(history));
}
// Function to display recent chats in both desktop and mobile sections
function displayRecentChats() {
    const recentChatsContainer = document.querySelector('.space-y-2'); // Ensure this container exists
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Clear previous chat list in both desktop and mobile sections
    recentChatsContainer.innerHTML = '';
    mobile_chat.innerHTML = ''; // Clear mobile chat section

    history.forEach((chat, index) => {
        // Create a chat button for desktop
        const button = document.createElement('button');
        button.classList.add('chat-button', 'w-[200px]', 'text-left', 'px-3', 'py-2', 'rounded-lg', 'hover:bg-gray-300', 'hover:text-black', 'transition-colors', 'duration-200', 'text-sm', 'text-gray-700', 'box-border');
        button.innerHTML = `<img class="h-[24px] pr-[12px]" src="./image/message.png" alt="error">Chat ${index + 1} <span class="option",'text-center'>  <img class="h-[24px]" src="./image/delete.png" alt="error"></span>`;

        // Create a chat button for mobile
        const mobileButton = document.createElement('button');
        mobileButton.classList.add('chat-button', 'ml-4', 'mt-6', 'w-[200px]', 'text-left', 'px-3', 'py-2', 'rounded-lg', 'hover:bg-gray-300', 'hover:text-black', 'transition-colors', 'duration-200', 'text-sm', 'text-gray-700', 'box-border');
        mobileButton.innerHTML = `<img class="h-[24px] pr-[12px]" src="./image/message.png" alt="error">Chat ${index + 1} <span class="option",'text-center',>  <img class="h-[24px]" src="./image/delete.png" alt="error"></span>`;

        // Add event listener to open the chat when clicked
        button.addEventListener('click', () => {
            loadChatHistory(index);
        });
        
        mobileButton.addEventListener('click', () => {
            loadChatHistory(index);
        });

        // Add event listener to the delete option
        const optionSpan = button.querySelector('.option');
        const mobileOptionSpan = mobileButton.querySelector('.option');

        optionSpan.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the button click event
            deleteChat(history, index, button);
        });

        mobileOptionSpan.addEventListener('click', (event) => {
            event.stopPropagation();
            deleteChat(history, index, mobileButton);
        });

        // Append buttons to their respective containers
        recentChatsContainer.appendChild(button);
        mobile_chat.appendChild(mobileButton);
    });
}

// Function to delete chat from history
function deleteChat(history, index, button) {
    history.splice(index, 1); // Remove the chat from the history array
    localStorage.setItem('chatHistory', JSON.stringify(history)); // Update local storage
    button.remove(); // Remove the button from the DOM
    displayRecentChats(); // Refresh the recent chats list
}

// Function to load and display chat history
function loadChatHistory(index) {
    const history = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const chat = history[index];
    if (chat) {
        clearChatArea();
        addMessage(chat.userMessage, true);
        addMessage(chat.aiResponse, false);
    }
}

// Function to clear chat area
function clearChatArea() {
    const chatArea = document.getElementById('chat-area');
    chatArea.innerHTML = '';
}


// Display the recent chats on page load
window.addEventListener('load', displayRecentChats);

// Function to add a message to the chat
function addMessage(text, isUser) {
    const chatArea = document.getElementById('chat-area');
    const welcomeMessage = document.getElementById('welcome-message');

    // Remove welcome message if it exists
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} message-fade-in`;
    messageDiv.innerHTML = `
        <div class="max-w-[80%] rounded-${isUser ? '[12px_0px_12px_12px]' : '[0px_12px_12px_12px]'} px-6 py-2 ${isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }">
          ${text}
        </div>
    `;
    chatArea.appendChild(messageDiv);

    // Scroll to bottom
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Handle form submission
document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const message = document.getElementById('message-input').value.trim();
    if (!message) return;

    // Add user message
    addMessage(message, true);
    document.getElementById('message-input').value = '';
    document.getElementById('message-input').style.height = '2.5rem';
    document.getElementById('send-button').disabled = true;

    // Show typing indicator
    const typingIndicator = addTypingIndicator();

    // Fetch AI response
    const aiResponse = await fetchAIResponse(message);

    // Remove typing indicator and add AI response
    typingIndicator.remove();
    addMessage(aiResponse, false);
});

// Function to add typing indicator
function addTypingIndicator() {
    const chatArea = document.getElementById('chat-area');
    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'flex justify-start message-fade-in';
    indicatorDiv.innerHTML = `
        <div class="max-w-[80%] rounded-2xl p-4 bg-gray-100 text-gray-900">
          <div class="flex space-x-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
    `;
    chatArea.appendChild(indicatorDiv);
    return indicatorDiv;
}




const button = document.getElementById("mobile");
const sidebar = document.getElementById("sidebar");
const closeSidebar = document.getElementById("close-sidebar");
const overlay = document.getElementById("overlay");

// Open sidebar
button.addEventListener("click", () => {
    sidebar.classList.remove("-translate-x-full");
    overlay.classList.remove("hidden");
    overlay.classList.add("opacity-100");
});

// Close sidebar
closeSidebar.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);

function closeMenu() {
    sidebar.classList.add("-translate-x-full");
    overlay.classList.add("hidden");
    overlay.classList.remove("opacity-100");
}

// Enter value functionable
// Listen for Enter key press in textarea
messageInput.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault(); // Prevent newline
    chatForm.requestSubmit(); // Trigger form submit
  }
});


