export const workspaceLinks = [
    { href: '/patient/dashboard', label: 'Patient', description: 'Appointments, booking, and health assistance.' },
    { href: '/doctor/dashboard', label: 'Doctor', description: 'Appointments, availability, and clinical summaries.' },
    { href: '/admin/dashboard', label: 'Admin', description: 'Users, departments, doctors, and appointments.' },
];

export const navigation = {
    patient: [
        { href: '/patient/dashboard', label: 'Dashboard', description: 'An overview of your care.' },
        { href: '/patient/appointments', label: 'My appointments', description: 'View and manage your appointments.' },
        { href: '/patient/book-appointment', label: 'Book an appointment', description: 'Choose a doctor and an available time.' },
        { href: '/patient/health-assistant', label: 'Health assistant', description: 'Help with bookings and appointments.' },
    ],
    doctor: [
        { href: '/doctor/dashboard', label: 'Dashboard', description: 'An overview of your practice.' },
        { href: '/doctor/appointments', label: 'Appointments', description: 'Review and manage patient appointments.' },
        { href: '/doctor/slots', label: 'Available slots', description: 'Manage your appointment availability.' },
        { href: '/doctor/appointment-summary', label: 'Appointment summary', description: 'Review clinical appointment summaries.' },
    ],
    admin: [
        { href: '/admin/dashboard', label: 'Dashboard', description: 'An overview of your clinic.' },
        { href: '/admin/users', label: 'Users', description: 'View patient, doctor, and admin accounts.' },
        { href: '/admin/departments', label: 'Departments', description: 'Organize your clinic departments.' },
        { href: '/admin/doctors', label: 'Doctors', description: 'Manage doctor profiles and assignments.' },
        { href: '/admin/appointments', label: 'Appointments', description: 'View appointments across the clinic.' },
    ],
};

export function iconForPath(path) {
    if (path.includes('health-assistant')) return 'sparkles';
    if (path.includes('summary')) return 'document';
    if (path.includes('slots')) return 'clock';
    if (path.includes('book-appointment')) return 'plus';
    if (path.includes('appointments')) return 'calendar';
    if (path.includes('users')) return 'users';
    if (path.includes('departments')) return 'building';
    if (path.includes('doctors')) return 'doctor';
    return 'grid';
}
