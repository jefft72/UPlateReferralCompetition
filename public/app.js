document.addEventListener('DOMContentLoaded', () => {
    const introSection = document.getElementById('intro-section');
    const mainContainer = document.getElementById('main-container');
    const enterBtn = document.getElementById('enter-btn');
    const registerSection = document.getElementById('register-section');
    const successSection = document.getElementById('success-section');
    const referralForm = document.getElementById('referral-form');
    const referrerInfo = document.getElementById('referrer-info');
    const typewriterText = document.getElementById('typewriter-text');
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref') || null;

    // Typewriter effect for fullscreen intro
    const phrases = [
        "Join the competition.",
        "Share UPlate.",
        "Win $50."
    ];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typingSpeed = 80;

    function typeWriter() {
        const currentPhrase = phrases[currentPhraseIndex];
        
        if (!isDeleting) {
            // Typing
            typewriterText.textContent = currentPhrase.substring(0, currentCharIndex + 1);
            currentCharIndex++;
            
            if (currentCharIndex === currentPhrase.length) {
                // Finished typing current phrase
                if (currentPhraseIndex < phrases.length - 1) {
                    // Pause before deleting
                    setTimeout(() => {
                        isDeleting = true;
                        typeWriter();
                    }, 800);
                } else {
                    // Last phrase finished, fade out intro section
                    setTimeout(() => {
                        fadeOutIntro();
                    }, 1000);
                }
                return;
            }
        } else {
            // Deleting - delete entire text
            currentCharIndex--;
            typewriterText.textContent = currentPhrase.substring(0, currentCharIndex);
            
            if (currentCharIndex === 0) {
                // Finished deleting, move to next phrase
                isDeleting = false;
                currentPhraseIndex++;
                setTimeout(typeWriter, 300);
                return;
            }
        }
        
        const speed = isDeleting ? typingSpeed / 2 : typingSpeed;
        setTimeout(typeWriter, speed);
    }

    function fadeOutIntro() {
        introSection.classList.add('fade-out');
        setTimeout(() => {
            introSection.classList.add('hidden');
            mainContainer.classList.remove('hidden');
            mainContainer.classList.add('fade-in');
        }, 500);
    }

    // Start typewriter effect
    typeWriter();

    // Detect user interaction to skip intro
    introSection.addEventListener('click', fadeOutIntro);
    introSection.addEventListener('touchstart', fadeOutIntro);

    // Display referrer info if present
    if (referrerId) {
        referrerInfo.classList.remove('hidden');
        // referrerInfo.querySelector('.referrer-label').textContent = `Invited by ${referrerId}`; // Optional: Show specific name if API supported it
    }

    // Detect platform and set appropriate download link
    const downloadLink = document.getElementById('download-app-link');
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isAndroid) {
        downloadLink.href = 'https://play.google.com/store/apps/details?id=com.njr.boilerFuel'; 
    } else {
        downloadLink.href = 'https://apps.apple.com/us/app/uplate/id6752828206';
    }

    referralForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = referralForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Processing...</span>';
        submitBtn.disabled = true;

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            instagram: document.getElementById('instagram').value, // Added Instagram handle
            referrerId: referrerId
        };

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Transition to success state
                registerSection.style.opacity = '0';
                setTimeout(() => {
                    registerSection.classList.add('hidden');
                    successSection.classList.remove('hidden');
                    
                    // Setup success data
                    document.getElementById('download-link-btn').href = data.downloadLink;
                    document.getElementById('my-referral-link').value = data.referralLink;
                }, 300); // Match CSS transition time
            } else {
                alert(data.error || 'Something went wrong. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Connection error. Please check your internet connection.');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // Copy Link Functionality
    const copyBtn = document.getElementById('copy-btn');
    const referralInput = document.getElementById('my-referral-link');

    copyBtn.addEventListener('click', () => {
        referralInput.select();
        referralInput.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(referralInput.value).then(() => {
            const originalIcon = copyBtn.innerHTML;
            // Change to checkmark
            copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 2000);
        });
    });
});
