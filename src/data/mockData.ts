import type { Vehicle, Customer, Rental, RentalRequest } from '../types';

export const initialVehicles: Vehicle[] = [
  {
    id: 'v1',
    brand: 'Ford Transit',
    license_plate: '1AB 1234',
    vin: 'ABC123XYZ',
    year: 2022,
    serviceHistory: [{ id: 's1', date: '2024-05-01', description: 'Výměna oleje', cost: 3500 }],
    pricing: { perDay: 1500, perHour: 200 },
    stk_date: '2026-04-01',
    insurance_info: 'ČSOB, č. 123456',
    vignette_until: '2025-01-31',
  },
  {
    id: 'v2',
    brand: 'Renault Master',
    license_plate: '2CD 5678',
    vin: 'DEF456ABC',
    year: 2023,
    serviceHistory: [],
    pricing: { perDay: 1600 },
    stk_date: '2027-07-01',
    insurance_info: 'Allianz, č. 789012',
    vignette_until: '2025-06-30',
  },
];

export const initialCustomers: Customer[] = [
  {
    id: 'c1',
    first_name: 'Jan',
    last_name: 'Novák',
    email: 'jan.novak@email.cz',
    phone: '+420 123 456 789',
    id_card_number: '123456789',
    drivers_license_number: '987654321',
  },
];

export const initialRentals: Rental[] = [
  {
    id: 'r1',
    vehicleId: 'v1',
    customerId: 'c1',
    startDate: '2024-06-10T09:00',
    endDate: '2024-06-12T17:00',
    totalPrice: 4500,
    status: 'completed',
  },
];

export const initialRentalRequests: RentalRequest[] = [
    {
        id: 'req1',
        customer_details: {
            first_name: 'Petra',
            last_name: 'Svobodová',
            email: 'petra.svobodova@email.com',
            phone: '+420 987 654 321',
            id_card_number: '555444333',
            drivers_license_number: '333444555',
        },
        drivers_license_image_base64: null,
        digital_consent_at: new Date().toISOString(),
        status: 'pending',
    }
];
