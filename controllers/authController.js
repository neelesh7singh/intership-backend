const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.SECRET, { expiresIn: '90d' });
};

// sends cookie
const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    secure: true,
    httpOnly: false,
  };
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'Success',
    data: { user },
  });
};

// SignUp controller
exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.fields;
  if (!name || !email || !password) {
    res.json({
      status: 'Failed',
      message: 'Invalid username or password',
    });
    return;
  }
  const user = await User.create({
    name: name,
    email: email,
    password: password,
  });
  sendToken(user, 201, res);
});

// LogIn controller
exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.fields;
  if (!email || !password) {
    res.json({
      status: 'Failed',
      message: 'Invalid username or password',
    });
    return;
  }

  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.comparePassword(password, user.password))) {
    res.json({
      status: 'Failed',
      message: 'Invalid username or password',
    });
    return;
  }
  sendToken(user, 200, res);
});
