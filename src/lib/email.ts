import nodemailer from 'nodemailer'

// إنشاء transporter للـ Gmail SMTP
function createTransporter() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️ SMTP credentials not configured. Emails will not be sent.')
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

/**
 * إرسال بريد تحقق للمستخدم الجديد
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/verify-email?token=${verificationToken}`

  console.log('==============================================================')
  console.log('📧 إرسال بريد التحقق')
  console.log('==============================================================')
  console.log('إلى:', email)
  console.log('الاسم:', name)
  console.log('رابط التحقق:', verificationUrl)
  console.log('==============================================================')

  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('⚠️ Email service not configured. Check console for verification link.')
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'تفعيل حسابك - دعاء أذكاري',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e9e94 0%, #16a085 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🕌 دعاء أذكاري</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">منصة الأدعية والأذكار الإسلامية</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${name}،</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                شكراً لتسجيلك في منصة <strong>دعاء أذكاري</strong>. نحن سعداء بانضمامك إلى مجتمعنا الإسلامي.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                لإكمال التسجيل وتفعيل حسابك، يرجى الضغط على الزر أدناه:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1e9e94 0%, #16a085 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(30, 158, 148, 0.3);">
                  ✅ تفعيل الحساب
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  أو انسخ الرابط التالي وافتحه في متصفحك:
                </p>
                <p style="margin: 0;">
                  <a href="${verificationUrl}" style="color: #1e9e94; font-size: 13px; word-break: break-all;">${verificationUrl}</a>
                </p>
              </div>
              
              <!-- Important Note -->}
              <div style="background: #fef3c7; border-right: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ ملاحظة مهمة:</strong> هذا الرابط صالح لمرة واحدة فقط. بعد التفعيل، يمكنك تسجيل الدخول مباشرة.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذه الرسالة بأمان.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} دعاء أذكاري - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('✅ تم إرسال بريد التحقق بنجاح')
  } catch (error) {
    console.error('❌ فشل إرسال بريد التحقق:', error)
    throw new Error('فشل في إرسال بريد التحقق')
  }
}

/**
 * إرسال بريد إعادة تعيين كلمة المرور
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`

  console.log('==============================================================')
  console.log('🔑 إرسال رابط إعادة تعيين كلمة المرور')
  console.log('==============================================================')
  console.log('إلى:', email)
  console.log('الاسم:', name)
  console.log('رابط إعادة التعيين:', resetUrl)
  console.log('==============================================================')

  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('⚠️ Email service not configured. Check console for reset link.')
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'إعادة تعيين كلمة المرور - دعاء أذكاري',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e9e94 0%, #16a085 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🕌 دعاء أذكاري</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">منصة الأدعية والأذكار الإسلامية</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${name}،</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في منصة <strong>دعاء أذكاري</strong>.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                يرجى الضغط على الزر أدناه لإعادة تعيين كلمة المرور:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #1e9e94 0%, #16a085 100%); color: white; padding: 16px 40px; text-decoration: none; border-radius: 12px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 12px rgba(30, 158, 148, 0.3);">
                  🔑 إعادة تعيين كلمة المرور
                </a>
              </div>
              
              <!-- Alternative Link -->
              <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  أو انسخ الرابط التالي وافتحه في متصفحك:
                </p>
                <p style="margin: 0;">
                  <a href="${resetUrl}" style="color: #1e9e94; font-size: 13px; word-break: break-all;">${resetUrl}</a>
                </p>
              </div>
              
              <!-- Warning -->
              <div style="background: #fef2f2; border-right: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ تنبيه أمني:</strong> هذا الرابط صالح لمدة ساعة واحدة فقط من وقت الإرسال. بعد انتهاء المدة، ستحتاج إلى طلب رابط جديد.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك محمي ولن يتم تغيير أي شيء.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} دعاء أذكاري - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('✅ تم إرسال رابط إعادة تعيين كلمة المرور بنجاح')
  } catch (error) {
    console.error('❌ فشل إرسال رابط إعادة التعيين:', error)
    throw new Error('فشل في إرسال رابط إعادة تعيين كلمة المرور')
  }
}

/**
 * إرسال إشعار تغيير كلمة المرور
 */
export async function sendPasswordChangedEmail(
  email: string,
  name: string
): Promise<void> {
  console.log('==============================================================')
  console.log('✅ إرسال إشعار تغيير كلمة المرور')
  console.log('==============================================================')
  console.log('إلى:', email)
  console.log('الاسم:', name)
  console.log('==============================================================')

  const transporter = createTransporter()
  
  if (!transporter) {
    console.log('⚠️ Email service not configured.')
    return
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'تم تغيير كلمة المرور - دعاء أذكاري',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">✅ تم تغيير كلمة المرور</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px;">مرحباً ${name}،</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 20px 0;">
                نود إعلامك بأنه تم تغيير كلمة المرور لحسابك في منصة <strong>دعاء أذكاري</strong> بنجاح.
              </p>
              <p style="color: #4b5563; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
              </p>
              
              <!-- Security Alert -->
              <div style="background: #fef2f2; border-right: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #991b1b; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ لم تقم بهذا التغيير؟</strong><br/>
                  إذا لم تقم بتغيير كلمة المرور، يرجى الاتصال بنا فوراً على ${process.env.SMTP_USER} لتأمين حسابك.
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 10px 0;">
                هذه رسالة إشعار تلقائية من نظام دعاء أذكاري
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} دعاء أذكاري - جميع الحقوق محفوظة
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    console.log('✅ تم إرسال إشعار تغيير كلمة المرور بنجاح')
  } catch (error) {
    console.error('❌ فشل إرسال إشعار تغيير كلمة المرور:', error)
  }
}

