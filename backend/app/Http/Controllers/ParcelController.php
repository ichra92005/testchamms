<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\ParcelStatusHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ParcelController extends Controller
{
    public function stats()
    {
        $total     = Parcel::count();
        $delivered = Parcel::whereIn('status', ['delivered', 'confirmed'])->count();
        $rate      = $total > 0 ? round(($delivered / $total) * 100, 1) : 0;
        return response()->json(['wilayas' => 69, 'delivered' => $delivered, 'successRate' => $rate]);
    }

    // Track by code
    public function track($code)
    {
        $parcel = Parcel::with('statusHistory')->where('tracking_code', strtoupper($code))->first();
        if (! $parcel) {
            return response()->json(['message' => 'Parcel not found.'], 404);
        }
        return response()->json($parcel);
    }

    // Search by phone number (public)
    public function searchByPhone(Request $request)
    {
        $request->validate(['phone' => 'required|string|min:6']);
        $phone = $request->phone;

        $parcels = Parcel::where('receiver_phone', 'like', "%{$phone}%")
            ->orWhere('sender_phone', 'like', "%{$phone}%")
            ->latest()
            ->get(['id', 'tracking_code', 'status', 'receiver_name', 'sender_name',
                   'origin_wilaya', 'destination_wilaya', 'pickup_location', 'destination',
                   'payment_method', 'created_at', 'updated_at']);

        if ($parcels->isEmpty()) {
            return response()->json(['message' => 'No parcels found for this phone number.'], 404);
        }

        return response()->json($parcels);
    }

    // Confirm reception
    public function confirmReception(Request $request, $id)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $parcel = Parcel::findOrFail($id);

        if ($parcel->status !== 'delivered') {
            return response()->json(['message' => 'Parcel is not in delivered status.'], 422);
        }
        if ($parcel->confirmed_at) {
            return response()->json(['message' => 'Reception already confirmed.'], 422);
        }

        $parcel->update([
            'status'         => 'confirmed',
            'rating'         => $request->rating,
            'rating_comment' => $request->comment,
            'confirmed_at'   => now(),
        ]);

        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'confirmed',
            'changed_by_name' => 'Client',
            'note'            => 'Reception confirmed by client. Rating: ' . $request->rating . '/5',
        ]);

        return response()->json($parcel);
    }

    public function index()
    {
        return response()->json(Parcel::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'sender_name'      => ['required', 'string', 'min:3', 'regex:/^[\pL\s\-\']+$/u'],
            'sender_phone'     => ['required', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
            'pickup_location'  => 'required|string',
            'receiver_name'    => ['required', 'string', 'min:3', 'regex:/^[\pL\s\-\']+$/u'],
            'receiver_phone'   => ['required', 'string', 'regex:/^(\+213|0)[\d\s]{7,12}$/'],
            'destination'      => 'required|string',
            'delivery_address' => 'nullable|string',
            'description'      => 'nullable|string|max:200',
            'weight'           => 'nullable|numeric|min:0.01|max:999',
            'payment_method'   => 'required|in:cash,online',
        ], [
            'sender_name.min'      => 'Sender name must be at least 3 characters.',
            'sender_name.regex'    => 'Sender name must contain letters only.',
            'sender_phone.regex'   => 'Please enter a valid Algerian phone number for sender.',
            'receiver_name.min'    => 'Receiver name must be at least 3 characters.',
            'receiver_name.regex'  => 'Receiver name must contain letters only.',
            'receiver_phone.regex' => 'Please enter a valid Algerian phone number for receiver.',
            'description.max'      => 'Description cannot exceed 200 characters.',
            'weight.min'           => 'Weight must be greater than 0.',
            'weight.max'           => 'Weight cannot exceed 999 kg.',
        ]);

        $originWilaya = explode(' - ', $request->pickup_location)[0];
        $destWilaya   = explode(' - ', $request->destination)[0];
        $deliveryType = $originWilaya === $destWilaya ? 'intra' : 'inter';

        $parcel = Parcel::create([
            'tracking_code'      => 'DZ-' . date('Y') . '-' . strtoupper(Str::random(6)),
            'sender_name'        => $request->sender_name,
            'sender_phone'       => $request->sender_phone,
            'origin_wilaya'      => $originWilaya,
            'pickup_location'    => $request->pickup_location,
            'receiver_name'      => $request->receiver_name,
            'receiver_phone'     => $request->receiver_phone,
            'destination_wilaya' => $destWilaya,
            'destination'        => $request->destination,
            'delivery_address'   => $request->delivery_address,
            'description'        => $request->description,
            'weight'             => $request->weight,
            'payment_method'     => $request->payment_method,
            'delivery_type'      => $deliveryType,
            'status'             => 'pending',
            'created_by'         => auth()->id(),
        ]);

        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'pending',
            'changed_by_name' => auth()->user()->name,
            'note'            => 'Parcel registered by agent',
        ]);

        return response()->json($parcel, 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status'          => 'required|in:pending,registered,assigned,accepted,refused,out_for_delivery,delivered,failed,confirmed',
            'failure_reason'  => 'nullable|string|max:500',
            'refusal_reason'  => 'nullable|string|max:500',
        ]);

        $parcel = Parcel::findOrFail($id);

        // Driver refusal — revert to registered so agent can reassign
        if ($request->status === 'refused') {
            $reason = $request->refusal_reason ?? 'No reason provided';

            $parcel->update([
                'status'          => 'registered',
                'refusal_reason'  => $reason,
                'delivery_man_id' => null,
            ]);

            ParcelStatusHistory::create([
                'parcel_id'       => $parcel->id,
                'status'          => 'refused',
                'changed_by_name' => auth()->user()->name,
                'note'            => 'Refused by driver: ' . $reason,
            ]);

            if ($parcel->created_by) {
                \App\Models\Notification::create([
                    'user_id'   => $parcel->created_by,
                    'parcel_id' => $parcel->id,
                    'message'   => 'Driver ' . auth()->user()->name . ' refused parcel ' . $parcel->tracking_code . ': ' . $reason,
                    'is_read'   => false,
                ]);
            }

            return response()->json($parcel->fresh());
        }

        $parcel->update([
            'status'         => $request->status,
            'failure_reason' => $request->failure_reason ?? $parcel->failure_reason,
        ]);

        $note = $request->failure_reason ? 'Reason: ' . $request->failure_reason : null;

        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => $request->status,
            'changed_by_name' => auth()->user()->name,
            'note'            => $note,
        ]);

        return response()->json($parcel);
    }

    public function assign(Request $request, $id)
    {
        $request->validate(['delivery_man_id' => 'required|exists:users,id']);
        $parcel = Parcel::findOrFail($id);
        $parcel->update([
            'delivery_man_id' => $request->delivery_man_id,
            'status'          => 'assigned',
        ]);

        $driver = \App\Models\User::find($request->delivery_man_id);
        ParcelStatusHistory::create([
            'parcel_id'       => $parcel->id,
            'status'          => 'assigned',
            'changed_by_name' => auth()->user()->name,
            'note'            => 'Assigned to driver: ' . ($driver->name ?? ''),
        ]);

        return response()->json($parcel);
    }

    public function driverParcels()
    {
        $parcels = Parcel::where('delivery_man_id', auth()->id())->latest()->get();
        return response()->json($parcels);
    }
}
