<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use Illuminate\Http\Request;

class PaymentProofController extends Controller
{
    // Client uploads payment proof (public — no auth needed)

public function upload(Request $request, $code)
{
    $request->validate([
        'proof' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
    ]);

    $parcel = Parcel::where('tracking_code', strtoupper($code))->first();

    if (! $parcel) {
        return response()->json(['message' => 'Parcel not found.'], 404);
    }

    if ($parcel->payment_method !== 'online') {
        return response()->json(['message' => 'Payment proof only required for online payment.'], 422);
    }

    $path = $request->file('proof')->store('payment-proofs', 'public');
    $parcel->update(['payment_proof' => $path]);

    return response()->json([
        'message'       => 'Payment proof uploaded successfully.',
        'payment_proof' => $path,
    ]);
}




    // Agent views payment proof
    public function show($id)
    {
        $parcel = Parcel::findOrFail($id);

        if (! $parcel->payment_proof) {
            return response()->json(['message' => 'No payment proof uploaded.'], 404);
        }

        return response()->json([
            'url' => asset('storage/' . $parcel->payment_proof),
        ]);
    }
}
