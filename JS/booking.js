import API_URL from './config.js';

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const paymentSection = document.getElementById("paymentSection");
    const bookingIdText = document.getElementById("bookingIdText");
    const amountText = document.getElementById("amountText");

    // Function to generate short, professional booking ID
    function generateBookingId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'BP-';
        for (let i = 0; i < 6; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
    }

    // Generic function to show popups and auto-fade
    function showPopup(popupId, duration = 4000, callback = null) {
        const popup = document.getElementById(popupId);
        popup.classList.add('show');

        setTimeout(() => {
            popup.classList.remove('show');

            // Run callback after auto-close
            if (callback) callback();
        }, duration);
    }


    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const bookingBtn = document.getElementById('bookingBtn');
        const btnText = bookingBtn.querySelector('.btn-text');
        const btnSpinner = bookingBtn.querySelector('.btn-spinner');

        // Disable button & show spinner
        bookingBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'flex';

        // Generate short booking ID
        const currentBookingId = generateBookingId();

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
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            );

            const requestPromise = fetch(`${API_URL}/bookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            // Ensure spinner visible for at least 1.5s
            const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));

            const [res] = await Promise.all([
                Promise.race([requestPromise, timeoutPromise]),
                delayPromise
            ]);

            const result = await res.json();

            if (!result.success) {
                if (result.error && result.error.toLowerCase().includes('time slot')) {
                    showPopup('timeSlotErrorPopup', 5000);
                } else {
                    showPopup('errorPopup', 5000);
                }

                bookingBtn.disabled = false;
                btnText.style.display = 'inline';
                btnSpinner.style.display = 'none';
                return;
            }

            // Show success popup
            showPopup('successPopup', 4000, () => {
                const paymentSection = document.getElementById('paymentSection');
                paymentSection.style.display = "block";
                paymentSection.classList.add('active');
                paymentSection.scrollIntoView({ behavior: 'smooth' });
            });


            // Prepare payment section data (advance)
            bookingIdText.textContent = currentBookingId;
            amountText.textContent = `Rs. ${result.amount}`;

            // Reset button
            bookingBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';

        } catch (err) {
            console.error(err);
            showPopup('errorPopup', 5000);

            bookingBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    });
});

// Close popup handlers (still keep manual close)
window.closeSuccessPopup = function () {
    document.getElementById('successPopup').classList.remove('show');

    // Show payment section smoothly
    const paymentSection = document.getElementById('paymentSection');
    paymentSection.style.display = "block";
    paymentSection.classList.add('active');
    paymentSection.scrollIntoView({ behavior: 'smooth' });
};

window.closeErrorPopup = function () {
    document.getElementById('errorPopup').classList.remove('show');
};

window.closeTimeSlotErrorPopup = function () {
    document.getElementById('timeSlotErrorPopup').classList.remove('show');
};
