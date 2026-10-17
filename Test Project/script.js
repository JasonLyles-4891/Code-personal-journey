document.addEventListener('DOMContentLoaded', () => {
  const card = document.getElementById('businessCard');
  const form = document.getElementById('leadForm');
  const leadList = document.getElementById('leadList');
  const statusBox = document.getElementById('statusMessage');
  const phoneLink = document.getElementById('phoneLink');
  const toast = document.getElementById('toast');
  const storageKey = 'newWayContacts';
  let toastTimer;

  const setStatus = (message, isError = false) => {
    if (!statusBox) return;
    statusBox.textContent = message;
    statusBox.classList.toggle('error', isError);
  };

  const getScanUrl = () => {
    const baseUrl =
      window.location.origin && window.location.origin !== 'null'
        ? `${window.location.origin}${window.location.pathname}`
        : 'https://yourdomain.com/contact-form';

    return `${baseUrl}?capture=true`;
  };

  const saveLeads = (leads) => {
    localStorage.setItem(storageKey, JSON.stringify(leads));
  };

  const loadLeads = () => {
    const savedData = localStorage.getItem(storageKey);

    if (!savedData) {
      return [];
    }

    try {
      const parsed = JSON.parse(savedData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Could not read saved contacts:', error);
      return [];
    }
  };

  const renderLeads = () => {
    if (!leadList) return;

    const leads = loadLeads();

    if (!leads.length) {
      leadList.innerHTML = '<li class="empty">No customer or business contact info captured yet.</li>';
      return;
    }

    leadList.innerHTML = leads
      .map(
        (lead) => `
          <li>
            <strong>${escapeHtml(lead.name || 'Unknown')}</strong><br />
            ${lead.company ? `${escapeHtml(lead.company)}<br />` : ''}
            ${lead.phone ? `${escapeHtml(lead.phone)}<br />` : ''}
            ${lead.email ? `${escapeHtml(lead.email)}<br />` : ''}
            ${lead.notes ? `${escapeHtml(lead.notes)}` : ''}
          </li>
        `
      )
      .join('');
  };

  const escapeHtml = (value) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  if (card) {
    requestAnimationFrame(() => {
      setTimeout(() => card.classList.add('is-visible'), 50);
    });
  }

  if (window.QRCode) {
    new QRCode(document.getElementById('qrCode'), {
      text: [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'N:Lyles;Jason;;;',
        'FN:Jason Lyles',
        'ORG:New Way Essentials LLC',
        'TITLE:Owner',
        'TEL;TYPE=WORK,VOICE:+19313236373',
        'EMAIL:newwayessentials3@gmail.com',
        'END:VCARD'
      ].join('\n'),
      width: 150,
      height: 150,
      colorDark: '#0B1F5D',
      colorLight: '#F4D03F',
      correctLevel: QRCode.CorrectLevel.H
    });

    new QRCode(document.getElementById('leadQr'), {
      text: getScanUrl(),
      width: 150,
      height: 150,
      colorDark: '#FFFFFF',
      colorLight: '#0B1F5D',
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  if (phoneLink && toast) {
    phoneLink.addEventListener('click', () => {
      const number = phoneLink.querySelector('span').textContent.trim();

      if (navigator.clipboard) {
        navigator.clipboard.writeText(number).catch(() => {});
      }

      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 1800);
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const company = (formData.get('company') || '').toString().trim();
      const phone = (formData.get('phone') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const notes = (formData.get('notes') || '').toString().trim();

      if (!name || !phone) {
        setStatus('Please enter a full name and phone number.', true);
        return;
      }

      const leads = loadLeads();
      leads.unshift({ name, company, phone, email, notes, capturedAt: new Date().toISOString() });
      saveLeads(leads.slice(0, 25));
      renderLeads();
      form.reset();
      setStatus('Customer or business contact saved successfully.');
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('capture') === 'true') {
    setStatus('Scan complete. Please fill in your contact details below.');
  }

  renderLeads();
});
