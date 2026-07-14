// Supabase Configuration
const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);


// Elements
const usernameInput = document.getElementById("username");
const joinBtn = document.getElementById("joinBtn");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const chatBox = document.getElementById("chatBox");


let username = "";


// Join Chat
joinBtn.addEventListener("click", () => {

    username = usernameInput.value.trim();

    if(username === ""){
        alert("Enter your name");
        return;
    }

    usernameInput.disabled = true;
    joinBtn.disabled = true;

    alert("Joined Chat as " + username);

    loadMessages();
    listenMessages();
});



// Send Message
sendBtn.addEventListener("click", async () => {

    const message = messageInput.value.trim();

    if(message === ""){
        return;
    }


    if(username === ""){
        alert("Join chat first");
        return;
    }


    const { error } = await supabaseClient
        .from("messages")
        .insert([
            {
                username: username,
                message: message
            }
        ]);


    if(error){
        alert(error.message);
        return;
    }


    messageInput.value = "";

});



// Load Old Messages
async function loadMessages(){

    const { data, error } = await supabaseClient
        .from("messages")
        .select("*")
        .order("created_at",
        {
            ascending:true
        });


    if(error){
        console.log(error);
        return;
    }


    chatBox.innerHTML = "";


    data.forEach(showMessage);

}



// Display Message
function showMessage(msg){

    chatBox.innerHTML += `

    <div class="message">

        <b>${msg.username}</b><br>

        ${msg.message}

        <div class="time">
        ${new Date(msg.created_at).toLocaleTimeString()}
        </div>

    </div>

    `;


    chatBox.scrollTop = chatBox.scrollHeight;

}



// Real-time Messages
function listenMessages(){

    supabaseClient
    .channel("chat-room")

    .on(
        "postgres_changes",
        {
            event:"INSERT",
            schema:"public",
            table:"messages"
        },

        payload => {

            showMessage(payload.new);

        }

    )

    .subscribe();

}
