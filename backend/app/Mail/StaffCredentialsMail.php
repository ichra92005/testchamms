<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StaffCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $staffName;
    public string $staffId;
    public string $role;
    public string $email;
    public string $setupUrl;

    public function __construct(string $staffName, string $staffId, string $role, string $email, string $setupUrl)
    {
        $this->staffName = $staffName;
        $this->staffId   = $staffId;
        $this->role      = $role;
        $this->email     = $email;
        $this->setupUrl  = $setupUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your DeliverIt Staff Account Credentials',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.staff-credentials',
        );
    }
}
