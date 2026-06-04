<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Parcel extends Model
{
    protected $fillable = [
        'tracking_code',
        'sender_name', 'sender_phone', 'origin_wilaya',
        'receiver_name', 'receiver_phone', 'destination_wilaya',
        'delivery_address', 'description', 'weight',
        'status', 'payment_method', 'delivery_type',
        'pickup_location', 'destination',
        'failure_reason', 'refusal_reason',
        'rating', 'rating_comment', 'confirmed_at',
        'created_by', 'delivery_man_id',
        'payment_proof',
        'driver_lat', 'driver_lng', 'location_updated_at',
    ];

    protected $casts = [
        'confirmed_at'        => 'datetime',
        'location_updated_at' => 'datetime',
        'driver_lat'          => 'float',
        'driver_lng'          => 'float',
    ];

    public function deliveryMan()
    {
        return $this->belongsTo(User::class, 'delivery_man_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function statusHistory()
    {
        return $this->hasMany(ParcelStatusHistory::class)->orderBy('created_at', 'asc');
    }
}
