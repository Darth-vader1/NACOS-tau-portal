import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = "https://dgsipldaivnwxoyodzcw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2lwbGRhaXZud3hveW9kemN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg5MzExODEsImV4cCI6MjA1NDUwNzE4MX0.1YLPU_OhyG2CFwf8C4odEstPhL9Ico9lNYK8Lwg-AD0";

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ticketFrame = document.getElementById("ticket-frame");
const homeBtn = document.getElementById("home-btn");
document.addEventListener("DOMContentLoaded", ()=> {
    const fetchUser = async () => {
        const { data: user, error } = await supabase.auth.getUser();

        if(error){
            Swal.fire({
                title: "Error!",
                text: "You're not authenticated. Please signin.",
                icon: "error",
                confirmButtonText: "Okay",
            }).then(()=>{
                window.location.href = "student-login.html";
            })
            return;
        }
        homeBtn.style.display = "flex";
        const { data: ticket, error: fetchError } = await supabase
        .from("Event_Tickets")
        .select("*")
        .eq("name", "Unwind and Connect")
        .single();
        if(fetchError){
            Swal.fire({
                title: "Error!",
                text: "Error fetching ticket. Please try again.",
                icon: "error",
                confirmButtonText: "Okay",
            });
            return;
        }
        ticketFrame.src = ticket.ticket;
    }
    fetchUser();
    homeBtn.addEventListener("click", ()=>{
        window.location.href = "student-dashboard.html"
    })
})