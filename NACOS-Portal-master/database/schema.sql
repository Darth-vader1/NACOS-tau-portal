-- =====================================================
-- NACOS Platform Database Schema
-- Phase 1: Foundation
-- =====================================================

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: students
-- Stores student profile information
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    matric_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    course VARCHAR(100) NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: admin_users
-- Stores admin user information
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: resource_categories
-- Categories for organizing resources
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: past_questions
-- Stores past examination questions
-- =====================================================
CREATE TABLE IF NOT EXISTS past_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    uploaded_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: timetables
-- Stores academic timetables (latest version only)
-- =====================================================
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type VARCHAR(20) NOT NULL,
    version VARCHAR(50) NOT NULL,
    is_current BOOLEAN DEFAULT true,
    uploaded_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: academic_resources
-- Stores links and references to academic resources
-- =====================================================
CREATE TABLE IF NOT EXISTS academic_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100),
    uploaded_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Table: career_paths
-- Stores career path guides
-- =====================================================
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT,
    skills_required TEXT[],
    tools_technologies TEXT[],
    learning_roadmap JSONB,
    external_resources JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE past_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

-- Students table policies
CREATE POLICY "Students can view all student profiles" ON students
    FOR SELECT USING (true);

CREATE POLICY "Students can update own profile" ON students
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile" ON students
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin users table policies
CREATE POLICY "Admins can view all admin users" ON admin_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid() AND role = 'super_admin'
        )
    );

-- Resource categories policies
CREATE POLICY "Anyone can view resource categories" ON resource_categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage resource categories" ON resource_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Past questions policies
CREATE POLICY "Anyone can view past questions" ON past_questions
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage past questions" ON past_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Timetables policies
CREATE POLICY "Anyone can view current timetables" ON timetables
    FOR SELECT USING (is_current = true);

CREATE POLICY "Admins can manage timetables" ON timetables
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Academic resources policies
CREATE POLICY "Anyone can view academic resources" ON academic_resources
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage academic resources" ON academic_resources
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Career paths policies
CREATE POLICY "Anyone can view career paths" ON career_paths
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage career paths" ON career_paths
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Functions
-- =====================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_past_questions_updated_at
    BEFORE UPDATE ON past_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timetables_updated_at
    BEFORE UPDATE ON timetables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_resources_updated_at
    BEFORE UPDATE ON academic_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_paths_updated_at
    BEFORE UPDATE ON career_paths
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Initial Data: Resource Categories
-- =====================================================
INSERT INTO resource_categories (name, description) VALUES
    ('Programming', 'Programming languages and development resources'),
    ('Database', 'Database design and management resources'),
    ('Networking', 'Computer networking and security resources'),
    ('Mathematics', 'Mathematics for computing students'),
    ('Web Development', 'Frontend and backend web development'),
    ('AI/ML', 'Artificial Intelligence and Machine Learning resources')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Initial Data: Career Paths
-- =====================================================
INSERT INTO career_paths (path_key, title, overview, skills_required, tools_technologies) VALUES
    ('backend', 'Backend Engineering',
     'Backend engineers focus on server-side logic, databases, and API development.',
     ARRAY['Problem Solving', 'Database Design', 'API Development', 'Server Management', 'Security'],
     ARRAY['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS']
    ),
    ('frontend', 'Frontend Development',
     'Frontend developers create the user interface and experience of web and mobile applications.',
     ARRAY['HTML/CSS', 'JavaScript', 'UI/UX Design', 'Responsive Design', 'Framework Proficiency'],
     ARRAY['React', 'Vue.js', 'Angular', 'TypeScript', 'Tailwind CSS', 'Next.js']
    ),
    ('graphics', 'Graphics Design',
     'Graphics designers create visual content and branding materials.',
     ARRAY['Visual Design', 'Typography', 'Color Theory', 'Layout Design', 'Animation'],
     ARRAY['Adobe Photoshop', 'Illustrator', 'Figma', 'After Effects', 'Blender']
    ),
    ('cybersecurity', 'Cybersecurity',
     'Cybersecurity professionals protect systems and data from digital attacks.',
     ARRAY['Network Security', 'Ethical Hacking', 'Risk Assessment', 'Incident Response', 'Cryptography'],
     ARRAY['Kali Linux', 'Wireshark', 'Metasploit', 'Burp Suite', 'Python', 'NIST Framework']
    ),
    ('aiml', 'AI/Machine Learning',
     'AI/ML engineers build intelligent systems that learn and make predictions.',
     ARRAY['Python', 'Statistics', 'Machine Learning Algorithms', 'Deep Learning', 'Data Analysis'],
     ARRAY['TensorFlow', 'PyTorch', 'scikit-learn', 'Keras', 'Pandas', 'NumPy']
    )
ON CONFLICT (path_key) DO NOTHING;

-- =====================================================
-- Phase 3: Events & Payments
-- =====================================================

-- Table: events
-- Stores event information
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) DEFAULT 'general',
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(255),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    requires_payment BOOLEAN DEFAULT false,
    payment_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_details TEXT,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: event_registrations
-- Stores student event registrations
-- =====================================================
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_status VARCHAR(20) DEFAULT 'pending',
    payment_reference VARCHAR(100),
    ticket_number VARCHAR(50) UNIQUE,
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, student_id)
);

-- Table: payment_verification
-- Stores payment verification requests
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_proof_url TEXT,
    payment_date DATE NOT NULL,
    payment_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    verified_by UUID REFERENCES admin_users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RLS Policies for Events
-- =====================================================
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verification ENABLE ROW LEVEL SECURITY;

-- Events table policies
CREATE POLICY "Anyone can view active events" ON events
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Event registrations policies
CREATE POLICY "Anyone can view their own registrations" ON event_registrations
    FOR SELECT USING (student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

CREATE POLICY "Students can register for events" ON event_registrations
    FOR INSERT WITH CHECK (student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

CREATE POLICY "Students can cancel their registration" ON event_registrations
    FOR DELETE USING (student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage registrations" ON event_registrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- Payment verification policies
CREATE POLICY "Students can view their own payments" ON payment_verification
    FOR SELECT USING (student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

CREATE POLICY "Students can submit payment verification" ON payment_verification
    FOR INSERT WITH CHECK (student_id IN (
        SELECT id FROM students WHERE user_id = auth.uid()
    ));

CREATE POLICY "Admins can view all payments" ON payment_verification
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage payments" ON payment_verification
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE user_id = auth.uid()
        )
    );

-- =====================================================
-- Triggers for updated_at
-- =====================================================
CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_verification_updated_at
    BEFORE UPDATE ON payment_verification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();