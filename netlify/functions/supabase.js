// const fetch = require("node-fetch");

// exports.handler = async function () {
//   try {
//     const SUPABASE_URL = process.env.SUPABASE_URL;
//     const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

//     const response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
//       headers: {
//         "apikey": SUPABASE_ANON_KEY,
//         "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
//       },
//     });

//     const data = await response.json();

//     return {
//       statusCode: 200,
//       body: JSON.stringify(data),
//     };
//   } catch (error) {
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ error: "Failed to fetch student data" }),
//     };
//   }
// };
