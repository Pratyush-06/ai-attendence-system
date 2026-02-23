require('dotenv').config();
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

const testTeacher = {
    teacherId: `T${Date.now()}`,
    name: 'Test Teacher',
    subjects: ['Math', 'Science'],
    password: 'password123'
};

const testStudent = {
    rollNo: `R${Date.now()}`,
    name: 'Test Student',
    dept: 'CS',
    year: 1,
    password: 'password123'
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runTests() {
    try {
        console.log('--- Starting API Tests ---\n');

        // 1. Register & Login Teacher
        console.log('1. Registering Teacher...');
        await axios.post(`${BASE_URL}/auth/teacher/register`, testTeacher);

        console.log('Logging in Teacher...');
        const teacherRes = await axios.post(`${BASE_URL}/auth/teacher/login`, {
            teacherId: testTeacher.teacherId,
            password: testTeacher.password
        });
        const teacherToken = teacherRes.data.token;
        console.log('Teacher Token generated.\n');

        // 2. Register & Login Student
        console.log('2. Registering Student...');
        await axios.post(`${BASE_URL}/auth/student/register`, testStudent);

        console.log('Logging in Student...');
        const studentRes = await axios.post(`${BASE_URL}/auth/student/login`, {
            rollNo: testStudent.rollNo,
            password: testStudent.password
        });
        const studentToken = studentRes.data.token;
        console.log('Student Token generated.\n');

        // 3. Create Session (Teacher)
        console.log('3. Creating Session...');
        const sessionRes = await axios.post(`${BASE_URL}/sessions`,
            { subject: 'Math', durationMinutes: 60 },
            { headers: { Authorization: `Bearer ${teacherToken}` } }
        );
        const { sessionId, qrCode } = sessionRes.data.session;
        console.log(`Session Created: ${sessionId}\n`);

        // Wait a bit
        await sleep(1000);

        // 4. Mark Attendance (Student)
        console.log('4. Marking Attendance (Simulating valid location)...');
        // Simulate coordinates matching the .env CAMPUS coordinates for success
        const validLat = parseFloat(process.env.CAMPUS_LAT);
        const validLng = parseFloat(process.env.CAMPUS_LNG);

        const attendanceRes = await axios.post(`${BASE_URL}/attendance/mark`,
            {
                sessionId,
                location: { lat: validLat, lng: validLng }
            },
            { headers: { Authorization: `Bearer ${studentToken}` } }
        );
        console.log('Attendance Result:', attendanceRes.data.message);

        // 5. Get Student Records
        console.log('\n5. Fetching Student Attendance Records...');
        const studentRecords = await axios.get(`${BASE_URL}/attendance/student`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log(`Found ${studentRecords.data.length} records.\n`);

        // 6. Get Session Records (Teacher)
        console.log('6. Fetching Session Records (Teacher)...');
        const sessionRecords = await axios.get(`${BASE_URL}/attendance/session/${sessionId}`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log(`Found ${sessionRecords.data.length} records for session.\n`);

        console.log('--- All Tests Passed! ---');

    } catch (error) {
        console.error('\n--- TEST FAILED ---');
        console.error(error.response ? error.response.data : error.message);
    }
}

runTests();
