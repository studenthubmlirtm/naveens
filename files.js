// ===============================
// Supabase Connection
// ===============================

const supabaseUrl = "YOUR_SUPABASE_URL";
const supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = supabase.createClient(
    supabaseUrl,
    supabaseKey
);


// ===============================
// File List
// ===============================

const fileList = document.getElementById("fileList");


// Load files when page opens
loadFiles();


// ===============================
// Upload File
// ===============================

async function uploadFile() {

    const input = document.getElementById("fileInput");
    const file = input.files[0];

    if (!file) {
        alert("Please select a file");
        return;
    }


    const filePath = Date.now() + "_" + file.name;


    // Upload file to Storage

    const { error: uploadError } =
        await supabaseClient.storage
        .from("student-files")
        .upload(filePath, file);


    if (uploadError) {
        alert(uploadError.message);
        return;
    }



    // Get file URL

    const { data } =
        supabaseClient.storage
        .from("student-files")
        .getPublicUrl(filePath);



    // Save details in database

    const { error: insertError } =
        await supabaseClient
        .from("files")
        .insert({

            file_name: file.name,

            file_url: data.publicUrl,

            uploaded_by:
            localStorage.getItem("studentName") || "Anonymous"

        });



    if (insertError) {

        alert(insertError.message);
        return;

    }


    alert("File uploaded successfully");


    input.value = "";


    // Refresh list automatically

    loadFiles();

}



// ===============================
// Show Files
// ===============================

async function loadFiles() {


    const { data, error } =
        await supabaseClient
        .from("files")
        .select("*")
        .order(
            "created_at",
            {
                ascending:false
            }
        );



    if (error) {

        console.log(error);
        return;

    }



    fileList.innerHTML = "";



    data.forEach(file => {


        fileList.innerHTML += `

        <div class="file-card">

            <h3>📄 ${file.file_name}</h3>

            <p>
            Uploaded by:
            ${file.uploaded_by || "Anonymous"}
            </p>


            <a href="${file.file_url}" target="_blank">
                <button class="preview">
                👁 Preview
                </button>
            </a>


            <a href="${file.file_url}" download>
                <button class="download">
                ⬇ Download
                </button>
            </a>


            <button 
            class="delete"
            onclick="deleteFile(${file.id})">

            🗑 Delete

            </button>


        </div>

        `;

    });

}



// ===============================
// Delete File
// ===============================

async function deleteFile(id) {


    const { error } =
        await supabaseClient
        .from("files")
        .delete()
        .eq("id", id);



    if(error){

        alert(error.message);
        return;

    }


    loadFiles();

}



// ===============================
// Automatic Update
// ===============================

supabaseClient
.channel("file-updates")

.on(

    "postgres_changes",

    {
        event:"*",
        schema:"public",
        table:"files"
    },

    () => {

        loadFiles();

    }

)

.subscribe();



// ===============================
// Back Button
// ===============================

function goBack(){

    window.location.href="home.html";

}
