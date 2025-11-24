// --- 1. FIREBASE SETUP (YOUR KEYS ARE PRESERVED) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCGDi9KZnwGd7FH3btOBqU7w1ZLXDye_gg",
    authDomain: "skillforge-web.firebaseapp.com",
    projectId: "skillforge-web",
    storageBucket: "skillforge-web.firebasestorage.app",
    messagingSenderId: "462383432132",
    appId: "1:462383432132:web:23fe441ac596edc1622491"
};

// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
} catch(e) {
    console.log("Firebase keys not set yet.");
}

// --- NEW: GLOBAL PAYMENT VARIABLES & ELEMENTS ---
const submitBtn = document.getElementById('submitBtn');
const selectedPriceInput = document.getElementById('selectedPrice');
const currentPriceDisplay = document.getElementById('currentPriceDisplay');
const modalHeading = document.getElementById('modalHeading');

// --- NEW: FUNCTION TO SET SELECTED PAYMENT AMOUNT ---
/**
 * Sets the chosen payment amount (Full: 500 or Installment: 249)
 * @param {number} price - The selected price (500 or 249)
 */
window.setPaymentAmount = function(price) {
    // 1. Update the hidden input field value
    selectedPriceInput.value = price;

    // 2. Update the button text and display text
    if (price === 500) {
        submitBtn.innerText = 'Pay & Join Elite Cohort (₹500)';
        currentPriceDisplay.innerText = '₹500 (Full Payment)';
    } else if (price === 249) {
        submitBtn.innerText = 'Pay & Join Elite Cohort (₹249 Initial)';
        currentPriceDisplay.innerText = '₹249 (Initial Installment)';
    }
    
    // Smooth scroll to the register section after setting price (if coming from Hero section)
    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
}

// Initialize with the default price (₹500)
setPaymentAmount(500); 

// --- 2. UI LOGIC (Menu, Scroll, FAQ) ---
window.toggleMenu = function() {
    document.getElementById('mobileMenu').classList.toggle('active');
}

window.toggleFaq = function(element) {
    element.classList.toggle('active');
}

window.addEventListener('scroll', reveal);
function reveal() {
    var reveals = document.querySelectorAll('.reveal');
    for (var i = 0; i < reveals.length; i++) {
        var windowheight = window.innerHeight;
        var revealtop = reveals[i].getBoundingClientRect().top;
        if (revealtop < windowheight - 100) {
            reveals[i].classList.add('active');
        }
    }
}
reveal(); 

// --- 3. PAYMENT POPUP LOGIC ---
const form = document.getElementById('regForm');
const modal = document.getElementById('paymentModal');
let formData = {};

// Form Submit -> Open Modal (UPDATED)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Capture the selected price along with other data
    const selectedPrice = selectedPriceInput.value;
    
    formData = {
        name: document.getElementById('name').value,
        year: document.getElementById('year').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        // ADDED SELECTED PRICE TO FORM DATA
        paymentAmount: selectedPrice, 
        paymentType: selectedPrice === '500' ? 'Full' : 'Installment_Initial'
    };

    // Update Modal content based on selected price (UPDATED)
    modalHeading.innerText = `SCAN TO SECURE ACCESS (₹${selectedPrice})`;

    modal.style.display = 'flex';
});

window.closeModal = function() {
    modal.style.display = 'none';
}

// --- 4. FIRESTORE SUBMIT LOGIC ---
window.submitToFirestore = async function() {
    const txnId = document.getElementById('txnId').value;
    const btn = document.querySelector('#paymentModal button');
    const loading = document.getElementById('loadingMsg');

    if(!txnId) {
        alert("Please enter the Transaction ID to confirm.");
        return;
    }

    if(!db) {
        alert("Firebase error. Contact Admin.");
        return;
    }

    // Show loading
    btn.style.display = 'none';
    loading.style.display = 'block';

    try {
        await addDoc(collection(db, "registrations"), {
            ...formData, // This now includes paymentAmount and paymentType
            transactionId: txnId,
            timestamp: serverTimestamp(),
            status: "pending"
        });

        alert("Registration Successful! Welcome to the Elite Cohort.");
        location.reload(); 
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error submitting data. Try again or contact Admin.");
        btn.style.display = 'block';
        loading.style.display = 'none';
    }
}