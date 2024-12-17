const jwt = require('jsonwebtoken');

// Token cần kiểm tra
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NDk2YTAxMmUzNDg5NDY4YWEwMmU1OSIsImVtYWlsQ3VzIjoidG9hbkBnbWFpbC5jb20iLCJwYXNzV29yZCI6IjEyMzEyMyIsInJvbGVJZHMiOlsiNjc0OTZkMjAyZTM0ODk0NjhhYTAyZTViIl0sImlhdCI6MTczNDM1MzI2MCwiZXhwIjoxNzM0MzU2ODYwfQ.64GF9S5qX8HgoJdPkOmshfBhI09Czll1m9O7VrIacKI';

// Giải mã token để lấy payload
const decoded = jwt.decode(token);

console.log(process.env.JWT_SECRET);

// Kiểm tra thời gian hết hạn
const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (Unix timestamp)
if (decoded.exp < currentTime) {
    console.log('Token đã hết hạn');
} else {
    console.log('Token hợp lệ');
}
