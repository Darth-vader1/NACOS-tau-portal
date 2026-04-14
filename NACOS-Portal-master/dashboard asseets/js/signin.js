import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseUrl = "https://dgsipldaivnwxoyodzcw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2lwbGRhaXZud3hveW9kemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzExODEsImV4cCI6MjA1NDUwNzE4MX0.1YLPU_OhyG2CFwf8C4odEstPhL9Ico9lNYK8Lwg-AD0";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
// fetch("/.netlify/functions/supabase")
//   .then(response => response.json())
//   .then(config => {
//     const supabaseUrl = config.supabaseUrl;
//     const supabaseAnonKey = config.supabaseAnonKey;

//     // console.log("Supabase URL:", supabaseUrl);
//     // console.log("Supabase Anon Key:", supabaseAnonKey);

//     // Now you can initialize Supabase
//     const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
//   }).catch(error => console.error("Error fetching keys:", error));
  document.addEventListener('DOMContentLoaded', function() {
    const password = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    togglePassword.addEventListener('click', function (){
      if(password.type === 'password'){
          password.type = 'text';
          document.getElementById('toggle-password').innerHTML = '<i class="bi bi-eye"></i>';
      }else{
          password.type = 'password';
          document.getElementById('toggle-password').innerHTML = '<i class="bi bi-eye-slash"></i>';
      }
    });
    document.addEventListener('submit', async function(e) {
        e.preventDefault();
        // console.log("yes")
        const studentEmail = document.getElementById('email').value.trim();
        const pass_value = password.value.trim();
        // console.log(pass_value)
        const loginStudent = async (email, password) => {
            const { data, error } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });

          const user = data.user;
  
          if (error) {
              Swal.fire({
                title: "Error!",
                text: "User not found. Please signup before attempting to sign in.",
                icon: "error",
                confirmButtonText: "Okay",
              });
              return;
          }
  
          // Extract metadata
          const userMeta = user.user_metadata || {};
          const matric_no = userMeta.matric_no;
          const full_name = userMeta.full_name;
          const course = userMeta.course;
  
          // Check if student already exists in database
          const { data: existingStudent, error: checkError } = await supabase
              .from("Students")
              .select("*")
              .eq("email", user.email)
              .single();
  
          if (checkError && checkError.code !== "PGRST116") { // Ignore "no rows found" error
            //   console.error("Error checking student:", checkError);
              Swal.fire({
                  title: "Error!",
                  text: "An error occurred while checking user data.",
                  icon: "error",
                  confirmButtonText: "Okay",
              });
              return;
          }
  
          // If the student doesn't exist, insert their data
          if (!existingStudent) {
              const { error: insertError } = await supabase
                  .from("Students")
                  .insert([{
                      matric_no: matric_no,
                      name: full_name,
                      course: course,
                      email: user.email,
                      id: user.id, // Link user to student table
                  }]);
  
              if (insertError) {
                  console.error("Insert error:", insertError);
                  Swal.fire({
                      title: "Error!",
                      text: "Failed to save student data.",
                      icon: "error",
                      confirmButtonText: "Okay",
                  });
                  return;
              }
          }
  
          // Success - Redirect to dashboard
          Swal.fire({
              title: "Success!",
              text: "Login successful. Redirecting to dashboard...",
              icon: "success",
              confirmButtonText: "Okay",
          }).then(() => {
              window.location.href = "student-dashboard.html";
          });
          
        }
        loginStudent(studentEmail.toLowerCase(), pass_value)
    });
});
  


// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById("login-form").addEventListener("submit", async function (e) {
//     e.preventDefault();

//     const studentEmail = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value.trim();

//     if (!studentEmail || !password) {
//       Swal.fire({
//         title: "Missing Fields",
//         text: "Please enter both email and password.",
//         icon: "warning",
//         confirmButtonText: "Okay",
//       });
//       return;
//     }

//     try {
//       const response = await fetch("/.netlify/functions/signIn", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: studentEmail, password }),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         Swal.fire({
//           title: "Error!",
//           text: result.error || "Login failed",
//           icon: "error",
//           confirmButtonText: "Okay",
//         });
//         return;
//       }

//       Swal.fire({
//         title: "Success!",
//         text: "Login successful. Redirecting...",
//         icon: "success",
//         confirmButtonText: "Okay",
//       }).then(() => {
//         window.location.href = "student-dashboard.html";
//       });
//     } catch (error) {
//       console.error("Login error:", error);
//       Swal.fire({
//         title: "Error!",
//         text: "An unexpected error occurred",
//         icon: "error",
//         confirmButtonText: "Okay",
//       });
//     }
//   });
// });

  