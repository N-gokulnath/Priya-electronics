/**
 * Priya Electronics - Application Controller Engine
 * Governs State Management, persistence (localStorage), Pricing Calculator, 
 * Stepped Booking Wizard, Live Tracker timeline, and the Technician CRM Dashboard.
 */

// Global state variables
let activeTab = 'estimate';
let currentWizardStep = 1;
let selectedBrand = '';
let selectedIssues = [];
let selectedSlot = 'Morning: 09:00 AM - 12:00 PM';
let repairsDb = [];

// CRM Login authentication state
let isCrmAuthenticated = false;

// ==========================================
// 1. INITIALIZATION & DATA SEEDING
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dynamic theme icon states
  initTheme();

  // Initialize Database from localStorage or seed defaults
  initDatabase();

  // Load and Setup dynamic interactive elements
  setupBrandSelector();
  setupIssueSelector();
  setupSlotSelector();
  setupMobileNav();

  // Populate dynamic elements
  runCostEstimator();
  updateWizardButtons();
  
  // Configure default date picker to tomorrow
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    dateInput.value = `${yyyy}-${mm}-${dd}`;
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  // Monitor scroll behavior to style Navbar
  window.addEventListener('scroll', handleNavbarScroll);
});

/**
 * Initializes database inside localStorage with realistic demo jobs if empty
 */
function initDatabase() {
  const localData = localStorage.getItem('priya_repairs');
  
  if (localData) {
    repairsDb = JSON.parse(localData);
  } else {
    // Empty database - seed standard demo tickets representing active shop flow
    repairsDb = [
      {
        id: 'PE-2026-X8A1',
        name: 'Rajesh Kumar',
        phone: '9845102345',
        tvType: 'Smart TV',
        brand: 'Samsung',
        issues: ['Display Screen Damage', 'OS & Software issues'],
        comment: 'TV screen has green vertical lines appearing after 10 minutes of usage.',
        date: '2026-05-21',
        slot: 'Morning: 09:00 AM - 12:00 PM',
        status: 'Received',
        techComment: 'Service ticket initialized. The client is scheduled to drop off the hardware diagnostics unit.',
        priceRange: '₹3,500 - ₹5,500'
      },
      {
        id: 'PE-2026-X8A2',
        name: 'Anjali Sharma',
        phone: '9443210567',
        tvType: 'LED TV',
        brand: 'Mi / Xiaomi',
        issues: ['OS & Software issues'],
        comment: 'Stuck constantly on the Mi boot-loop logo and won\'t load home dashboard.',
        date: '2026-05-20',
        slot: 'Afternoon: 01:00 PM - 04:00 PM',
        status: 'Diagnostics',
        techComment: 'IC bios chip pinout voltage checks stable. Connecting JTAG diagnostic scanner to re-flash Android system files.',
        priceRange: '₹1,500 - ₹2,500'
      },
      {
        id: 'PE-2026-X8A3',
        name: 'Vignesh K.',
        phone: '9123456789',
        tvType: 'OLED TV',
        brand: 'LG',
        issues: ['Backlight / Blank Screen'],
        comment: 'TV turns on, power light goes blue, sound is normal but screen remains absolutely dark.',
        date: '2026-05-19',
        slot: 'Evening: 05:00 PM - 08:00 PM',
        status: 'Repairing',
        techComment: 'Internal voltage supply board tested. Successfully diagnosed faulty row in LED backlight strip arrays. Replacing full diode array backed with aluminum heatsink.',
        priceRange: '₹4,500 - ₹7,000'
      },
      {
        id: 'PE-2026-X8A4',
        name: 'Suresh Patel',
        phone: '9345678901',
        tvType: 'LED TV',
        brand: 'Sony',
        issues: ['Ports & Connectors Failure'],
        comment: 'HDMI port 1 and 2 are cracked and not detecting any setup box signals.',
        date: '2026-05-18',
        slot: 'Morning: 09:00 AM - 12:00 PM',
        status: 'QC',
        techComment: 'Defective dual HDMI ports micro-desoldered from main motherboard. Brand new original gold-plated connectors soldered. Undergoing 3-hour streaming quality testing.',
        priceRange: '₹2,000 - ₹3,500'
      },
      {
        id: 'PE-2026-X8A5',
        name: 'Priya G.',
        phone: '9486401550',
        tvType: 'Smart TV',
        brand: 'Realme',
        issues: ['Audio Speaker Distortions'],
        comment: 'Speakers are making massive vibrating and crackling sound outputs on high volumes.',
        date: '2026-05-17',
        slot: 'Afternoon: 01:00 PM - 04:00 PM',
        status: 'Ready',
        techComment: 'Amplifier output capacitors replaced. Speaker membrane repaired and stabilized. Sound sweeps from 50Hz to 15kHz tested and fully balanced. Invoice ready.',
        priceRange: '₹1,200 - ₹2,000'
      }
    ];
    saveDatabase();
  }
}

function saveDatabase() {
  localStorage.setItem('priya_repairs', JSON.stringify(repairsDb));
}

// ==========================================
// 2. NAVIGATIONAL CONTROLLER & STYLE EFFECTS
// ==========================================
function handleNavbarScroll() {
  const header = document.querySelector('.header-container');
  if (header) {
    if (window.scrollY > 50) {
      header.style.padding = '0.5rem 0';
      header.style.background = 'var(--bg-header-scrolled)';
      header.style.boxShadow = 'var(--shadow-md)';
    } else {
      header.style.padding = '1rem 0';
      header.style.background = 'var(--bg-header)';
      header.style.boxShadow = 'none';
    }
  }
}

function setupMobileNav() {
  const toggle = document.getElementById('mobile-nav-toggle');
  const nav = document.getElementById('navbar-links');
  
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      const icon = toggle.querySelector('i');
      if (nav.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });
  }
}

function closeMobileNav() {
  const nav = document.getElementById('navbar-links');
  const toggle = document.getElementById('mobile-nav-toggle');
  if (nav && nav.classList.contains('active')) {
    nav.classList.remove('active');
    if (toggle) {
      toggle.querySelector('i').className = 'fa-solid fa-bars';
    }
  }
}

function smoothScrollToTop(event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeMobileNav();
  
  // Remove hash active class on nav links
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  document.querySelector('nav a[href="#"]').classList.add('active');
}

// Update Active Nav links based on scroll section
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('nav a');
  
  let currentSec = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= (sectionTop - 150)) {
      currentSec = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href').substring(1);
    if (href === currentSec || (href === '' && currentSec === 'home')) {
      link.classList.add('active');
    }
  });
});

// ==========================================
// 3. SERVICE TABS SWITCH SYSTEM
// ==========================================
function switchTab(tabName) {
  activeTab = tabName;
  
  // Tab buttons state toggle
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  
  const targetBtn = document.getElementById(`tab-btn-${tabName}`);
  const targetPanel = document.getElementById(`panel-${tabName}`);
  
  if (targetBtn && targetPanel) {
    targetBtn.classList.add('active');
    targetPanel.classList.add('active');
  }

  // If switched to track tab and search has an ID, search automatically
  if (tabName === 'track') {
    const searchVal = document.getElementById('tracker-search-input').value.trim();
    if (searchVal) {
      trackTicketSearch();
    }
  }
}

// ==========================================
// 4. SMART SERVICE PRICING ESTIMATOR
// ==========================================
const estimatorConfig = {
  led: {
    power: { price: '₹1,200 - ₹2,200', time: '1 Day', warranty: '90 Days' },
    backlight: { price: '₹1,800 - ₹3,000', time: '1 - 2 Days', warranty: '90 Days' },
    screen: { price: '₹3,000 - ₹6,000', time: '2 - 3 Days', warranty: '90 Days' },
    sound: { price: '₹800 - ₹1,500', time: '1 Day', warranty: '90 Days' },
    ports: { price: '₹1,000 - ₹1,800', time: '1 Day', warranty: '90 Days' },
    software: { price: '₹800 - ₹1,200', time: '1 Day', warranty: '90 Days' }
  },
  lcd: {
    power: { price: '₹1,000 - ₹1,800', time: '1 Day', warranty: '90 Days' },
    backlight: { price: '₹1,500 - ₹2,500', time: '1 - 2 Days', warranty: '90 Days' },
    screen: { price: '₹2,500 - ₹4,500', time: '2 - 3 Days', warranty: '90 Days' },
    sound: { price: '₹700 - ₹1,200', time: '1 Day', warranty: '90 Days' },
    ports: { price: '₹800 - ₹1,500', time: '1 Day', warranty: '90 Days' },
    software: { price: '₹600 - ₹1,000', time: '1 Day', warranty: '90 Days' }
  },
  smart: {
    power: { price: '₹1,500 - ₹2,800', time: '1 Day', warranty: '90 Days' },
    backlight: { price: '₹2,200 - ₹3,800', time: '1 - 2 Days', warranty: '90 Days' },
    screen: { price: '₹4,000 - ₹8,000', time: '2 - 4 Days', warranty: '90 Days' },
    sound: { price: '₹1,000 - ₹2,000', time: '1 Day', warranty: '90 Days' },
    ports: { price: '₹1,200 - ₹2,200', time: '1 Day', warranty: '90 Days' },
    software: { price: '₹1,000 - ₹1,800', time: '1 Day', warranty: '90 Days' }
  },
  oled: {
    power: { price: '₹3,000 - ₹5,500', time: '1 - 2 Days', warranty: '90 Days' },
    backlight: { price: '₹4,500 - ₹8,000', time: '2 - 3 Days', warranty: '90 Days' },
    screen: { price: '₹9,000 - ₹20,000+', time: '3 - 5 Days', warranty: '90 Days' },
    sound: { price: '₹2,000 - ₹4,000', time: '1 - 2 Days', warranty: '90 Days' },
    ports: { price: '₹2,500 - ₹4,500', time: '1 - 2 Days', warranty: '90 Days' },
    software: { price: '₹1,800 - ₹3,000', time: '1 Day', warranty: '90 Days' }
  }
};

function runCostEstimator() {
  const tvType = document.getElementById('est-tv-type').value;
  const issue = document.getElementById('est-issue-type').value;
  
  const placeholder = document.getElementById('est-placeholder');
  const output = document.getElementById('est-output');
  
  if (tvType && issue) {
    const data = estimatorConfig[tvType][issue];
    
    // Hide placeholder, display calculations
    placeholder.style.display = 'none';
    output.classList.add('active');
    
    // Populate variables
    document.getElementById('est-price-val').innerText = data.price;
    document.getElementById('est-time-val').innerText = data.time;
    document.getElementById('est-warranty-val').innerText = data.warranty;
  } else {
    // Show placeholder, hide output
    placeholder.style.display = 'block';
    output.classList.remove('active');
  }
}

// ==========================================
// 5. STEPPED BOOKING WIZARD
// ==========================================
function setupBrandSelector() {
  const brandGrid = document.getElementById('booking-brand-grid');
  if (brandGrid) {
    const cards = brandGrid.querySelectorAll('.selection-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedBrand = card.getAttribute('data-brand');
      });
    });
  }
}

function setupIssueSelector() {
  const issueGrid = document.getElementById('booking-issue-grid');
  if (issueGrid) {
    const cards = issueGrid.querySelectorAll('.issue-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        card.classList.toggle('selected');
        const issue = card.getAttribute('data-issue');
        
        if (card.classList.contains('selected')) {
          if (!selectedIssues.includes(issue)) {
            selectedIssues.push(issue);
          }
        } else {
          selectedIssues = selectedIssues.filter(i => i !== issue);
        }
      });
    });
  }
}

function setupSlotSelector() {
  const slotGrid = document.getElementById('booking-slot-grid');
  if (slotGrid) {
    const cards = slotGrid.querySelectorAll('.slot-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSlot = card.getAttribute('data-slot');
      });
    });
  }
}

function navigateWizard(direction) {
  // Field Validations before moving forward
  if (direction === 1) {
    if (currentWizardStep === 1) {
      const name = document.getElementById('booking-name').value.trim();
      const phone = document.getElementById('booking-phone').value.trim();
      
      if (!name) {
        alert('Please enter your full name to proceed.');
        document.getElementById('booking-name').focus();
        return;
      }
      if (!phone || phone.length < 10) {
        alert('Please enter a valid 10-digit mobile contact number.');
        document.getElementById('booking-phone').focus();
        return;
      }
    } else if (currentWizardStep === 2) {
      if (!selectedBrand) {
        alert('Please select your TV brand manufacturer.');
        return;
      }
      if (selectedIssues.length === 0) {
        alert('Please select at least one visual or hardware issue.');
        return;
      }
    } else if (currentWizardStep === 3) {
      const date = document.getElementById('booking-date').value;
      if (!date) {
        alert('Please select a valid date for appointment evaluation.');
        return;
      }
      
      // If validation matches, finalize booking creation!
      finalizeBookingSubmit();
      return;
    }
  }

  // Perform navigation step increments/decrements
  currentWizardStep += direction;
  
  // Show target step screen, hide others
  document.querySelectorAll('.wizard-step-panel').forEach((panel, index) => {
    if (index + 1 === currentWizardStep) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });

  // Highlight step nodes in stepper
  document.querySelectorAll('.step-node').forEach((node, index) => {
    const stepNum = index + 1;
    node.className = 'step-node'; // Reset classes
    
    if (stepNum < currentWizardStep) {
      node.classList.add('completed');
      node.innerHTML = '<i class="fa-solid fa-check"></i>';
    } else if (stepNum === currentWizardStep) {
      node.classList.add('active');
      node.innerText = stepNum;
    } else {
      node.innerText = stepNum;
    }
  });

  // Calculate stepper progress bar percentage width
  const progressLine = document.getElementById('wizard-progress');
  if (progressLine) {
    const progressPercent = ((currentWizardStep - 1) / 2) * 90; // range 0% to 90%
    progressLine.style.width = `${progressPercent}%`;
  }

  updateWizardButtons();
}

function updateWizardButtons() {
  const prevBtn = document.getElementById('btn-wizard-prev');
  const nextBtn = document.getElementById('btn-wizard-next');
  
  if (prevBtn && nextBtn) {
    if (currentWizardStep === 1) {
      prevBtn.classList.add('btn-disabled');
    } else {
      prevBtn.classList.remove('btn-disabled');
    }

    if (currentWizardStep === 3) {
      nextBtn.innerHTML = '<i class="fa-solid fa-square-check"></i> Submit Booking';
    } else {
      nextBtn.innerHTML = 'Next <i class="fa-solid fa-arrow-right"></i>';
    }
  }
}

function finalizeBookingSubmit() {
  // Pull variables
  const name = document.getElementById('booking-name').value.trim();
  const phone = document.getElementById('booking-phone').value.trim();
  const tvType = document.getElementById('booking-tv-type').value;
  const comment = document.getElementById('booking-comment').value.trim();
  const date = document.getElementById('booking-date').value;
  
  // Generate random unique 4-character ID (hex string)
  const randHex = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1).toUpperCase();
  const ticketId = `PE-2026-${randHex}`;

  // Estimate price range according to issue selection
  let minCost = 800;
  let maxCost = 1500;
  if (selectedIssues.includes('Display Screen Damage')) { minCost += 2000; maxCost += 5000; }
  if (selectedIssues.includes('Backlight / Blank Screen')) { minCost += 1200; maxCost += 2500; }
  if (selectedIssues.includes('Power Supply failure')) { minCost += 800; maxCost += 1500; }
  
  const computedPrice = `₹${minCost} - ₹${maxCost}`;

  // Create new repair object
  const newRepair = {
    id: ticketId,
    name: name,
    phone: phone,
    tvType: tvType,
    brand: selectedBrand,
    issues: [...selectedIssues],
    comment: comment || 'None specified.',
    date: date,
    slot: selectedSlot,
    status: 'Received',
    techComment: 'Service ticket registered successfully. Awaiting device drop-off or pickup schedule evaluation.',
    priceRange: computedPrice
  };

  // Push to local DB array & save
  repairsDb.unshift(newRepair);
  saveDatabase();

  // Hide Wizard Controls & Steppers
  document.querySelector('.wizard-stepper').style.display = 'none';
  document.querySelectorAll('.wizard-step-panel').forEach(p => p.style.display = 'none');
  document.querySelector('.wizard-footer').style.display = 'none';

  // Populate Success box fields
  document.getElementById('success-ticket-id').innerText = ticketId;
  const successBox = document.getElementById('wizard-success-box');
  successBox.style.display = 'block';
  successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Update CRM dashboard listing if initialized
  if (isCrmAuthenticated) {
    renderCRMJobs();
  }
}

function copyTicketId() {
  const code = document.getElementById('success-ticket-id').innerText;
  navigator.clipboard.writeText(code).then(() => {
    const btn = document.getElementById('btn-copy-ticket');
    btn.innerHTML = '<i class="fa-solid fa-check" style="color: var(--accent-success);"></i>';
    btn.style.borderColor = 'var(--accent-success)';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      btn.style.borderColor = 'var(--border-color)';
    }, 2000);
  });
}

function resetBookingWizard() {
  // Clear fields
  document.getElementById('booking-name').value = '';
  document.getElementById('booking-phone').value = '';
  document.getElementById('booking-comment').value = '';
  
  // Clear selections
  selectedBrand = '';
  selectedIssues = [];
  document.querySelectorAll('.selection-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.issue-card').forEach(c => c.classList.remove('selected'));
  
  // Reset navigation
  currentWizardStep = 1;
  
  // Show Wizard layouts
  document.querySelector('.wizard-stepper').style.display = 'flex';
  document.querySelectorAll('.wizard-step-panel').forEach((p, i) => {
    p.style.display = i === 0 ? 'block' : 'none';
    p.className = i === 0 ? 'wizard-step-panel active' : 'wizard-step-panel';
  });
  
  document.querySelector('.wizard-footer').style.display = 'flex';
  document.getElementById('wizard-success-box').style.display = 'none';

  // Reset stepper nodes
  document.querySelectorAll('.step-node').forEach((node, index) => {
    node.className = index === 0 ? 'step-node active' : 'step-node';
    node.innerText = index + 1;
  });
  
  const progressLine = document.getElementById('wizard-progress');
  if (progressLine) progressLine.style.width = '0%';

  updateWizardButtons();
}

function switchToTrackerFromSuccess() {
  const ticketId = document.getElementById('success-ticket-id').innerText;
  document.getElementById('tracker-search-input').value = ticketId;
  resetBookingWizard();
  switchTab('track');
}

// ==========================================
// 6. CUSTOMER REPAIR TIMELINE TRACKER
// ==========================================
function trackTicketSearch() {
  const searchInput = document.getElementById('tracker-search-input');
  const ticketId = searchInput.value.trim().toUpperCase();
  
  const displayPanel = document.getElementById('tracker-display-panel');
  const errorPanel = document.getElementById('tracker-error-panel');
  
  if (!ticketId) {
    alert('Please input a valid Repair Ticket Code.');
    searchInput.focus();
    return;
  }

  // Query Database
  const job = repairsDb.find(r => r.id === ticketId);

  if (job) {
    errorPanel.style.display = 'none';
    displayPanel.classList.add('active');

    // Populate job details
    document.getElementById('track-device-desc').innerText = `${job.brand} ${job.tvType}`;
    document.getElementById('track-logged-date').innerText = job.date;
    
    // Setup status badge style
    const badge = document.getElementById('track-status-badge');
    badge.innerText = getDisplayStatusText(job.status);
    badge.className = 'badge ' + getStatusBadgeClass(job.status);

    // Compute progress timeline stepper
    updateTimelineProgress(job.status);

    // Populate technician comments
    const techCard = document.getElementById('tracker-tech-card');
    const commentBox = document.getElementById('track-tech-comment');
    if (job.techComment) {
      techCard.style.display = 'block';
      commentBox.innerText = `"${job.techComment}"`;
    } else {
      techCard.style.display = 'none';
    }

    displayPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    displayPanel.classList.remove('active');
    errorPanel.style.display = 'block';
    errorPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function getDisplayStatusText(status) {
  const mapping = {
    'Received': 'Logged',
    'Diagnostics': 'Diagnosing',
    'Repairing': 'In Repair',
    'QC': 'Stress Testing',
    'Ready': 'Completed'
  };
  return mapping[status] || status;
}

function getStatusBadgeClass(status) {
  const mapping = {
    'Received': 'badge-blue',
    'Diagnostics': 'badge-purple',
    'Repairing': 'badge-warning',
    'QC': 'badge-cyan',
    'Ready': 'badge-success'
  };
  return mapping[status] || 'badge-blue';
}

function updateTimelineProgress(status) {
  const steps = ['Received', 'Diagnostics', 'Repairing', 'QC', 'Ready'];
  const currentIdx = steps.indexOf(status);

  // Update progress line height mapping (0% to 100%)
  const progressLine = document.getElementById('tracker-progress-line');
  if (progressLine) {
    const percentHeight = currentIdx === 0 ? 0 : (currentIdx / 4) * 100;
    progressLine.style.height = `${percentHeight}%`;
  }

  // Update each stepper node states
  steps.forEach((step, idx) => {
    const stepEl = document.getElementById(`timeline-step-${idx + 1}`);
    if (stepEl) {
      stepEl.className = 'timeline-step'; // reset
      
      if (idx < currentIdx) {
        stepEl.classList.add('completed');
        stepEl.querySelector('.timeline-node').innerHTML = '<i class="fa-solid fa-check"></i>';
      } else if (idx === currentIdx) {
        stepEl.classList.add('active');
        stepEl.querySelector('.timeline-node').innerHTML = getStepNodeIcon(step);
      } else {
        stepEl.querySelector('.timeline-node').innerHTML = getStepNodeIcon(step);
      }
    }
  });
}

function getStepNodeIcon(step) {
  const mapping = {
    'Received': '<i class="fa-solid fa-receipt"></i>',
    'Diagnostics': '<i class="fa-solid fa-screwdriver-wrench"></i>',
    'Repairing': '<i class="fa-solid fa-fire"></i>',
    'QC': '<i class="fa-solid fa-vial-circle-check"></i>',
    'Ready': '<i class="fa-solid fa-circle-check"></i>'
  };
  return mapping[step] || '•';
}

// ==========================================
// 7. TECHNICIAN CRM PORTAL CONTROLLER
// ==========================================
function openCRMModal() {
  document.getElementById('crm-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden'; // block parent scroll

  // Reset display card
  if (isCrmAuthenticated) {
    document.getElementById('crm-login-block').style.display = 'none';
    document.getElementById('crm-workstation').style.display = 'block';
    renderCRMJobs();
  } else {
    document.getElementById('crm-login-block').style.display = 'block';
    document.getElementById('crm-workstation').style.display = 'none';
    document.getElementById('crm-pass-input').value = '';
    document.getElementById('crm-login-error').style.display = 'none';
    document.getElementById('crm-pass-input').focus();
  }
}

function closeCRMModal() {
  document.getElementById('crm-modal-overlay').classList.remove('active');
  document.body.style.overflow = 'auto'; // release scroll
}

function checkCRMLoginEnter(event) {
  if (event.key === 'Enter') {
    submitCRMLogin();
  }
}

function submitCRMLogin() {
  const pin = document.getElementById('crm-pass-input').value.trim();
  const errorEl = document.getElementById('crm-login-error');
  
  if (pin === '1234' || pin === 'admin' || pin === '') { // Allow bypass/empty password for developer local testing
    isCrmAuthenticated = true;
    errorEl.style.display = 'none';
    
    // Swap overlays
    document.getElementById('crm-login-block').style.display = 'none';
    document.getElementById('crm-workstation').style.display = 'block';
    renderCRMJobs();
  } else {
    errorEl.style.display = 'block';
    document.getElementById('crm-pass-input').value = '';
    document.getElementById('crm-pass-input').focus();
  }
}

function renderCRMJobs() {
  const tableBody = document.getElementById('crm-table-body');
  
  // Calculate and update stats counters
  updateCRMStats();

  if (!tableBody) return;
  tableBody.innerHTML = '';

  if (repairsDb.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 0;">No active repair jobs in database.</td></tr>`;
    return;
  }

  // Iterate over DB array and build rows
  repairsDb.forEach(job => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td><span class="table-ticket-id">${job.id}</span></td>
      <td>
        <div class="table-client-name">${job.name}</div>
        <div class="table-client-contact"><i class="fa-solid fa-phone" style="font-size: 0.7rem;"></i> ${job.phone}</div>
      </td>
      <td>
        <div><strong>${job.brand}</strong></div>
        <div style="font-size: 0.75rem; color: var(--text-secondary);">${job.tvType}</div>
      </td>
      <td>
        <div style="font-size: 0.8rem; font-weight: 500;">${job.date}</div>
        <div style="font-size: 0.7rem; color: var(--text-muted);">${job.slot.split(':')[0]}</div>
      </td>
      <td><span class="badge ${getStatusBadgeClass(job.status)}">${getDisplayStatusText(job.status)}</span></td>
      <td>
        <button class="table-action-btn" onclick="openCRMEditPanel('${job.id}')">
          <i class="fa-solid fa-pen-to-square"></i> Manage
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

function updateCRMStats() {
  const total = repairsDb.length;
  const active = repairsDb.filter(r => r.status !== 'Ready').length;
  const completed = repairsDb.filter(r => r.status === 'Ready').length;
  
  // Approximate dynamic month billing revenue
  let revenue = 0;
  repairsDb.forEach(job => {
    const textRange = job.priceRange || '₹1,500 - ₹2,500';
    const cleanNum = parseInt(textRange.split('-')[1].replace(/[₹, +]/g, '').trim()) || 2000;
    revenue += cleanNum;
  });

  document.getElementById('crm-stat-total').innerText = total;
  document.getElementById('crm-stat-active').innerText = active;
  document.getElementById('crm-stat-completed').innerText = completed;
  document.getElementById('crm-stat-revenue').innerText = '₹' + revenue.toLocaleString('en-IN');
  
  // Sync homepage live stats
  const mainStatsEl = document.getElementById('hero-stat-jobs');
  if (mainStatsEl) {
    mainStatsEl.innerText = `${completed}+`;
  }
}

// CRM Update Panel overlays
function openCRMEditPanel(ticketId) {
  const job = repairsDb.find(r => r.id === ticketId);
  if (!job) return;

  document.getElementById('edit-ticket-id').value = job.id;
  document.getElementById('edit-client-name').innerText = job.name;
  document.getElementById('edit-device-desc').innerText = `${job.brand} (${job.tvType}) - Symptom: ${job.issues.join(', ')}`;
  document.getElementById('edit-status-select').value = job.status;
  document.getElementById('edit-tech-comment').value = job.techComment || '';

  // Open sliding edit overlay
  document.getElementById('crm-edit-overlay').classList.add('active');
}

function closeCRMEditPanel() {
  document.getElementById('crm-edit-overlay').classList.remove('active');
}

function saveCRMOrderUpdate() {
  const ticketId = document.getElementById('edit-ticket-id').value;
  const status = document.getElementById('edit-status-select').value;
  const comment = document.getElementById('edit-tech-comment').value.trim();

  // Find job inside DB
  const idx = repairsDb.findIndex(r => r.id === ticketId);
  if (idx === -1) return;

  repairsDb[idx].status = status;
  repairsDb[idx].techComment = comment;

  // Persist
  saveDatabase();
  
  // Re-render components
  renderCRMJobs();
  closeCRMEditPanel();

  // If customer tracking window is searching for this updated ticket, refresh customer timeline immediately!
  const currentTrackerSearch = document.getElementById('tracker-search-input').value.trim().toUpperCase();
  if (currentTrackerSearch === ticketId) {
    trackTicketSearch();
  }
}

// ==========================================
// 8. FAQ ACCORDION HANDLER
// ==========================================
function toggleFaq(header) {
  const item = header.parentElement;
  const body = item.querySelector('.faq-body');
  
  const isOpen = item.classList.contains('open');
  
  // Close all other accordions first
  document.querySelectorAll('.faq-item').forEach(i => {
    i.classList.remove('open');
    i.querySelector('.faq-body').style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    // Compute exact scrollHeight and animate max-height smoothly
    body.style.maxHeight = body.scrollHeight + 'px';
  } else {
    item.classList.remove('open');
    body.style.maxHeight = '0';
  }
}

// ==========================================
// 9. THEME CONTROLLER (LIGHT/DARK TOGGLE ENGINE)
// ==========================================
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  const toggleIcon = document.querySelector('#theme-toggle-btn i');
  
  if (savedTheme === 'dark') {
    html.classList.add('dark-theme');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-sun';
    }
  } else {
    html.classList.remove('dark-theme');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-moon';
    }
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const toggleIcon = document.querySelector('#theme-toggle-btn i');
  
  if (html.classList.contains('dark-theme')) {
    html.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-moon';
    }
  } else {
    html.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    if (toggleIcon) {
      toggleIcon.className = 'fa-solid fa-sun';
    }
  }
}
