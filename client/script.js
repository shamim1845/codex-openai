import bot from "./assets/bot.svg";
import user from "./assets/user.svg";
import alert from "./assets/iphone_notification.mp3";

const app = document.getElementById("app")
const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const menu = document.querySelector(".menu");
const toltip = document.querySelector(".toltip");
const reset = document.querySelector("#reset");
const delete_history = document.querySelector(".delete_history");


// auto response sound
function playSound(url) {
  var ourAudio = document.createElement('audio'); // Create a audio element using the DOM
  ourAudio.style.display = "none"; // Hide the audio element
  ourAudio.src = url; // Set resource to our URL
  ourAudio.autoplay = true; // Automatically play sound
  ourAudio.onended = function() {
    this.remove(); // Remove when played.
  };
 app.appendChild(ourAudio);
}


// Display previous chat history
const prevChat = getPreviousChat();
if(prevChat.length !== 0) {
  prevChat.map((chat) => {
    chatContainer.innerHTML += chatStripe(chat.isAi, chat.text);
  });
  setTimeout(() => {
    chatContainer.innerHTML += chatStripe(true, "Welcome to codex for coming back. How can I help you?");
    playSound(alert)

  }, 2000)
}else{
  setTimeout(() => {
    chatContainer.innerHTML += chatStripe(true, "Welcome to codex by OpenAi. How can I help you?");
    playSound(alert)

  }, 2000)
}


// History event handler
(function menuEventHandler() {
  menu.addEventListener("click", () => {
    toltip.classList.toggle("hide_show");
  });
  reset.addEventListener("mouseleave", () => {
    toltip.classList.remove("hide_show");
  });
  delete_history.addEventListener("click", () => {
    const confirmation = confirm("Are you sure?");
    if (confirmation) {
      localStorage.removeItem("codex_data");
      window.location.reload(true);
    }
  });
})();

// Get previous chat history from localhost
function getPreviousChat() {
  const previousChat = JSON.parse(localStorage.getItem("codex_data"));
  return previousChat ? previousChat : [];
}

// Set chat message in localStorage
function setChatLocalStorage(isAi, text) {
  localStorage.setItem(
    "codex_data",
    JSON.stringify([
      ...getPreviousChat(),
      {
        isAi,
        text,
      },
    ])
  );
}

// loader function -> wait for response
let loadInterval;
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Print text as like typing for better user experience
function typeText(element, text) {
  setChatLocalStorage(true, text);

  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// Generate a unique ID
function generateUniqueId() {
  let timestamp = Date.now();
  let randomNumber = Math.random();
  let hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Print message(user & bot)
function chatStripe(isAi, value, uniqueId) {
  return `
            <div class="wrapper ${isAi && "ai"}">
                <div class="chat">
                <div class="profile">
                <img
                src="${isAi ? bot : user}"
                alt="${isAi ? "bot" : "user"}"
                />
                </div>
                <div  class="message" id="${uniqueId}">${value}</div>
  
                </div>
            </div>
        `;
}


// Handle form when submitted
const handleSubmit = (e) => {
  e.preventDefault();

  const data = new FormData(form);
  if(data.get("prompt").trim().length < 2) {
return
  }
  console.log(data.get("prompt").length);
  setChatLocalStorage(false, data.get("prompt"));

  //user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);
  fetchData(data, messageDiv);
};

// add event in form
form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.code === "Enter") {
    handleSubmit(e);
  }
});

// fetch data from server
const fetchData = async (data, messageDiv) => {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/ask/me/anything`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    }
  );

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    setChatLocalStorage(true, "Something went wrong");
    alert(err);
  }
};
