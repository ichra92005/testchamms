<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['user_id', 'parcel_id', 'message', 'is_read'];

    protected $casts = ['is_read' => 'boolean'];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }
}
