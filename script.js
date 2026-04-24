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
const decisionPreviewText = document.getElementById('decision-preview-text');

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
  progressLabel.textContent = `Step ${currentStep} of ${steps.length}`;

  prevStepBtn.disabled = currentStep === 1;
  nextStepBtn.hidden = currentStep === steps.length;
  submitClaimBtn.hidden = currentStep !== steps.length;
}

function validateStep() {
  validationMsg.textContent = '';
  const currentStepEl = steps[currentStep - 1];
  const requiredFields = Array.from(currentStepEl.querySelectorAll('[required]'));

  for (const field of requiredFields) {
    if (field.type === 'checkbox') {
      if (!field.checked) {
        validationMsg.textContent = 'Please confirm the declaration before continuing.';
        return false;
      }
      continue;
    }

    if (!field.value.trim()) {
      validationMsg.textContent = 'Please complete all required fields for this step.';
      return false;
    }
  }

  return true;
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

  const showReviewButtons = currentState === 'review';
  reviewActions.hidden = !showReviewButtons;

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
  // Simple rules: small amounts with sufficient note length auto-approve,
  // suspiciously tiny notes on larger claims auto-reject, else manual review.
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

function updateDecisionPreview() {
  const amount = Number(form.claimAmount.value || 0);
  const descLength = (form.description.value || '').trim().length;

  if (!amount && !descLength) {
    decisionPreviewText.textContent = 'Pending input';
    return;
  }

  if (amount <= 2500 && descLength >= 25) {
    decisionPreviewText.textContent = 'Likely auto-approval';
    return;
  }

  if (amount > 2500 && descLength < 25) {
    decisionPreviewText.textContent = 'Likely auto-rejection';
    return;
  }

  decisionPreviewText.textContent = 'Likely routed to Under Review';
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    showScreen(btn.dataset.screen);
  });
});

startClaimBtn.addEventListener('click', () => {
  showScreen('form');
});

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
  if (currentStep < steps.length) {
    currentStep += 1;
    updateStepUI();
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validateStep()) {
    return;
  }

  claimContext = {
    claimId: `CLM-${Math.floor(Math.random() * 900000 + 100000)}`,
    name: form.fullName.value.trim(),
    email: form.email.value.trim(),
    amount: Number(form.claimAmount.value || 0),
    isComplex: false,
  };

  transitionTo('submitted');
  evaluateAutoDecision();
  showScreen('status');
});

approveBtn.addEventListener('click', () => {
  transitionTo('approved');
});

rejectBtn.addEventListener('click', () => {
  transitionTo('rejected');
});

form.claimAmount.addEventListener('input', updateDecisionPreview);
form.description.addEventListener('input', updateDecisionPreview);

updateStepUI();
transitionTo('start');
updateDecisionPreview();
showScreen('intro');
