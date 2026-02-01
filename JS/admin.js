import API_URL from './config.js';

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Admin page initialized');
    console.log('🌐 Current location:', window.location.href);
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🔗 API_URL:', API_URL);
    
    // Debug DOM elements
    console.log('🔍 DOM Debug - Key elements:');
    console.log('  - bookingsContainer:', !!document.getElementById('bookingsContainer'));
    console.log('  - pendingCount:', !!document.getElementById('pendingCount'));
    console.log('  - paidCount:', !!document.getElementById('paidCount'));
    console.log('  - pendingCard:', !!document.getElementById('pendingCard'));
    console.log('  - paidCard:', !!document.getElementById('paidCard'));
    console.log('  - logoutBtn:', !!document.getElementById('logoutBtn'));
    console.log('  - refreshBtn:', !!document.getElementById('refreshBtn'));
    
    // Check if admin is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    console.log('🔐 Authentication status:', !!isAuthenticated);
    
    if (!isAuthenticated) {
        console.log('🔐 Not authenticated, redirecting to login...');
        // Redirect to login page if not authenticated
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Add event listeners for buttons
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('refreshBtn')?.addEventListener('click', loadBookings);
    
    console.log('🔄 Starting initial booking load...');
    loadBookings();
    // Auto-refresh every 30 seconds
    setInterval(loadBookings, 30000);
});

async function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    const token = sessionStorage.getItem('adminToken');
    
    console.log('🚀 Starting loadBookings function');
    console.log('🔐 Token available:', !!token);
    console.log('🌐 Current hostname:', window.location.hostname);
    console.log('🔗 API_URL:', API_URL);
    
    if (!token) {
        console.error('🚨 No admin token found, redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }
    
    try {
        // Show loading state
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading bookings...</p>
            </div>
        `;
        
        console.log('🔄 Fetching bookings from:', `${API_URL}/admin/bookings`);
        
        // Fetch all bookings
        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', response.headers);
        
        if (response.status === 401 || response.status === 403) {
            console.error('🔐 Authentication failed');
            sessionStorage.clear();
            window.location.href = 'admin-login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 Raw API response:', data);
        console.log('📊 Response type:', typeof data);
        console.log('📊 Is array:', Array.isArray(data));

        // Update statistics
        const pendingCount = Array.isArray(data) ? data.filter(b => b.payment_status !== 'PAID').length : 0;
        const paidCount = Array.isArray(data) ? data.filter(b => b.payment_status === 'PAID').length : 0;
        
        console.log('📊 Statistics - Pending:', pendingCount, 'Paid:', paidCount);
        
        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('paidCount').textContent = paidCount;

        // Transform data to match the expected format
        let transformedBookings = [];
        
        if (Array.isArray(data)) {
            transformedBookings = data.map(booking => ({
                _id: booking.booking_id,
                name: booking.customer_name,
                phone: booking.phone,
                service: booking.service,
                preferredDate: booking.booking_date,
                preferredTime: booking.preferred_time,
                amount: booking.amount,
                paymentStatus: booking.payment_status === 'PAID' ? 'paid' : 'pending'
            }));
        } else {
            console.error('🚨 API response is not an array:', data);
            
            // Check if it's an object with a bookings property
            if (data && data.bookings && Array.isArray(data.bookings)) {
                console.log('📊 Found bookings in data.bookings');
                transformedBookings = data.bookings.map(booking => ({
                    _id: booking.booking_id,
                    name: booking.customer_name,
                    phone: booking.phone,
                    service: booking.service,
                    preferredDate: booking.booking_date,
                    preferredTime: booking.preferred_time,
                    amount: booking.amount,
                    paymentStatus: booking.payment_status === 'PAID' ? 'paid' : 'pending'
                }));
            } else if (data && data.data && Array.isArray(data.data)) {
                console.log('📊 Found bookings in data.data');
                transformedBookings = data.data.map(booking => ({
                    _id: booking.booking_id,
                    name: booking.customer_name,
                    phone: booking.phone,
                    service: booking.service,
                    preferredDate: booking.booking_date,
                    preferredTime: booking.preferred_time,
                    amount: booking.amount,
                    paymentStatus: booking.payment_status === 'PAID' ? 'paid' : 'pending'
                }));
            }
        }
        
        console.log('📊 Transformed bookings:', transformedBookings);

        // Set bookings data globally for filtering
        if (window.setBookingsData) {
            console.log('🔄 Setting bookings data for filtering:', transformedBookings.length, 'bookings');
            window.setBookingsData(transformedBookings);
        } else {
            console.error('🚨 window.setBookingsData function not found!');
        }

    } catch (error) {
        console.error('🚨 Error loading bookings:', error);
        console.error('🚨 Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Bookings</h3>
                <p>Error: ${error.message}</p>
                <p>Please check if the server is running and try again.</p>
                <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px;">Retry</button>
            </div>
        `;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminUsername');
        sessionStorage.removeItem('adminToken');
        window.location.href = 'admin-login.html';
    }
}

async function markAsPaid(bookingId) {
    console.log('💰 markAsPaid called with bookingId:', bookingId);
    console.log('💰 Current API_URL:', API_URL);
    console.log('💰 Current window location:', window.location.href);
    
    if (!confirm(`Are you sure you want to mark booking ${bookingId} as PAID?`)) {
        return;
    }

    const token = sessionStorage.getItem('adminToken');
    console.log('💰 Token available:', !!token);
    
    if (!token) {
        console.error('💰 No token found, redirecting to login');
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        console.log('💰 Making API call to mark as paid...');
        const response = await fetch(`${API_URL}/admin/mark-paid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ booking_id: bookingId })
        });

        console.log('💰 Response status:', response.status);
        console.log('💰 Response ok:', response.ok);

        const result = await response.json();
        console.log('💰 Response data:', result);

        if (result.success || response.ok) {
            console.log('💰 Payment status updated successfully, reloading bookings...');
            // Reload bookings to update the display
            await loadBookings();
        } else {
            throw new Error(result.error || 'Failed to update booking');
        }

    } catch (error) {
        console.error('💰 Error marking as paid:', error);
        console.error('💰 Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        alert('Error: ' + error.message);
    }
}

// Make markAsPaid globally available for onclick handlers
window.markAsPaid = markAsPaid;
