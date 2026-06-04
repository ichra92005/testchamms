<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(User::latest()->get());
    }

    public function show($id)
    {
        return response()->json(User::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'        => ['required', 'string', 'min:3', 'max:255', 'regex:/^[\pL\s\-\']+$/u'],
            'phone'       => ['nullable', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
            'email'       => ['required', 'email', Rule::unique('users', 'email')->where(fn ($q) => $q->where('role', $request->role))->ignore($id)],
            'role'        => 'required|in:admin,agency,driver,client',
            'driver_type' => 'nullable|in:intra,inter',
            'wilaya'      => 'nullable|string',
            'route_from'  => 'nullable|string',
            'route_to'    => 'nullable|string',
        ], [
            'name.min'    => 'Name must be at least 3 characters.',
            'name.regex'  => 'Name must contain letters only, no numbers or special characters.',
            'phone.regex' => 'Please enter a valid Algerian phone number (e.g. 0555 000 000).',
        ]);

        $user->update($request->only(['name', 'phone', 'email', 'role', 'driver_type', 'wilaya', 'route_from', 'route_to']));

        return response()->json(['message' => 'User updated.', 'user' => $user->fresh()]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account.'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'User deleted.']);
    }

    public function sidebarCounts()
    {
        return response()->json([
            'activeParcels' => DB::table('parcels')
                ->whereIn('status', ['pending', 'registered', 'assigned', 'out_for_delivery'])
                ->count(),
            'totalClients' => User::where('role', 'client')->count(),
            'totalStaff'   => User::whereIn('role', ['admin', 'agency', 'driver'])->count(),
        ]);
    }
}
