<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function drivers(Request $request)
    {
        try {
            $parcelId = $request->query('parcel_id');

            if ($parcelId) {
                $parcel = \App\Models\Parcel::find($parcelId);

                if ($parcel) {
                    $origin = explode(' - ', $parcel->origin_wilaya ?? $parcel->pickup_location ?? '')[0];
                    $dest   = explode(' - ', $parcel->destination_wilaya ?? $parcel->destination ?? '')[0];

                    $origin = trim($origin);
                    $dest   = trim($dest);

                    $isInter = $origin !== $dest;

                    if ($isInter) {
                        $drivers = User::where('role', 'driver')
                            ->where('driver_type', 'inter')
                            ->where(function ($q) use ($origin, $dest) {
                                $q->where(function ($q2) use ($origin, $dest) {
                                    $q2->where('route_from', $origin)
                                       ->where('route_to', $dest);
                                })->orWhere(function ($q2) use ($origin, $dest) {
                                    $q2->where('route_from', $dest)
                                       ->where('route_to', $origin);
                                });
                            })->get();
                    } else {
                        $drivers = User::where('role', 'driver')
                            ->where('driver_type', 'intra')
                            ->where('wilaya', $origin)
                            ->get();
                    }

                    return response()->json($drivers);
                }
            }

            return response()->json(User::where('role', 'driver')->get());
        } catch (\Throwable $e) {
            Log::error('drivers() failed', [
                'parcel_id' => $request->query('parcel_id'),
                'error'     => $e->getMessage(),
                'trace'     => $e->getTraceAsString(),
            ]);

            return response()->json(['message' => 'Failed to fetch drivers: ' . $e->getMessage()], 500);
        }
    }
}
