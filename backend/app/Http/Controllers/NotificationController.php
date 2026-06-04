<?php

namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->with('parcel:id,tracking_code')
            ->latest()
            ->get();

        return response()->json($notifications);
    }

    public function markRead($id)
    {
        $notification = Notification::where('user_id', auth()->id())->findOrFail($id);
        $notification->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read.']);
    }
}
