
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

    // Form Submit -> Open Modal
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        formData = {
            name: document.getElementById('name').value,
            year: document.getElementById('year').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
        };
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
                ...formData,
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
