import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize Supabase

const supabase = createClient('https://dgsipldaivnwxoyodzcw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2lwbGRhaXZud3hveW9kemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzExODEsImV4cCI6MjA1NDUwNzE4MX0.1YLPU_OhyG2CFwf8C4odEstPhL9Ico9lNYK8Lwg-AD0');
document.addEventListener('DOMContentLoaded', function() {
  const password = document.getElementById('password');
  const confirm_password = document.getElementById('confirm_password');
  const togglePassword = document.getElementById('toggle-password');
  const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
  togglePassword.addEventListener('click', function (){
    if(password.type === 'password'){
        password.type = 'text';
        document.getElementById('toggle-password').innerHTML = '<i class="bi bi-eye"></i>';
    }else{
        password.type = 'password';
        document.getElementById('toggle-password').innerHTML = '<i class="bi bi-eye-slash"></i>';
    }
  });
  toggleConfirmPassword.addEventListener('click', function (){
    if(confirm_password.type === 'password'){
        confirm_password.type = 'text';
        document.getElementById('toggle-confirm-password').innerHTML = '<i class="bi bi-eye"></i>';
    }else{
        confirm_password.type = 'password';
        document.getElementById('toggle-confirm-password').innerHTML = '<i class="bi bi-eye-slash"></i>';
    }
  })
  document.addEventListener('submit', async function(e) {
    e.preventDefault();
    const studentEmail = document.getElementById('email').value.trim();
    const matricNo = document.getElementById('matric_no').value.trim();
    const firstName = document.getElementById('first_name').value.trim();
    const lastName = document.getElementById('last_name').value.trim();
    const fullName = `${firstName} ${lastName}`;
    const course = document.querySelector('input[name="course"]:checked').value;

    const pass_value = password.value.trim();
    const confirm_pass_value = confirm_password.value.trim(); 
    if (studentEmail.slice(-10) !== "tau.edu.ng"){
      Swal.fire({
        title: "Error!",
        text: "You must signup with your school email!",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }
    if(pass_value !== confirm_pass_value){
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }
    if(pass_value.length < 6){
      Swal.fire({
        title: "Error!",
        text: "Your password must be a minimum of 6 characters",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }
    // console.log(matricNo.toUpperCase().slice(5, 8) !== "MSC")
    if (matricNo.toUpperCase().slice(5, 8) !== "MSS" && matricNo.toUpperCase().slice(5, 8) !== "MSC"){
      Swal.fire({
        title: "Error!",
        text: "Your details do not match that of a computing student. Please contact admin.",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
    }
    const signUpStudent = async (email, password, full_name, matric_no, course) => {
      // Check for email and matric number duplicates
      const { data:existingUser, error:existingUserError } = await supabase
      .from("Students")
      .select("email, matric_no")
      .or(`email.eq.${email},matric_no.eq.${matric_no}`);

      if (existingUserError) {
      Swal.fire({
        title: "Error!",
        text: "We're unable to access the server at this time. Please try again later.",
        icon: "error",
        confirmButtonText: "Okay",
      });
      return;
      }

      // Check if email or matric number already exists
      if (existingUser && existingUser.length > 0) {
      const existing = existingUser[0];

      if (existing.email === email) {
        Swal.fire({
          title: "Error!",
          text: "A user with this email already exists.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      } else if (existing.matric_no === matric_no) {
        Swal.fire({
          title: "Error!",
          text: "A user with this matric number already exists.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
      return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: "https://nacos-tau-chapter.netlify.app/student-login.html", 
          data: { matric_no: matric_no, full_name: full_name, course: course },
        }
      });
    
      if (error) {
        // console.error('Sign-up error:', error.message);
        Swal.fire({
          title: "Error!",
          text: "Signup Failed! Please try again.",
          icon: "error",
          confirmButtonText: "Okay",
        });
        return;
      } else{
        Swal.fire({
          title: "Check Your Email!",
          text: "A confirmation email has been sent. Please verify your email before logging in.",
          icon: "success",
          confirmButtonText: "Okay",
        }).then(() => {
          window.location.href = "student-login.html";
        });
      }
    };
    signUpStudent(studentEmail.toLowerCase(), confirm_password.value.trim(), fullName, matricNo.toUpperCase(), course);
  });
});

