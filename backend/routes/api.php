<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ParcelController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\PaymentProofController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NotificationController;

// Public
Route::get('/stats',                              [ParcelController::class,      'stats']);
Route::get('/parcels/track/{code}',               [ParcelController::class,      'track']);
Route::post('/parcels/search-by-phone',           [ParcelController::class,      'searchByPhone']);
Route::post('/parcels/{id}/confirm-reception',    [ParcelController::class,      'confirmReception']);
Route::post('/parcels/{code}/payment-proof',      [PaymentProofController::class,'upload']);
Route::get('/parcels/{code}/location',            [LocationController::class,    'get']);

// Auth
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout',      [AuthController::class, 'logout']);
    Route::get('/auth/me',           [AuthController::class, 'me']);
    Route::patch('/auth/profile',    [AuthController::class, 'updateProfile']);

    Route::get('/parcels',               [ParcelController::class, 'index']);
    Route::post('/parcels',              [ParcelController::class, 'store']);
    Route::patch('/parcels/{id}/status', [ParcelController::class, 'updateStatus']);
    Route::patch('/parcels/{id}/assign', [ParcelController::class, 'assign']);

    Route::get('/driver/parcels',             [ParcelController::class,      'driverParcels']);
    Route::post('/parcels/{id}/location',     [LocationController::class,    'update']);
    Route::get('/users/drivers',              [UserController::class,        'drivers']);
    Route::get('/parcels/{id}/payment-proof', [PaymentProofController::class,'show']);

    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    Route::get('/admin/users',           [AdminController::class, 'users']);
    Route::get('/admin/users/{id}',      [AdminController::class, 'show']);
    Route::patch('/admin/users/{id}',    [AdminController::class, 'update']);
    Route::delete('/admin/users/{id}',   [AdminController::class, 'deleteUser']);

    Route::get('/admin/sidebar-counts',  [AdminController::class, 'sidebarCounts']);
});
