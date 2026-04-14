// import { createClient } from "@supabase/supabase-js";

// export async function handler(event) {
//   if (event.httpMethod !== "POST") {
//     return { statusCode: 405, body: JSON.stringify({ error: "Method Not Allowed" }) };
//   }

//   try {
//     const requestBody = JSON.parse(event.body || "{}"); // Handle empty body case safely
//     const { email, password } = requestBody;

//     if (!email || !password) {
//       return { statusCode: 400, body: JSON.stringify({ error: "Missing email or password" }) };
//     }

//     // Initialize Supabase client
//     const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

//     // Attempt to sign in
//     const { data, error } = await supabase.auth.signInWithPassword({ email, password });

//     if (error || !data.user) {
//       return { statusCode: 401, body: JSON.stringify({ error: error?.message || "Login failed" }) };
//     }

//     const user = data.user;

//     // Check if user exists in "Students" table
//     const { data: existingStudent, error: checkError } = await supabase
//       .from("Students")
//       .select("*")
//       .eq("email", user.email)
//       .single();

//     if (checkError && checkError.code !== "PGRST116") {
//       return { statusCode: 500, body: JSON.stringify({ error: "Error checking user data" }) };
//     }

//     // If the student doesn't exist, insert their data
//     if (!existingStudent) {
//       const userMeta = user.user_metadata || {};
//       const { error: insertError } = await supabase.from("Students").insert([
//         {
//           matric_no: userMeta.matric_no || "N/A",
//           name: userMeta.full_name || "Unknown",
//           course: userMeta.course || "Not Assigned",
//           email: user.email,
//           id: user.id,
//         },
//       ]);

//       if (insertError) {
//         return { statusCode: 500, body: JSON.stringify({ error: "Failed to save student data" }) };
//       }
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ success: true, message: "Login successful", user }),
//     };
//   } catch (error) {
//     console.error("Server error:", error);
//     return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
//   }
// }
