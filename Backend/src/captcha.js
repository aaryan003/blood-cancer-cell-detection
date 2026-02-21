import crypto from 'crypto';

const captchaStore = new Map();

// Generate simple math CAPTCHA
export const generateCaptcha = (req, res) => {
  try {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let question, answer;
    if (operation === '+') {
      question = `${num1} + ${num2}`;
      answer = num1 + num2;
    } else {
      // Ensure positive result for subtraction
      const larger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      question = `${larger} - ${smaller}`;
      answer = larger - smaller;
    }

    // Generate unique token
    const token = crypto.randomBytes(16).toString('hex');
    
    // Store CAPTCHA with 5-minute expiry
    captchaStore.set(token, {
      answer,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // Clean expired CAPTCHAs
    cleanExpiredCaptchas();

    res.json({
      success: true,
      captcha: {
        token,
        question: `What is ${question}?`
      }
    });
  } catch (error) {
    console.error('CAPTCHA generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate CAPTCHA'
    });
  }
};

// Validate CAPTCHA middleware
export const validateCaptcha = (req, res, next) => {
  try {
    const { captchaToken, captchaAnswer } = req.body;

    if (!captchaToken || !captchaAnswer) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA token and answer are required'
      });
    }

    const captchaData = captchaStore.get(captchaToken);
    
    if (!captchaData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired CAPTCHA token'
      });
    }

    // Check if CAPTCHA expired
    if (Date.now() > captchaData.expires) {
      captchaStore.delete(captchaToken);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA has expired. Please refresh and try again.'
      });
    }

    // Validate answer
    const userAnswer = parseInt(captchaAnswer);
    if (isNaN(userAnswer) || userAnswer !== captchaData.answer) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect CAPTCHA answer. Please try again.'
      });
    }

    // CAPTCHA is valid, remove it from the store
    captchaStore.delete(captchaToken);
    
    next();
  } catch (error) {
    console.error('CAPTCHA validation error:', error);
    res.status(500).json({
      success: false,
      message: 'CAPTCHA validation failed'
    });
  }
};


const cleanExpiredCaptchas = () => {
  const now = Date.now();
  for (const [token, data] of captchaStore.entries()) {
    if (now > data.expires) {
      captchaStore.delete(token);
    }
  }
};


setInterval(cleanExpiredCaptchas, 10 * 60 * 1000);