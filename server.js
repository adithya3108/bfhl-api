const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Your personal details - UPDATE THESE WITH YOUR INFORMATION
const USER_DETAILS = {
    full_name: "p.r.adithya", // Replace with your name in lowercase (use underscore for spaces)
    date_of_birth: "31082004", // Replace with your DOB in ddmmyyyy format
    email: "adithyapr3104@gmai.com", // Replace with your email
    roll_number: "22brs1100" // Replace with your roll number
};

// Helper function to categorize and process data
function processData(data) {
    const oddNumbers = [];
    const evenNumbers = [];
    const alphabets = [];
    const specialCharacters = [];
    let sum = 0;
    let alphabetChars = [];

    data.forEach(item => {
        const itemStr = String(item);
        
        // Check if it's a number (including multi-digit numbers)
        if (!isNaN(itemStr) && !isNaN(parseFloat(itemStr)) && itemStr.trim() !== '') {
            const num = parseInt(itemStr);
            sum += num;
            if (num % 2 === 0) {
                evenNumbers.push(itemStr);
            } else {
                oddNumbers.push(itemStr);
            }
        }
        // Check if it's purely alphabetic (single or multiple characters)
        else if (/^[a-zA-Z]+$/.test(itemStr)) {
            alphabets.push(itemStr.toUpperCase());
            // Store individual characters for concatenation (in original case)
            for (let char of itemStr) {
                alphabetChars.push(char);
            }
        }
        // Otherwise it's a special character
        else {
            specialCharacters.push(itemStr);
        }
    });

    // Create concatenation string: reverse order + alternating caps
    alphabetChars.reverse();
    let concatString = '';
    alphabetChars.forEach((char, index) => {
        if (index % 2 === 0) {
            concatString += char.toLowerCase();
        } else {
            concatString += char.toUpperCase();
        }
    });

    return {
        oddNumbers,
        evenNumbers,
        alphabets,
        specialCharacters,
        sum: sum.toString(),
        concatString
    };
}

// POST /bfhl endpoint - Main processing endpoint
app.post('/bfhl', (req, res) => {
    try {
        const { data } = req.body;

        // Validate input
        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                is_success: false,
                error: "Invalid input: 'data' must be an array"
            });
        }

        // Process the data
        const result = processData(data);

        // Create user_id in required format
        const userId = `${USER_DETAILS.full_name}_${USER_DETAILS.date_of_birth}`;

        // Send response with all required fields
        res.status(200).json({
            is_success: true,
            user_id: userId,
            email: USER_DETAILS.email,
            roll_number: USER_DETAILS.roll_number,
            odd_numbers: result.oddNumbers,
            even_numbers: result.evenNumbers,
            alphabets: result.alphabets,
            special_characters: result.specialCharacters,
            sum: result.sum,
            concat_string: result.concatString
        });

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({
            is_success: false,
            error: "Internal server error"
        });
    }
});

// GET /bfhl endpoint - Returns operation code (for testing)
app.get('/bfhl', (req, res) => {
    res.status(200).json({
        operation_code: 1
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'BFHL API'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'BFHL REST API is running',
        endpoints: {
            post: '/bfhl - Process data array',
            get: '/bfhl - Get operation code',
            health: '/health - Health check'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        is_success: false,
        error: 'Internal server error'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        is_success: false,
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 BFHL API Server is running on port ${PORT}`);
    console.log(`📝 Update USER_DETAILS with your information before deploying`);
    console.log(`🔗 Test endpoint: http://localhost:${PORT}/bfhl`);
});

module.exports = app;