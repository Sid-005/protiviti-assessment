const navButtons = document.querySelectorAll('.nav-btn');
const screens = {
  intro: document.getElementById('screen-intro'),
  form: document.getElementById('screen-form'),
  status: document.getElementById('screen-status'),
};

const startClaimBtn = document.getElementById('start-claim-btn');
const form = document.getElementById('claim-form');
const prevStepBtn = document.getElementById('prev-step-btn');
const nextStepBtn = document.getElementById('next-step-btn');
const submitClaimBtn = document.getElementById('submit-claim-btn');
const progressFill = document.getElementById('form-progress-fill');
const progressLabel = document.getElementById('form-progress-label');
const validationMsg = document.getElementById('validation-msg');
const stepPills = Array.from(document.querySelectorAll('[data-step-pill]'));
const viewStatusBtn = document.getElementById('view-status-btn');
const submittedClaimId = document.getElementById('submitted-claim-id');

const policySelect = document.getElementById('insurance-policy');
const claimItemSelect = document.getElementById('claim-item');
const claimItemMeta = document.getElementById('claim-item-meta');
const metaMaxPayout = document.getElementById('meta-max-payout');
const metaSubmitWindow = document.getElementById('meta-submit-window');

const stateLabel = document.getElementById('current-state');
const decisionExplainer = document.getElementById('decision-explainer');
const reviewActions = document.getElementById('review-actions');
const approveBtn = document.getElementById('approve-btn');
const rejectBtn = document.getElementById('reject-btn');
const emailPreview = document.getElementById('email-template-preview');
const notificationLog = document.getElementById('notification-log');

const steps = Array.from(document.querySelectorAll('.form-step'));
const nodes = {
  start: document.querySelector('.node[data-state="start"]'),
  submitted: document.querySelector('.node[data-state="submitted"]'),
  review: document.querySelector('.node[data-state="review"]'),
  approved: document.querySelector('.node[data-state="approved"]'),
  rejected: document.querySelector('.node[data-state="rejected"]'),
};

const policyCatalog = {
  'peace-of-mind': {
    label: 'Peace of Mind - Home and Contents Plan',
    items: [
      {
        id: 'home-gadget-protection',
        label: 'Gadget Protection',
        details: 'Laptop/phone/tablet accidental damage or theft from home with forced entry',
        maxPayout: 'HKD 10,000',
        submitWithin: '10 days',
      },
      {
        id: 'home-contents-cover',
        label: 'Home Contents Cover',
        details: 'Theft with forced entry, fire/smoke damage, or water damage to belongings',
        maxPayout: 'HKD 30,000',
        submitWithin: '30 days',
      },
      {
        id: 'home-personal-liability',
        label: 'Personal / Third-Party Liability',
        details: 'Liability claims involving personal injury or third-party property loss',
        maxPayout: 'HKD 100,000',
        submitWithin: '15 days',
      },
      {
        id: 'home-burst-pipe',
        label: 'Burst Pipe / Water Leak Incident Support',
        details: 'Emergency support for burst pipe and related water leak incidents',
        maxPayout: 'HKD 5,000',
        submitWithin: '7 days',
      },
    ],
  },
  traveltop: {
    label: 'TravelTop - Travel Insurance Plan',
    items: [
      {
        id: 'travel-trip-delay',
        label: 'Trip Delay (6 hours or more)',
        details: 'Compensation for significant travel delay during trip',
        maxPayout: 'HKD 1,000',
        submitWithin: '14 days',
      },
      {
        id: 'travel-gadget-protection',
        label: 'Gadget Protection',
        details: 'Lost/theft of laptop/phone/tablet overseas with police report',
        maxPayout: 'HKD 10,000',
        submitWithin: '14 days',
      },
      {
        id: 'travel-lost-baggage',
        label: 'Lost Checked Baggage',
        details: 'Coverage for permanently lost checked baggage',
        maxPayout: 'HKD 5,000',
        submitWithin: '7 days',
      },
      {
        id: 'travel-emergency-medical',
        label: 'Emergency Medical / Hospitalization Overseas',
        details: 'Emergency treatment and hospitalization while overseas',
        maxPayout: 'HKD 40,000',
        submitWithin: '10 days',
      },
    ],
  },
};

const emailTemplates = {
  submitted: ({ name, claimId }) =>
    `Subject: Claim Submitted - ${claimId}\n\nHi ${name},\n\nYour claim has been successfully submitted.\nClaim ID: ${claimId}\n\nWe will notify you about the next transition soon.\n\n- ClaimsBuddy`,
  review: ({ name, claimId }) =>
    `Subject: Claim Under Review - ${claimId}\n\nHi ${name},\n\nYour claim is now under review by our team.\nClaim ID: ${claimId}\n\nWe will send another update once a decision is made.\n\n- ClaimsBuddy`,
  approved: ({ name, claimId }) =>
    `Subject: Claim Approved - ${claimId}\n\nHi ${name},\n\nGood news. Your claim has been approved.\nClaim ID: ${claimId}\n\nPayment details and next steps will follow in a separate message.\n\n- ClaimsBuddy`,
  rejected: ({ name, claimId }) =>
    `Subject: Claim Rejected - ${claimId}\n\nHi ${name},\n\nYour claim has been rejected after validation.\nClaim ID: ${claimId}\n\nPlease contact support if you need help or want to appeal.\n\n- ClaimsBuddy`,
};

let currentStep = 1;
let currentState = 'start';
let claimContext = {
  claimId: 'N/A',
  name: 'Customer',
  email: '',
  policy: '',
  claimItem: '',
  amount: 0,
  isComplex: false,
};

function showScreen(screenKey) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle('is-visible', key === screenKey);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.screen === screenKey);
  });
}

function updateStepUI() {
  steps.forEach((step) => {
    step.classList.toggle('is-visible', Number(step.dataset.step) === currentStep);
  });

  stepPills.forEach((pill) => {
    const pillStep = Number(pill.dataset.stepPill);
    pill.classList.toggle('is-active', pillStep === currentStep);
    pill.classList.toggle('is-complete', pillStep < currentStep);
  });

  const percent = (currentStep / steps.length) * 100;
  progressFill.style.width = `${percent}%`;
  progressLabel.textContent = `Stage ${currentStep} of ${steps.length}`;

  const isSubmittedPage = currentStep === steps.length;
  prevStepBtn.disabled = currentStep === 1 || isSubmittedPage;
  nextStepBtn.hidden = currentStep !== 1;
  submitClaimBtn.hidden = currentStep !== 2;
  prevStepBtn.hidden = isSubmittedPage;
}

function validateStep() {
  validationMsg.textContent = '';

  if (currentStep === 2) {
    const selectedDocs = form.querySelectorAll('input[name="documents"]:checked');
    if (selectedDocs.length === 0) {
      validationMsg.textContent = 'Select at least one document before submitting your claim.';
      return false;
    }
    return true;
  }

  const currentStepEl = steps[currentStep - 1];
  const requiredFields = Array.from(currentStepEl.querySelectorAll('[required]'));

  for (const field of requiredFields) {
    if (!field.value.trim()) {
      validationMsg.textContent = 'Please complete all required fields for this stage.';
      return false;
    }
  }

  return true;
}

function setClaimItemOptions(policyKey) {
  const policy = policyCatalog[policyKey];
  claimItemSelect.innerHTML = '';

  if (!policy) {
    claimItemSelect.disabled = true;
    claimItemSelect.innerHTML = '<option value="">Select policy first</option>';
    claimItemMeta.hidden = true;
    return;
  }

  claimItemSelect.disabled = false;
  claimItemSelect.innerHTML = '<option value="">Select your claim item</option>';

  policy.items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label;
    claimItemSelect.append(option);
  });

  claimItemMeta.hidden = true;
}

function getSelectedItem() {
  const selectedPolicy = policyCatalog[policySelect.value];
  if (!selectedPolicy) {
    return null;
  }
  return selectedPolicy.items.find((item) => item.id === claimItemSelect.value) || null;
}

function updateClaimItemMeta() {
  const selectedItem = getSelectedItem();
  if (!selectedItem) {
    claimItemMeta.hidden = true;
    return;
  }

  metaMaxPayout.textContent = selectedItem.maxPayout;
  metaSubmitWindow.textContent = selectedItem.submitWithin;
  claimItemMeta.hidden = false;
}

function transitionTo(nextState) {
  currentState = nextState;
  const labels = {
    start: 'Start Claim',
    submitted: 'Claim Submitted',
    review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
  };

  stateLabel.textContent = labels[currentState];

  Object.values(nodes).forEach((node) => {
    node.classList.remove('is-active', 'is-done');
  });

  const order = ['start', 'submitted', 'review', 'approved'];
  if (currentState === 'rejected') {
    nodes.start.classList.add('is-done');
    nodes.submitted.classList.add('is-done');
    if (claimContext.isComplex) {
      nodes.review.classList.add('is-done');
    }
    nodes.rejected.classList.add('is-active');
  } else {
    order.forEach((state, index) => {
      const activeIndex = order.indexOf(currentState);
      if (index < activeIndex) {
        nodes[state].classList.add('is-done');
      } else if (index === activeIndex) {
        nodes[state].classList.add('is-active');
      }
    });
  }

  const explanations = {
    start: 'Claim process not started yet.',
    submitted: 'Claim submitted successfully. Automated checks are running.',
    review: 'Complex claim detected. Waiting for manual reviewer decision.',
    approved: 'Claim approved. Settlement flow can now continue.',
    rejected: 'Claim rejected based on validation or review outcome.',
  };

  decisionExplainer.textContent = explanations[currentState];
  reviewActions.hidden = currentState !== 'review';

  if (nextState !== 'start') {
    sendEmailNotification(nextState);
  }
}

function sendEmailNotification(state) {
  const templateFn = emailTemplates[state];
  if (!templateFn) {
    return;
  }

  const emailBody = templateFn(claimContext);
  emailPreview.textContent = emailBody;

  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleString()} - ${state.toUpperCase()} email sent to ${claimContext.email || 'user'}`;
  notificationLog.prepend(item);
}

function evaluateAutoDecision() {
  const amount = Number(form.claimAmount.value || 0);
  const descLength = (form.description.value || '').trim().length;

  claimContext.amount = amount;
  claimContext.isComplex = amount > 5000 || descLength < 20;

  if (amount <= 2500 && descLength >= 25) {
    transitionTo('approved');
    return;
  }

  if (amount > 2500 && descLength < 25) {
    transitionTo('rejected');
    return;
  }

  transitionTo('review');
}

function getStoredClaimIds() {
  try {
    const raw = localStorage.getItem('claimsbuddy.generatedClaimIds');
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function storeClaimId(claimId) {
  const ids = getStoredClaimIds();
  ids.add(claimId);
  localStorage.setItem('claimsbuddy.generatedClaimIds', JSON.stringify(Array.from(ids)));
}

function generateUniqueClaimId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const existing = getStoredClaimIds();

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    let randomPart = '';
    for (let i = 0; i < 7; i += 1) {
      randomPart += chars[Math.floor(Math.random() * chars.length)];
    }
    const id = `PRO-${randomPart}`;
    if (!existing.has(id)) {
      storeClaimId(id);
      return id;
    }
  }

  const fallback = `PRO-${Date.now().toString().slice(-7)}`;
  storeClaimId(fallback);
  return fallback;
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    showScreen(btn.dataset.screen);
  });
});

startClaimBtn.addEventListener('click', () => {
  showScreen('form');
});

policySelect.addEventListener('change', () => {
  setClaimItemOptions(policySelect.value);
});

claimItemSelect.addEventListener('change', updateClaimItemMeta);

prevStepBtn.addEventListener('click', () => {
  if (currentStep > 1) {
    currentStep -= 1;
    updateStepUI();
  }
});

nextStepBtn.addEventListener('click', () => {
  if (!validateStep()) {
    return;
  }

  if (currentStep === 1) {
    currentStep = 2;
    updateStepUI();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateStep()) {
    return;
  }

  const selectedPolicy = policyCatalog[policySelect.value];
  const selectedItem = getSelectedItem();
  const generatedId = generateUniqueClaimId();
  submittedClaimId.textContent = generatedId;

  claimContext = {
    claimId: generatedId,
    name: form.fullName.value.trim(),
    email: form.email.value.trim(),
    policy: selectedPolicy ? selectedPolicy.label : '',
    claimItem: selectedItem ? selectedItem.label : '',
    amount: Number(form.claimAmount.value || 0),
    isComplex: false,
  };

  transitionTo('submitted');
  evaluateAutoDecision();

  currentStep = 3;
  updateStepUI();
});

viewStatusBtn.addEventListener('click', () => {
  showScreen('status');
});

approveBtn.addEventListener('click', () => {
  transitionTo('approved');
});

rejectBtn.addEventListener('click', () => {
  transitionTo('rejected');
});

updateStepUI();
setClaimItemOptions('');
transitionTo('start');
showScreen('intro');
