import API_URL from './config.js';

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    
    if (!isAuthenticated) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Add event listeners for buttons
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('refreshBtn')?.addEventListener('click', loadBookings);
    
    loadBookings();
    // Auto-refresh every 30 seconds
    setInterval(loadBookings, 30000);
});

async function loadBookings() {
    const container = document.getElementById('bookingsContainer');
    const token = sessionStorage.getItem('adminToken');
    
    if (!token) {
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
        
        // Fetch all bookings
        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            sessionStorage.clear();
            window.location.href = 'admin-login.html';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();

        // Update statistics
        const pendingCount = Array.isArray(data) ? data.filter(b => b.payment_status !== 'PAID').length : 0;
        const paidCount = Array.isArray(data) ? data.filter(b => b.payment_status === 'PAID').length : 0;
        
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
        } else if (data && data.bookings && Array.isArray(data.bookings)) {
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
        
        // Set bookings data globally for filtering
        if (window.setBookingsData) {
            window.setBookingsData(transformedBookings);
        }

    } catch (error) {
        console.error('Error loading bookings:', error);
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
    if (!confirm(`Are you sure you want to mark booking ${bookingId} as PAID?`)) {
        return;
    }

    const token = sessionStorage.getItem('adminToken');
    
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/mark-paid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ booking_id: bookingId })
        });

        const result = await response.json();

        if (result.success || response.ok) {
            // Reload bookings to update the display
            await loadBookings();
        } else {
            throw new Error(result.error || 'Failed to update booking');
        }

    } catch (error) {
        console.error('Error marking as paid:', error);
        alert('Error: ' + error.message);
    }
}

// Make markAsPaid globally available for onclick handlers
window.markAsPaid = markAsPaid;
