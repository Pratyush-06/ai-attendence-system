const axios = require('axios');

async function testRegister() {
    try {
        const res = await axios.post('http://localhost:3000/api/auth/student/register', {
            name: "Test Student",
            rollNo: "12345",
            dept: "CSE",
            year: "3", // passing as string like frontend does
            password: "password123"
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testRegister();
