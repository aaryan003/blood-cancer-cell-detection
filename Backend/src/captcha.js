// Google reCAPTCHA v2 server-side verification middleware

export const validateRecaptcha = async (req, res, next) => {
  try {
    const { recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification is required'
      });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not set — skipping verification');
      return next();
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(recaptchaToken)}`,
    });

    const result = await response.json();

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.'
      });
    }

    next();
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    res.status(500).json({
      success: false,
      message: 'reCAPTCHA verification failed'
    });
  }
};
