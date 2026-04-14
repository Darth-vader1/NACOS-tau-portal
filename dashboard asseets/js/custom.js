import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = "https://gqhhvbnbbmstfrhtegsl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaGh2Ym5iYm1zdGZyaHRlZ3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzkwOTcsImV4cCI6MjA5MTc1NTA5N30.cSjwB9V-jY3yekNz0wS8EdlKG79lQr-SYPRj20eGicg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const uploadForm = document.getElementById("upload-form");
const display_picture = document.getElementById("profile-pic");
const logoutBtn = document.getElementById("logout-btn");
document.addEventListener('DOMContentLoaded', function() {
    const uploadPfp = async (file) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            Swal.fire({
                title: "Error!",
                text: "User not authenticated",
                icon: "error",
                confirmButtonText: "Okay",
            }).then(()=> {
                window.location.href = "student-login.html";
            })
            return;
        }
    
        const userId = user.id;
        const filePath = `display_pictures/${userId}.jpg`; // Unique path per user
        const reloadWithoutCache = () => {
            const imgElement = document.getElementById("profile-picture"); // Update this to your actual img element ID
            if (imgElement) {
                imgElement.src = imgElement.src.split("?")[0] + `?t=${new Date().getTime()}`;
            }
            location.reload();
        };
        
        const { error: uploadError } = await supabase.storage
            .from("display_pictures")
            .upload(filePath, file, { upsert: true });
    
        if (uploadError) {
            Swal.fire({
                title: "Error!",
                text: "Error uploading image. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
    
        // Get the public URL of the uploaded image
        const { data } = supabase.storage.from("display_pictures").getPublicUrl(filePath);
        const imageUrl = data.publicUrl;
    
        // Store the image URL in the database
        const { error: updateError } = await supabase
            .from("Students")
            .update({ display_picture: imageUrl })
            .eq("id", userId);
    
        if (updateError) {
            Swal.fire({
                title: "Error!",
                text: "Error updating profile picture. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
    
        Swal.fire({
            title: "Success!",
            text: "Profile picture updated successfully.",
            icon: "success",
            confirmButtonText: "Okay",
        }).then(() => {
            sessionStorage.clear();
            reloadWithoutCache();
        });
    }
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        uploadPfp(display_picture.files[0])
    });

    // Function to fetch student data
    const fetchStudentData = async () => {
    const { data: user, error } = await supabase.auth.getUser();

    if (error || !user) {
        Swal.fire({
            title: "Error!",
            text: "User not authenticated",
            icon: "error",
            confirmButtonText: "Okay",
        }).then(()=>{
            window.location.href = "student-login.html";
        })
        return;
    }

    const userEmail = user.user?.email; // Get logged-in user email
    const {data:rsvpData, error: rsvpError} = await supabase
        .from("Events")
        .select("*")
        .eq("id", user.user?.id)
        .single();
    if(rsvpData){
        document.getElementById("rsvp-download").style.display = "flex";
        document.getElementById("rsvp-modal-open").removeAttribute('data-bs-toggle');
        document.getElementById("rsvp-modal-open").removeAttribute('data-bs-target');
        document.getElementById("rsvp-modal-open").addEventListener("click", (event)=>{
            event.preventDefault();
            Swal.fire({
                title: "RSVP Details",
                text: "You have already RSVP'd for the event. Download your ticket from the dashboard.",
                icon: "info",
                confirmButtonText: "Okay",
            })
            return;
        })
        document.getElementById("rsvp-download").addEventListener("click", (event)=>{
            event.preventDefault();
            window.location.href = "events.html";
        })
    }
    const { data, error: fetchError } = await supabase
        .from("Students")
        .select("*") // Select all columns, or specify them like: .select("name, matric_no, course")
        .eq("email", userEmail) // Filter data by user email
        .single(); // Expect only one record

    if (fetchError) {
        Swal.fire({
            title: "Error!",
            text: "Error fetching student data. Please refresh.",
            icon: "error",
            confirmButtonText: "Okay",
        })
        // console.error("Error fetching student data:", fetchError);
        return;
    }
    document.getElementById("student-name").textContent = data.name || "Unknown";
        document.getElementById("matric_no").textContent = data.matric_no || "N/A";
        document.getElementById("course").textContent = data.course || "N/A";
        if(data.display_picture){
            document.getElementById("display_picture").src = data.display_picture + `?t=${new Date().getTime()}`;
        }
    };

    logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signOut();
        if (error) {
            Swal.fire({
                title: "Error!",
                text: "Error signing out. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
        sessionStorage.clear();
        window.location.href = "index.html";
    });
    // Call the function to fetch data
    fetchStudentData();

    const eventRsvp = async () =>{
        const { data: user, error } = await supabase.auth.getUser();

        if(error){
            Swal.fire({
                title: "Error!",
                text: "You're not authenticated. Please signin.",
                icon: "error",
                confirmButtonText: "Okay",
            })
            return;
        }
        const userId = user.user?.id;
        const {data, fetchError} = await supabase
            .from("Students")
            .select("*")
            .eq("id", userId)
            .single();
        if(fetchError){
            Swal.fire({
                title: "Error!",
                text: "An error occurred while fetching student data.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
        const matricNo = data.matric_no;
        const rsvp = "RSVP";
        // console.log(userId);
        const { data: existingStudent, error: checkError } = await supabase
              .from("Events")
              .select("*")
              .eq("id", userId)
              .single();
  
          if (checkError && checkError.code !== "PGRST116") { // Ignore "no rows found" error
              console.error("Error checking student:", checkError);
              Swal.fire({
                  title: "Error!",
                  text: "An error occurred while checking user data.",
                  icon: "error",
                  confirmButtonText: "Okay",
              });
              return;
          }
          if(existingStudent){
            Swal.fire({
                title: "Error!",
                text: "You already have a spot for this event. Download your ticket from your dashboard.",
                icon: "error",
                confirmButtonText: "Okay",
            })
          }else{
            const { error: insertError } = await supabase
            .from("Events")
            .insert([{
                matric_no: matricNo,
                id: userId, 
                unwind_and_connect: rsvp,
            }]);
            if(insertError){
                Swal.fire({
                    title: "Error!",
                    text: "An error occurred while trying to RSVP. Please try again later.",
                    icon: "error",
                    confirmButtonText: "Okay",
                });
                return;
            }
            Swal.fire({
                title: "Success!",
                text: "You have successfully RSVP'd for the event.",
                icon: "success",
                confirmButtonText: "Click here to download your ticket",
            }).then(()=>{
                window.location.href = "events.html";
            })
          }
        
        
    }
    document.getElementById("rsvp-btn").addEventListener("click", (e)=>{
        e.preventDefault();
        eventRsvp();
    })

    loadQuickResources();
});

async function loadQuickResources() {
    const container = document.getElementById('quickResourcesContainer');
    if (!container) return;

    const { data, error } = await supabase
        .from('academic_resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

    if (error || !data || data.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No resources available yet</p>
            </div>
        `;
        return;
    }

    const typeColors = {
        'Tutorial': { bg: '#e3f2fd', color: '#1976d2' },
        'Documentation': { bg: '#f3e5f5', color: '#7b1fa2' },
        'Course': { bg: '#e8f5e9', color: '#388e3c' },
        'Book': { bg: '#fff3e0', color: '#f57c00' },
        'Tool': { bg: '#fce4ec', color: '#c2185b' },
        'Other': { bg: '#eceff1', color: '#546e7a' }
    };

    container.innerHTML = data.map(r => {
        const colors = typeColors[r.resource_type] || { bg: '#eceff1', color: '#546e7a' };
        return `
            <div class="col-lg-3 col-md-6">
                <a href="${escapeHtml(r.url)}" target="_blank" class="text-decoration-none">
                    <div class="service-item position-relative h-100" style="background: ${colors.bg}; border-left: 4px solid ${colors.color};">
                        <i class="bi bi-link-45deg icon" style="color: ${colors.color};"></i>
                        <div>
                            <h3 style="color: ${colors.color};">${escapeHtml(r.title)}</h3>
                            <p class="text-muted small">${escapeHtml(r.resource_type)} ${r.category ? '• ' + escapeHtml(r.category) : ''}</p>
                        </div>
                    </div>
                </a>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}