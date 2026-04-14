const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

exports.handler = async function (event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        const { name, email, matric_no, course, department } = JSON.parse(event.body || '{}');

        if (!name || !email || !matric_no || !course) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields: name, email, matric_no, course' })
            };
        }

        const studentData = {
            name,
            email: email.toLowerCase(),
            matric_no: matric_no.toUpperCase(),
            course,
            department: department || null
        };

        const response = await fetch(`${supabaseUrl}/rest/v1/Students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(studentData)
        });

        if (response.status === 409) {
            return {
                statusCode: 409,
                body: JSON.stringify({ error: 'Student with this email or matric number already exists' })
            };
        }

        if (response.status === 201) {
            const data = await response.json();
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Student registered successfully', data })
            };
        }

        const errorData = await response.json();
        return {
            statusCode: response.status,
            body: JSON.stringify({ error: errorData.message || 'Failed to register student' })
        };

    } catch (error) {
        console.error('Error registering student:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};