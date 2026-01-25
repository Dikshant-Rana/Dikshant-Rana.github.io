import API_URL from './config.js';

// Check authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is authenticated
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated');
    
    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
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
        // Fetch pending bookings
        const response = await fetch(`${API_URL}/admin/pending-bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401 || response.status === 403) {
            sessionStorage.clear();
            window.location.href = 'admin-login.html';
            return;
        }
        
        const data = await response.json();

        // Update statistics
        document.getElementById('pendingCount').textContent = data.length;
        await updatePaidCount();

        // Display bookings
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>No Pending Bookings</h3>
                    <p>All bookings have been processed!</p>
                </div>
            `;
            return;
        }

        // Create table
        let tableHTML = `
            <div class="bookings-table">
                <table>
                    <thead>
                        <tr>
                            <th>Booking ID</th>
                            <th>Customer</th>
                            <th>Phone</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(booking => {
            const date = new Date(booking.booking_date).toLocaleDateString();
            tableHTML += `
                <tr id="booking-${booking.booking_id}">
                    <td><strong>${booking.booking_id}</strong></td>
                    <td>${booking.customer_name}</td>
                    <td>${booking.phone}</td>
                    <td>${booking.service}</td>
                    <td>${date}</td>
                    <td>${booking.preferred_time}</td>
                    <td>Rs. ${booking.amount}</td>
                    <td>
                        <span class="status-badge status-${booking.payment_status.toLowerCase()}">
                            ${booking.payment_status}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" data-booking-id="${booking.booking_id}">
                            <i class="fas fa-check"></i> Mark as Paid
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = tableHTML;

        // Add event listeners to all action buttons
        document.querySelectorAll('.action-btn').forEach(button => {
            button.addEventListener('click', () => {
                const bookingId = button.getAttribute('data-booking-id');
                markAsPaid(bookingId);
            });
        });

    } catch (error) {
        console.error('Error loading bookings:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Bookings</h3>
                <p>Please check if the server is running and try again.</p>
            </div>
        `;
    }
}

async function updatePaidCount() {
    const token = sessionStorage.getItem('adminToken');
    if (!token) return;
    
    try {
        const response = await fetch(`${API_URL}/admin/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        const paidCount = data.filter(b => b.payment_status === 'PAID').length;
        document.getElementById('paidCount').textContent = paidCount;
    } catch (error) {
        console.error('Error updating paid count:', error);
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

    const row = document.getElementById(`booking-${bookingId}`);
    const button = row.querySelector('.action-btn');
    const token = sessionStorage.getItem('adminToken');
    
    if (!token) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Disable button and show loading
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

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
            // Show success message
            button.innerHTML = '<i class="fas fa-check"></i> Paid!';
            button.style.background = '#27ae60';
            
            // Remove row after animation
            setTimeout(() => {
                row.style.transition = 'all 0.5s ease-out';
                row.style.opacity = '0';
                row.style.transform = 'translateX(100%)';
                
                setTimeout(() => {
                    loadBookings(); // Reload the table
                }, 500);
            }, 1000);

        } else {
            throw new Error(result.error || 'Failed to update booking');
        }

    } catch (error) {
        console.error('Error marking as paid:', error);
        alert('Error: ' + error.message);
        
        // Re-enable button
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-check"></i> Mark as Paid';
    }
}
