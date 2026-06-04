<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your DeliverIt Staff Account</title>
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

    .greeting { font-size: 1.15rem; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
    .intro { font-size: .92rem; color: #64748b; line-height: 1.7; margin-bottom: 28px; }

    .staff-id-highlight {
      background: #1a2e6e;
      color: #fff;
      padding: 16px 24px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 28px;
    }
    .staff-id-label { font-size: .78rem; color: rgba(255,255,255,.7); margin-bottom: 6px; }
    .staff-id-value { font-size: 1.8rem; font-weight: 800; letter-spacing: 4px; color: #f97316; }

    .credentials-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 28px;
    }
    .credentials-title {
      font-size: .78rem;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: .08em;
      text-transform: uppercase;
      margin-bottom: 18px;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .credential-row:last-child { border-bottom: none; }
    .credential-label { font-size: .82rem; color: #94a3b8; font-weight: 500; }
    .credential-value { font-size: .92rem; font-weight: 700; color: #1e293b; }

    .setup-box {
      background: #f0fdf4;
      border: 1.5px solid #bbf7d0;
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 28px;
      text-align: center;
    }
    .setup-box-title { font-size: .84rem; font-weight: 700; color: #166534; margin-bottom: 8px; }
    .setup-box-sub { font-size: .82rem; color: #15803d; line-height: 1.6; margin-bottom: 18px; }

    .cta { text-align: center; margin-bottom: 28px; }
    .cta-btn {
      display: inline-block;
      background: #f97316;
      color: #fff;
      text-decoration: none;
      padding: 14px 36px;
      border-radius: 10px;
      font-weight: 700;
      font-size: .95rem;
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

    .fallback { font-size: .8rem; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
    .fallback a { color: #1a2e6e; word-break: break-all; }

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
      <p class="greeting">Welcome to DeliverIt, {{ $staffName }}!</p>
      <p class="intro">
        Your staff account has been created on the <strong>DeliverIt</strong> delivery management platform.
        Your Staff ID is shown below. Click the button to set your own password and activate your account.
      </p>

      <!-- Staff ID -->
      <div class="staff-id-highlight">
        <div class="staff-id-label">YOUR STAFF ID</div>
        <div class="staff-id-value">{{ $staffId }}</div>
      </div>

      <!-- Account details (no password shown) -->
      <div class="credentials-box">
        <div class="credentials-title">Account Details</div>
        <div class="credential-row">
          <span class="credential-label">Full Name</span>
          <span class="credential-value">{{ $staffName }}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Role</span>
          <span class="credential-value" style="text-transform: capitalize;">{{ $role }}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Email</span>
          <span class="credential-value">{{ $email }}</span>
        </div>
      </div>

      <!-- Password setup CTA -->
      <div class="setup-box">
        <div class="setup-box-title">✅ One last step — set your password</div>
        <div class="setup-box-sub">
          Click the button below to create your own secure password.<br/>
          You will use your <strong>Staff ID</strong> + this password to log in.
        </div>
      </div>

      <div class="cta">
        <a href="{{ $setupUrl }}" class="cta-btn">Set My Password</a>
      </div>

      <div class="expiry-note">
        ⏱ This setup link expires in <strong>48 hours</strong>. If it expires, ask your administrator to resend it.
      </div>

      <p class="fallback">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="{{ $setupUrl }}">{{ $setupUrl }}</a>
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
