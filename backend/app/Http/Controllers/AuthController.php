<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Mail\StaffCredentialsMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate(['password' => 'required']);

        if ($request->has('staffId')) {
            $user = User::where('staff_id', $request->staffId)->first();
        } else {
            $request->validate(['email' => 'required|email']);
            $user = User::where('email', $request->email)->first();
        }

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'credentials' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token'       => $token,
            'role'        => $user->role,
            'name'        => $user->name,
            'phone'       => $user->phone,
            'email'       => $user->email,
            'driver_type' => $user->driver_type,
            'wilaya'      => $user->wilaya,
            'route_from'  => $user->route_from,
            'route_to'    => $user->route_to,
        ]);
    }

    public function register(Request $request)
    {
        $isStaff = $request->has('staffId');

        if ($isStaff) {
            $request->validate([
                'name'        => ['required', 'string', 'min:3', 'max:255', 'regex:/^[\pL\s\-\']+$/u'],
                'staffId'     => ['required', 'string', 'regex:/^[A-Za-z]{2}-\d{3}$/', 'unique:users,staff_id'],
                'phone'       => ['required', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
                'email'       => 'required|email|unique:users',
                'password'    => ['required', 'min:8', 'regex:/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/'],
                'role'        => 'required|in:admin,agency,driver',
                'driver_type' => 'nullable|in:intra,inter',
                'wilaya'      => 'nullable|string',
                'route_from'  => 'nullable|string',
                'route_to'    => 'nullable|string',
            ], [
                'name.min'       => 'Name must be at least 3 characters.',
                'name.regex'     => 'Name must contain letters only, no numbers or special characters.',
                'staffId.regex'  => 'Staff ID must follow format: AG-001, DR-001 or AD-001.',
                'phone.regex'    => 'Please enter a valid Algerian phone number (e.g. 0555 000 000).',
                'password.regex' => 'Password must contain at least one letter and one number.',
            ]);

            $user = User::create([
                'name'        => $request->name,
                'staff_id'    => $request->staffId,
                'phone'       => $request->phone,
                'email'       => $request->email,
                'password'    => Hash::make($request->password),
                'role'        => $request->role,
                'driver_type' => $request->driver_type,
                'wilaya'      => $request->wilaya,
                'route_from'  => $request->route_from,
                'route_to'    => $request->route_to,
            ]);

            // Generate a 48-hour setup link so staff can set their own password
            $setupUrl = $this->generateResetToken($request->email, hours: 48);

            try {
                Mail::to($request->email)->send(new StaffCredentialsMail(
                    staffName: $request->name,
                    staffId:   $request->staffId,
                    role:      $request->role,
                    email:     $request->email,
                    setupUrl:  $setupUrl,
                ));
            } catch (\Exception $e) {
                \Log::warning('Failed to send staff credentials email: ' . $e->getMessage());
            }

        } else {
            $request->validate([
                'name'     => ['required', 'string', 'min:3', 'max:255', 'regex:/^[\pL\s\-\']+$/u'],
                'phone'    => ['required', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
                'email'    => 'required|email|unique:users',
                'password' => ['required', 'min:8', 'regex:/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/'],
            ], [
                'name.min'       => 'Name must be at least 3 characters.',
                'name.regex'     => 'Name must contain letters only, no numbers or special characters.',
                'phone.regex'    => 'Please enter a valid Algerian phone number (e.g. 0555 000 000).',
                'password.regex' => 'Password must contain at least one letter and one number.',
            ]);

            $user = User::create([
                'name'     => $request->name,
                'phone'    => $request->phone,
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'role'     => 'client',
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token'       => $token,
            'role'        => $user->role,
            'name'        => $user->name,
            'phone'       => $user->phone,
            'email'       => $user->email,
            'driver_type' => $user->driver_type,
            'wilaya'      => $user->wilaya,
            'route_from'  => $user->route_from,
            'route_to'    => $user->route_to,
        ], 201);
    }

    // Sends a password reset email. Always returns 200 to prevent email enumeration.
    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $resetUrl = $this->generateResetToken($request->email, hours: 1);

            try {
                Mail::to($user->email)->send(new PasswordResetMail($user->name, $resetUrl));
            } catch (\Exception $e) {
                \Log::warning('Failed to send password reset email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'If an account with that email exists, a reset link has been sent.',
        ]);
    }

    // Validates the reset token and saves the new password.
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'token'                 => 'required|string',
            'password'              => 'required|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', hash('sha256', $request->token))
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        if (now()->isAfter($record->expires_at)) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'This reset link has expired. Please request a new one.'], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid reset link.'], 422);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Password updated successfully.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'phone'       => $user->phone,
            'staff_id'    => $user->staff_id,
            'role'        => $user->role,
            'driver_type' => $user->driver_type,
            'wilaya'      => $user->wilaya,
            'route_from'  => $user->route_from,
            'route_to'    => $user->route_to,
            'created_at'  => $user->created_at,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name'                  => ['required', 'string', 'min:3', 'max:255', 'regex:/^[\pL\s\-\']+$/u'],
            'phone'                 => ['nullable', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
            'password'              => ['nullable', 'min:8', 'confirmed', 'regex:/^(?=.*[a-zA-Z])(?=.*[0-9]).+$/'],
            'password_confirmation' => 'nullable',
        ], [
            'name.min'       => 'Name must be at least 3 characters.',
            'name.regex'     => 'Name must contain letters only, no numbers or special characters.',
            'phone.regex'    => 'Please enter a valid Algerian phone number (e.g. 0555 000 000).',
            'password.regex' => 'Password must contain at least one letter and one number.',
        ]);

        $user = auth()->user();
        $user->name  = $request->name;
        $user->phone = $request->phone ?? $user->phone;
        if ($request->password) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json(['message' => 'Profile updated.', 'name' => $user->name, 'phone' => $user->phone]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out.']);
    }

    // Generates a hashed reset token, stores it, and returns the full frontend URL.
    private function generateResetToken(string $email, int $hours = 1): string
    {
        $plainToken = Str::random(64);

        // Replace any existing token for this email (primary key = email)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => hash('sha256', $plainToken),
                'expires_at' => now()->addHours($hours),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        return $frontendUrl . '?reset_token=' . $plainToken . '&email=' . urlencode($email);
    }
}
