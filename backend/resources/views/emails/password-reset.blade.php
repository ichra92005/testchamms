<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your DeliverIt Password</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; padding: 40px 20px; }
    .container { max-width: 560px; margin: 0 auto; }

    .header {
      background: #1a2e6e;
      border-radius: 16px 16px 0 0;
      padding: 36px 40px;
      text-align: center;
    }
    .logo { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -.5px; }
    .logo span { color: #f97316; }
    .header-sub { color: rgba(255,255,255,.7); font-size: .9rem; margin-top: 6px; }

    .body {
      background: #fff;
      padding: 40px;
      border-left: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
    }

    .icon-wrap {
      width: 64px; height: 64px; border-radius: 50%;
      background: #eff3ff; display: flex; align-items: center;
      justify-content: center; margin: 0 auto 24px; font-size: 1.8rem;
    }
    .greeting { font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; text-align: center; }
    .intro { font-size: .92rem; color: #64748b; line-height: 1.7; margin-bottom: 32px; text-align: center; }

    .cta { text-align: center; margin-bottom: 28px; }
    .cta-btn {
      display: inline-block;
      background: #f97316;
      color: #fff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 1rem;
    }

    .expiry-note {
      background: #fff7ed;
      border: 1px solid #fed7aa;
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 28px;
      font-size: .84rem;
      color: #92400e;
      text-align: center;
    }

    .fallback {
      font-size: .8rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .fallback a { color: #1a2e6e; word-break: break-all; }

    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }

    .warning { font-size: .82rem; color: #94a3b8; text-align: center; line-height: 1.6; }
    .warning strong { color: #dc2626; }

    .footer {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 16px 16px;
      padding: 20px 40px;
      text-align: center;
    }
    .footer p { font-size: .8rem; color: #94a3b8; line-height: 1.6; }
    .footer a { color: #1a2e6e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Deliver<span>It</span></div>
      <div class="header-sub">Algeria's Trusted Delivery Network</div>
    </div>

    <div class="body">
      <div class="icon-wrap">🔐</div>
      <p class="greeting">Password Reset Request</p>
      <p class="intro">
        Hi {{ $userName }}, we received a request to reset your DeliverIt account password.
        Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.
      </p>

      <div class="cta">
        <a href="{{ $resetUrl }}" class="cta-btn">Reset My Password</a>
      </div>

      <div class="expiry-note">
        ⏱ This link expires in <strong>1 hour</strong>. After that, you'll need to request a new one.
      </div>

      <p class="fallback">
        If the button above doesn't work, copy and paste this link into your browser:<br/>
        <a href="{{ $resetUrl }}">{{ $resetUrl }}</a>
      </p>

      <hr class="divider"/>

      <p class="warning">
        If you did not request a password reset, you can safely ignore this email —
        your password will <strong>not</strong> be changed.
      </p>
    </div>

    <div class="footer">
      <p>
        This is an automated message from <strong>DeliverIt Systems</strong>.<br/>
        For support, contact <a href="mailto:info@deliverit.dz">info@deliverit.dz</a>
      </p>
    </div>
  </div>
</body>
</html>
