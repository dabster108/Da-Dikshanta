import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required' 
    });
  }

  // Check if environment variables are set
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_MAIL || !process.env.SMTP_PASSWORD) {
    console.error('Missing SMTP environment variables');
    return res.status(500).json({
      success: false,
      message: 'Server configuration error. Please contact the administrator.',
      error: 'SMTP credentials not configured'
    });
  }

  try {
    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Email to portfolio owner
    const mailToOwner = {
      from: `"Portfolio Contact Form" <${process.env.SMTP_MAIL}>`,
      to: process.env.SMTP_MAIL,
      subject: `New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong style="color: #555;">Name:</strong> ${name}</p>
            <p><strong style="color: #555;">Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong style="color: #555;">Subject:</strong> ${subject}</p>
            <div style="margin-top: 15px;">
              <strong style="color: #555;">Message:</strong>
              <p style="background-color: white; padding: 15px; border-left: 4px solid #4CAF50; margin-top: 10px;">${message}</p>
            </div>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">This email was sent from your portfolio contact form.</p>
        </div>
      `,
    };

    // Auto-reply email to sender
    const mailToSender = {
      from: `"Dikshanta Chapagain" <${process.env.SMTP_MAIL}>`,
      to: email,
      subject: `Thank you for contacting me - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Thank You for Reaching Out!</h2>
          <div style="padding: 20px 0;">
            <p>Hi ${name},</p>
            <p>Thank you for contacting me through my portfolio. I have received your message and will get back to you as soon as possible.</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>Your message:</strong></p>
              <p style="color: #555;">${message}</p>
            </div>
            <p>Best regards,<br/>Dikshanta Chapagain</p>
          </div>
          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 20px;">
            <p style="color: #888; font-size: 12px;">
              <strong>Connect with me:</strong><br/>
              Email: dikshanta108@gmail.com<br/>
              Phone: +977 9843410777<br/>
              Location: Budhanilkantha, Kathmandu
            </p>
          </div>
        </div>
      `,
    };

    // Send both emails
    await transporter.sendMail(mailToOwner);
    await transporter.sendMail(mailToSender);

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully' 
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
}
