<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name', 'staff_id', 'phone', 'email', 'password', 'role',
        'driver_type', 'wilaya', 'route_from', 'route_to',
    ];

    protected $hidden = ['password', 'remember_token'];
}
