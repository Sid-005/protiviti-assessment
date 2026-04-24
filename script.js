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

const claimsListEl = document.getElementById('claims-list');
const claimDetailEl = document.getElementById('claim-detail');
const detailClaimId = document.getElementById('detail-claim-id');
const detailHeadline = document.getElementById('detail-headline');
const detailReason = document.getElementById('detail-reason');
const detailStatusBadge = document.getElementById('detail-status-badge');
const detailPolicy = document.getElementById('detail-policy');
const detailItem = document.getElementById('detail-item');
const detailAmount = document.getElementById('detail-amount');
const detailUpdated = document.getElementById('detail-updated');
const detailReviewActions = document.getElementById('detail-review-actions');
const detailApproveBtn = document.getElementById('detail-approve-btn');
const detailRejectBtn = document.getElementById('detail-reject-btn');
const emailPreview = document.getElementById('email-template-preview');
const notificationLog = document.getElementById('notification-log');

const steps = Array.from(document.querySelectorAll('.form-step'));

const STORAGE_KEYS = {
  claimIds: 'claimsbuddy.generatedClaimIds',
  claims: 'claimsbuddy.claims',
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
        maxPayoutAmount: 10000,
        submitWithin: '10 days',
      },
      {
        id: 'home-contents-cover',
        label: 'Home Contents Cover',
        details: 'Theft with forced entry, fire/smoke damage, or water damage to belongings',
        maxPayout: 'HKD 30,000',
        maxPayoutAmount: 30000,
        submitWithin: '30 days',
      },
      {
        id: 'home-personal-liability',
        label: 'Personal / Third-Party Liability',
        details: 'Liability claims involving personal injury or third-party property loss',
        maxPayout: 'HKD 100,000',
        maxPayoutAmount: 100000,
        submitWithin: '15 days',
      },
      {
        id: 'home-burst-pipe',
        label: 'Burst Pipe / Water Leak Incident Support',
        details: 'Emergency support for burst pipe and related water leak incidents',
        maxPayout: 'HKD 5,000',
        maxPayoutAmount: 5000,
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
        maxPayoutAmount: 1000,
        submitWithin: '14 days',
      },
      {
        id: 'travel-gadget-protection',
        label: 'Gadget Protection',
        details: 'Lost/theft of laptop/phone/tablet overseas with police report',
        maxPayout: 'HKD 10,000',
        maxPayoutAmount: 10000,
        submitWithin: '14 days',
      },
      {
        id: 'travel-lost-baggage',
        label: 'Lost Checked Baggage',
        details: 'Coverage for permanently lost checked baggage',
        maxPayout: 'HKD 5,000',
        maxPayoutAmount: 5000,
        submitWithin: '7 days',
      },
      {
        id: 'travel-emergency-medical',
        label: 'Emergency Medical / Hospitalization Overseas',
        details: 'Emergency treatment and hospitalization while overseas',
        maxPayout: 'HKD 40,000',
        maxPayoutAmount: 40000,
        submitWithin: '10 days',
      },
    ],
  },
  other: {
    label: 'Other',
    items: [
      {
        id: 'other',
        label: 'Other',
        details: 'Claims outside supported policy items',
        maxPayout: '-',
        maxPayoutAmount: null,
        submitWithin: '-',
      },
    ],
  },
};

const requiredDocuments = [
  { id: 'photo-id', label: 'Government-issued Photo ID' },
  { id: 'policy-copy', label: 'Policy Copy / Policy Number Proof' },
  { id: 'incident-proof', label: 'Incident Evidence (reports/photos)' },
  { id: 'invoice-receipts', label: 'Bills / Invoices / Receipts' },
  { id: 'bank-details', label: 'Bank Details for Reimbursement' },
];

const statusConfig = {
  submitted: {
    label: 'Claim Submitted',
    badgeClass: 'badge-submitted',
    icon: 'bi-send-check',
    detail: 'Your claim has been submitted and is being validated.',
  },
  review: {
    label: 'Under Review',
    badgeClass: 'badge-review',
    icon: 'bi-hourglass-split',
    detail: 'Our team is reviewing the claim details and documents.',
  },
  approved: {
    label: 'Approved',
    badgeClass: 'badge-approved',
    icon: 'bi-check2-circle',
    detail: 'Great news. Your claim has been approved for payout processing.',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'badge-rejected',
    icon: 'bi-x-circle',
    detail: 'Your claim was rejected based on policy checks and submitted details.',
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
let selectedClaimId = null;
let claims = loadClaims();

function formatDate(dateISO) {
  return new Date(dateISO).toLocaleDateString('en-US');
}

function formatHKD(amount) {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function showScreen(screenKey) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.toggle('is-visible', key === screenKey);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.screen === screenKey);
  });

  if (screenKey === 'status') {
    renderClaimsList();
    renderClaimDetail();
  }
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
  prevStepBtn.hidden = isSubmittedPage;
  nextStepBtn.hidden = currentStep !== 1;
  submitClaimBtn.hidden = currentStep !== 2;
}

function validateStep() {
  validationMsg.textContent = '';

  if (currentStep === 2) {
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

  if (!policy.items.some((item) => item.id === 'other')) {
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Other';
    claimItemSelect.append(otherOption);
  }

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

  metaMaxPayout.textContent = selectedItem.maxPayout || '-';
  metaSubmitWindow.textContent = selectedItem.submitWithin || '-';
  claimItemMeta.hidden = false;
}

function loadClaims() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.claims);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage parse errors and use demo data.
  }

  return [
    {
      id: 'PRO-DEMOA21',
      policy: 'Peace of Mind - Home and Contents Plan',
      policyNumber: 'POL-789456',
      claimItem: 'Home Contents Cover',
      amount: 4500,
      email: 'demo@claimsbuddy.demo',
      fullName: 'Demo User',
      status: 'approved',
      isComplex: false,
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      notifications: [
        { state: 'submitted', at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { state: 'approved', at: new Date(Date.now() - 86400000 * 2).toISOString() },
      ],
    },
    {
      id: 'PRO-DEMOB34',
      policy: 'TravelTop - Travel Insurance Plan',
      policyNumber: 'POL-123789',
      claimItem: 'Emergency Medical / Hospitalization Overseas',
      amount: 1200,
      email: 'demo@claimsbuddy.demo',
      fullName: 'Demo User',
      status: 'review',
      isComplex: true,
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      notifications: [
        { state: 'submitted', at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { state: 'review', at: new Date(Date.now() - 86400000).toISOString() },
      ],
    },
  ];
}

function saveClaims() {
  localStorage.setItem(STORAGE_KEYS.claims, JSON.stringify(claims));
}

function getStoredClaimIds() {
  const fromClaims = claims.map((claim) => claim.id);
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.claimIds);
    const parsed = raw ? JSON.parse(raw) : [];
    const ids = Array.isArray(parsed) ? parsed : [];
    return new Set([...ids, ...fromClaims]);
  } catch {
    return new Set(fromClaims);
  }
}

function storeClaimId(claimId) {
  const ids = getStoredClaimIds();
  ids.add(claimId);
  localStorage.setItem(STORAGE_KEYS.claimIds, JSON.stringify(Array.from(ids)));
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

function evaluateClaimDecision({ policyKey, claimItemId, selectedItem, amount, selectedDocumentIds }) {
  const missingDocuments = requiredDocuments
    .filter((doc) => !selectedDocumentIds.includes(doc.id))
    .map((doc) => doc.label);

  if (policyKey === 'other' || claimItemId === 'other') {
    return {
      status: 'rejected',
      isComplex: false,
      reason:
        'Auto-rejected because "Other" was selected. This system currently handles only the listed policy claim items.',
      missingDocuments,
    };
  }

  if (!selectedItem || selectedItem.maxPayoutAmount == null) {
    return {
      status: 'review',
      isComplex: true,
      reason: 'Claim requires manual review because the selected item does not have a configured payout rule.',
      missingDocuments,
    };
  }

  if (amount > selectedItem.maxPayoutAmount) {
    return {
      status: 'review',
      isComplex: true,
      reason:
        `Claim amount exceeds maximum payout (${selectedItem.maxPayout}) allocated to this policy item and requires manual review.`,
      missingDocuments,
    };
  }

  if (missingDocuments.length > 0) {
    return {
      status: 'review',
      isComplex: true,
      reason: `Incomplete documents. Missing: ${missingDocuments.join(', ')}.`,
      missingDocuments,
    };
  }

  return {
    status: 'approved',
    isComplex: false,
    reason: 'Auto-approved: claim amount is within max payout and all required documents were submitted.',
    missingDocuments: [],
  };
}

function addNotification(claim, state) {
  claim.notifications = claim.notifications || [];
  claim.notifications.push({ state, at: new Date().toISOString() });
}

function renderClaimsList() {
  if (!claims.length) {
    claimsListEl.innerHTML = `
      <article class="empty-claims">
        <h3>No claims yet</h3>
        <p class="muted">Start your first claim to see tracking details here.</p>
        <button class="btn btn-primary" id="empty-start-claim">File New Claim</button>
      </article>
    `;
    return;
  }

  const sorted = [...claims].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  claimsListEl.innerHTML = sorted
    .map((claim) => {
      const cfg = statusConfig[claim.status] || statusConfig.submitted;
      const selectedClass = claim.id === selectedClaimId ? 'is-selected' : '';
      return `
        <article class="claim-card status-card-${claim.status} ${selectedClass}" data-claim-id="${claim.id}">
          <div class="claim-card-top">
            <div class="claim-card-id-wrap">
              <span class="claim-doc-icon"><i class="bi bi-file-earmark-text"></i></span>
              <div>
                <h3>${claim.id}</h3>
                <p class="muted">Policy: ${claim.policyNumber}</p>
              </div>
            </div>
            <span class="status-badge ${cfg.badgeClass}"><i class="bi ${cfg.icon}"></i> ${cfg.label}</span>
          </div>
          <div class="claim-card-meta">
            <div>
              <p class="meta-label">Claim Item</p>
              <p class="meta-value">${claim.claimItem}</p>
            </div>
            <div>
              <p class="meta-label">Claim Amount</p>
              <p class="meta-value">${formatHKD(claim.amount)}</p>
            </div>
            <div>
              <p class="meta-label">Last Updated</p>
              <p class="meta-value">${formatDate(claim.updatedAt)}</p>
            </div>
          </div>
          ${claim.reason ? `<p class="claim-reason-text">${claim.reason}</p>` : ''}
          <button type="button" class="ask-btn"><i class="bi bi-chat-left-text"></i> Ask Claim Buddy</button>
        </article>
      `;
    })
    .join('');
}

function getSelectedClaim() {
  if (!selectedClaimId) {
    return null;
  }
  return claims.find((claim) => claim.id === selectedClaimId) || null;
}

function renderClaimDetail() {
  const claim = getSelectedClaim();
  if (!claim) {
    claimDetailEl.hidden = true;
    return;
  }

  const cfg = statusConfig[claim.status] || statusConfig.submitted;
  claimDetailEl.hidden = false;

  detailClaimId.textContent = claim.id;
  detailHeadline.textContent = cfg.detail;
  detailReason.hidden = !claim.reason;
  detailReason.textContent = claim.reason || '';
  detailStatusBadge.className = `status-badge ${cfg.badgeClass}`;
  detailStatusBadge.innerHTML = `<i class="bi ${cfg.icon}"></i> ${cfg.label}`;
  detailPolicy.textContent = `${claim.policy} (${claim.policyNumber})`;
  detailItem.textContent = claim.claimItem;
  detailAmount.textContent = formatHKD(claim.amount);
  detailUpdated.textContent = formatDate(claim.updatedAt);

  detailReviewActions.hidden = claim.status !== 'review';

  const latestState = claim.notifications?.length
    ? claim.notifications[claim.notifications.length - 1].state
    : claim.status;
  const templateFn = emailTemplates[latestState] || emailTemplates.submitted;
  emailPreview.textContent = templateFn({
    name: claim.fullName || 'Customer',
    claimId: claim.id,
  });

  const notifications = (claim.notifications || []).slice().reverse();
  notificationLog.innerHTML = notifications
    .map((item) => `<li>${new Date(item.at).toLocaleString()} - ${item.state.toUpperCase()} update sent</li>`)
    .join('');
}

function setSelectedClaim(claimId) {
  selectedClaimId = claimId;
  renderClaimsList();
  renderClaimDetail();
}

function updateClaimStatus(claimId, nextStatus) {
  const claim = claims.find((item) => item.id === claimId);
  if (!claim) {
    return;
  }

  claim.status = nextStatus;
  claim.updatedAt = new Date().toISOString();
  addNotification(claim, nextStatus);
  saveClaims();
  renderClaimsList();
  renderClaimDetail();
}

function resetClaimFlow() {
  form.reset();
  validationMsg.textContent = '';
  currentStep = 1;
  setClaimItemOptions('');
  updateStepUI();
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.screen;
    if (target === 'form') {
      resetClaimFlow();
    }
    showScreen(target);
  });
});

startClaimBtn.addEventListener('click', () => {
  resetClaimFlow();
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
  const selectedDocumentIds = Array.from(form.querySelectorAll('input[name="documents"]:checked')).map(
    (checkbox) => checkbox.value,
  );
  const decision = evaluateClaimDecision({
    policyKey: policySelect.value,
    claimItemId: claimItemSelect.value,
    selectedItem,
    amount: Number(form.claimAmount.value || 0),
    selectedDocumentIds,
  });

  const claim = {
    id: generatedId,
    policy: selectedPolicy ? selectedPolicy.label : '',
    policyNumber: form.policyNumber.value.trim(),
    claimItem: selectedItem ? selectedItem.label : 'Unknown item',
    amount: Number(form.claimAmount.value || 0),
    email: form.email.value.trim(),
    fullName: form.fullName.value.trim(),
    status: decision.status,
    isComplex: decision.isComplex,
    reason: decision.reason,
    submittedDocuments: selectedDocumentIds,
    missingDocuments: decision.missingDocuments,
    updatedAt: new Date().toISOString(),
    notifications: [],
  };

  addNotification(claim, 'submitted');
  if (decision.status !== 'submitted') {
    addNotification(claim, decision.status);
  }

  claims.unshift(claim);
  saveClaims();
  submittedClaimId.textContent = generatedId;
  setSelectedClaim(generatedId);

  currentStep = 3;
  updateStepUI();
});

viewStatusBtn.addEventListener('click', () => {
  showScreen('status');
});

claimsListEl.addEventListener('click', (event) => {
  const startButton = event.target.closest('#empty-start-claim');
  if (startButton) {
    resetClaimFlow();
    showScreen('form');
    return;
  }

  const claimCard = event.target.closest('[data-claim-id]');
  if (!claimCard) {
    return;
  }

  setSelectedClaim(claimCard.dataset.claimId);
});

detailApproveBtn.addEventListener('click', () => {
  if (selectedClaimId) {
    updateClaimStatus(selectedClaimId, 'approved');
  }
});

detailRejectBtn.addEventListener('click', () => {
  if (selectedClaimId) {
    updateClaimStatus(selectedClaimId, 'rejected');
  }
});

if (claims.length) {
  selectedClaimId = claims[0].id;
  saveClaims();
}

updateStepUI();
setClaimItemOptions('');
renderClaimsList();
renderClaimDetail();
showScreen('intro');
