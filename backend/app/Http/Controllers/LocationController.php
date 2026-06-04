<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Driver sends their GPS location
    public function update(Request $request, $id)
    {
        $request->validate([
            'lat' => 'required|numeric|between:-90,90',
            'lng' => 'required|numeric|between:-180,180',
        ]);

        $parcel = Parcel::where('id', $id)
            ->where('delivery_man_id', auth()->id())
            ->where('status', 'out_for_delivery')
            ->first();

        if (! $parcel) {
            return response()->json(['message' => 'Parcel not found or not in delivery.'], 404);
        }

        $parcel->update([
            'driver_lat'          => $request->lat,
            'driver_lng'          => $request->lng,
            'location_updated_at' => now(),
        ]);

        return response()->json(['message' => 'Location updated.']);
    }

    // Public: client polls for driver location
    public function get($code)
    {
        $parcel = Parcel::where('tracking_code', strtoupper($code))
            ->whereNotNull('driver_lat')
            ->whereNotNull('driver_lng')
            ->first(['driver_lat', 'driver_lng', 'location_updated_at', 'status']);

        if (! $parcel) {
            return response()->json(['tracking' => false]);
        }

        // Only return location if actively delivering
        if ($parcel->status !== 'out_for_delivery') {
            return response()->json(['tracking' => false]);
        }

        return response()->json([
            'tracking'   => true,
            'lat'        => $parcel->driver_lat,
            'lng'        => $parcel->driver_lng,
            'updated_at' => $parcel->location_updated_at,
        ]);
    }
}
