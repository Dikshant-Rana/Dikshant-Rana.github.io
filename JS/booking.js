import API_URL from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const paymentSection = document.getElementById("paymentSection");
    const bookingIdText = document.getElementById("bookingIdText");
    const amountText = document.getElementById("amountText");
    
    let currentBookingId = null;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Get button elements
        const bookingBtn = document.getElementById('bookingBtn');
        const btnText = bookingBtn.querySelector('.btn-text');
        const btnSpinner = bookingBtn.querySelector('.btn-spinner');

        // Show loading spinner
        bookingBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';

        // Generate unique Booking ID with timestamp
        currentBookingId = 'BP-' + Date.now();

        // Collect form data
        const data = {
            booking_id: currentBookingId,
            customer_name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            service: document.getElementById("service").value,
            booking_date: document.getElementById("date").value,
            preferred_time: document.getElementById("time").value
        };

        try {
            // Create timeout promise (10 seconds)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            // Send data to server
            const requestPromise = fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            // Add minimum 1.5 second delay for better UX (so users see the spinner)
            const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

            // Wait for both the request and minimum delay, with timeout
            const [res] = await Promise.all([
                Promise.race([requestPromise, timeoutPromise]),
                delayPromise
            ]);

            const result = await res.json();

            if (!result.success) {
                // Check if it's a time slot error
                if (result.error && result.error.toLowerCase().includes('time slot')) {
                    document.getElementById('timeSlotErrorPopup').classList.add('show');
                } else {
                    document.getElementById('errorPopup').classList.add('show');
                }
                
                // Reset button
                bookingBtn.disabled = false;
                btnText.style.display = 'inline';
                btnSpinner.style.display = 'none';
                return;
            }
            
            // Show success popup
            document.getElementById('successPopup').classList.add('show');

            // Prepare payment section data (but don't show yet)
            bookingIdText.textContent = currentBookingId;
            amountText.textContent = `Rs. ${result.amount}`;

            // Reset button
            bookingBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';

        } catch (err) {
            // Show error popup without changing the default HTML message
            document.getElementById('errorPopup').classList.add('show');
            console.error(err);
            
            // Reset button
            bookingBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    });

});

// Close popup function
window.closeSuccessPopup = function() {
    document.getElementById('successPopup').classList.remove('show');
    
    // Show QR payment section with animation after closing popup
    const paymentSection = document.getElementById('paymentSection');
    paymentSection.style.display = "block";
    paymentSection.classList.add('active');
    
    // Smooth scroll to payment section
    paymentSection.scrollIntoView({ behavior: 'smooth' });
};

// Close error popup function
window.closeErrorPopup = function() {
    document.getElementById('errorPopup').classList.remove('show');
};

// Close time slot error popup function
window.closeTimeSlotErrorPopup = function() {
    document.getElementById('timeSlotErrorPopup').classList.remove('show');
};


