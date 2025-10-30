// controllers/auth_control.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');
const { getSignedUrl } = require('../src/services/s3Service');
const { JWT_SECRET } = require('../middleware/auth');

// Show login/register page
exports.showLoginPage = (req, res) => {
    res.render('login_register');
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, nickname, email, phone, password, confirm_password } = req.body;
        console.log(await bcrypt.hash(password, 10));
        // Validation
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields (First name, Last name, Email, Password)' 
            });
        }

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Passwords do not match' 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already registered' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user (default role is customer)
        const newUser = await User.create({
            first_name,
            last_name,
            nickname: nickname || null,
            email,
            phone: phone || null,
            password: hashedPassword,
            role: 'customer',
            is_suspended: false
        });

        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: newUser.user_id, 
                email: newUser.email, 
                role: newUser.role,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                profile_image: newUser.profile_image || null
            },
            JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        // Set cookie. Use secure flag when request is over HTTPS (handles proxies/load-balancers)
        const secureFlag = req.secure || (req.headers && req.headers['x-forwarded-proto'] === 'https') || (process.env.NODE_ENV === 'production' && process.env.FORCE_SECURE === 'true');
        res.cookie('token', token, {
            httpOnly: true,
            secure: secureFlag,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ 
            success: true, 
            message: 'Registration successful',
            user: {
                user_id: newUser.user_id,
                email: newUser.email,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide email and password' 
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Check if user is suspended
        if (user.is_suspended) {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been suspended. Please contact support.' 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }

        // Get employee info if user is staff
        let employee_id = null;
        if (user.role === 'staff') {
            const employee = await Employee.findOne({ where: { user_id: user.user_id } });
            if (employee) {
                employee_id = employee.employee_id;
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                email: user.email, 
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                employee_id: employee_id,
                profile_image: user.profile_image || null
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Set cookie. Use secure flag when request is over HTTPS (handles proxies/load-balancers)
        const secureFlag = req.secure || (req.headers && req.headers['x-forwarded-proto'] === 'https') || (process.env.NODE_ENV === 'production' && process.env.FORCE_SECURE === 'true');
        res.cookie('token', token, {
            httpOnly: true,
            secure: secureFlag,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(200).json({ 
            success: true, 
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                employee_id: employee_id
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
};

// Logout user
exports.logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ 
        success: true, 
        message: 'Logout successful' 
    });
};

// Get current user info
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ['user_id', 'first_name', 'last_name', 'nickname', 'email', 'phone', 'role', 'profile_image']
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // If profile_image exists, add a signed URL for the client to use
        let userObj = user ? user.toJSON() : null;
        if (userObj && userObj.profile_image) {
            try {
                userObj.profile_image_url = getSignedUrl(userObj.profile_image, 60 * 60 * 24 * 7); // 7 days
            } catch (e) {
                console.error('Error creating signed url:', e);
                userObj.profile_image_url = null;
            }
        }

        res.status(200).json({ 
            success: true, 
            user: userObj 
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
};
