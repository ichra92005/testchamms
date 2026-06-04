<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParcelStatusHistory extends Model
{
    protected $table = 'parcel_status_history';

    protected $fillable = [
        'parcel_id',
        'status',
        'changed_by_name',
        'note',
    ];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }
}