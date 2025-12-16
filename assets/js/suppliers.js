const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cGFwbGFiam9jeGFmdHFvY2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTcyOTQsImV4cCI6MjA4MTIzMzI5NH0.VpoV9d2XGkRTv5UoZFKiA23IOOV2zasV18pW_9JmCj4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let currentUserId = null;
let editingSupplierId = null;

// VAT patterns
const vatPatterns = {
    AT: /^U\d{8}$/,
    BE: /^(0\d{9}|\d{10})$/,
    BG: /^\d{9,10}$/,
    CY: /^\d{8}[A-Z]$/,
    CZ: /^\d{8,10}$/,
    DE: /^\d{9}$/,
    DK: /^\d{8}$/,
    EE: /^\d{9}$/,
    EL: /^\d{9}$/,
    ES: /^[A-Z0-9]\d{7}[A-Z0-9]$/,
    FI: /^\d{8}$/,
    FR: /^[A-Z0-9]{2}\d{9}$/,
    HR: /^\d{11}$/,
    HU: /^\d{8}$/,
    IE: /^\d{7}[A-Z]{1,2}$|^\d[A-Z]\d{5}[A-Z]$/,
    IT: /^\d{11}$/,
    LT: /^(\d{9}|\d{12})$/,
    LU: /^\d{8}$/,
    LV: /^\d{11}$/,
    MT: /^\d{8}$/,
    NL: /^\d{9}B\d{2}$/,
    PL: /^\d{10}$/,
    PT: /^\d{9}$/,
    RO: /^\d{2,10}$/,
    SE: /^\d{10}01$/,
    SI: /^\d{8}$/,
    SK: /^\d{10}$/,
    GB: /^\d{9}(\d{3})?$/
};

// Company ID patterns
const companyPatterns = {
    DE: /^(HRB|HRA)\d+$/i,
    NL: /^\d{8}$/,
    FR: /^\d{9}\d{5}$/,
    IT: /^\d{11}$/,
    ES: /^[A-Z]?\d{8}[A-Z0-9]?$/i,
    SE: /^\d{10}$/
};

// PEPPOL Payment Means Code list
const paymentMeansCodes = [
    { code: "1", name: "Instrument not defined" },
    { code: "10", name: "In cash" },
    { code: "20", name: "Cheque" },
    { code: "30", name: "Credit transfer" },
    { code: "31", name: "Debit transfer" },
    { code: "42", name: "Payment to bank account" },
    { code: "48", name: "Bank card" },
    { code: "49", name: "Direct debit" },
    { code: "50", name: "Payment by postgiro" },
    { code: "57", name: "Standing agreement" },
    { code: "58", name: "SEPA credit transfer" },
    { code: "59", name: "SEPA direct debit" },
    { code: "60", name: "Promissory note" },
    { code: "97", name: "Clearing between partners" }
];

function cleanInput(value) {
    return value.trim().toUpperCase().replace(/[\s\.\-]/g, '');
}

function validateVAT(country, vat) {
    if (!vat || !country) return null;
    let cleaned = cleanInput(vat);
    if (cleaned.startsWith(country)) {
        cleaned = cleaned.slice(country.length);
    }
    const pattern = vatPatterns[country.toUpperCase()];
    if (!pattern) return false;
    return pattern.test(cleaned);
}

function validateCompanyID(country, companyId) {
    if (!companyId || !country) return null;
    const cleaned = cleanInput(companyId);
    const pattern = companyPatterns[country.toUpperCase()];
    if (!pattern) return true;
    return pattern.test(cleaned);
}

function validateEndpoint(endpoint) {
    if (!endpoint) return null;
    const trimmed = endpoint.trim();
    const regex = /^\d{4}:[A-Z0-9]+$/i;
    return regex.test(trimmed);
}

function validateEmail(email) {
    if (!email) return null;
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function updateValidation() {
    const country = document.getElementById('country').value.toUpperCase();
    const vat = document.getElementById('vat').value;
    const companyId = document.getElementById('company-id').value;
    const endpoint = document.getElementById('endpoint').value;
    const email = document.getElementById('email').value;

    const vatMsg = document.getElementById('vat-validation');
    const companyMsg = document.getElementById('company-validation');
    const endpointMsg = document.getElementById('endpoint-validation');
    const emailMsg = document.getElementById('email-validation');

    const vatValid = validateVAT(country, vat);
    if (vatValid === null) {
        vatMsg.textContent = '';
    } else if (vatValid) {
        vatMsg.textContent = 'Valid VAT ID';
        vatMsg.style.color = 'var(--success)';
    } else {
        vatMsg.textContent = 'Invalid VAT ID';
        vatMsg.style.color = 'var(--error)';
    }

    const companyValid = validateCompanyID(country, companyId);
    if (companyValid === null) {
        companyMsg.textContent = '';
    } else if (companyValid) {
        companyMsg.textContent = 'Valid Company ID';
        companyMsg.style.color = 'var(--success)';
    } else {
        companyMsg.textContent = 'Invalid Company ID';
        companyMsg.style.color = 'var(--error)';
    }

    const endpointValid = validateEndpoint(endpoint);
    if (endpointValid === null) {
        endpointMsg.textContent = '';
    } else if (endpointValid) {
        endpointMsg.textContent = 'Valid Endpoint ID';
        endpointMsg.style.color = 'var(--success)';
    } else {
        endpointMsg.textContent = 'Invalid Endpoint ID';
        endpointMsg.style.color = 'var(--error)';
    }

    const emailValid = validateEmail(email);
    if (emailValid === null) {
        emailMsg.textContent = '';
    } else if (emailValid) {
        emailMsg.textContent = 'Valid email';
        emailMsg.style.color = 'var(--success)';
    } else {
        emailMsg.textContent = 'Invalid email';
        emailMsg.style.color = 'var(--error)';
    }
}

function syncRegistrationName() {
    const nameInput = document.getElementById('name');
    const regNameInput = document.getElementById('reg-name');
    if (!editingSupplierId) {
        regNameInput.value = nameInput.value;
    }
}

function validateBank(entry) {
    const name = entry.querySelector('.bank-name').value.trim();
    const ibanRaw = entry.querySelector('.bank-iban').value.trim();
    const iban = ibanRaw.toUpperCase().replace(/\s/g, '');
    const bban = entry.querySelector('.bank-bban').value.trim();
    const bic = entry.querySelector('.bank-bic').value.trim().toUpperCase();

    const nameMsg = entry.querySelector('.bank-name-validation') || createValidationElement(entry, '.bank-name');
    const ibanMsg = entry.querySelector('.bank-iban-validation') || createValidationElement(entry, '.bank-iban');
    const bbanMsg = entry.querySelector('.bank-bban-validation') || createValidationElement(entry, '.bank-bban');
    const bicMsg = entry.querySelector('.bank-bic-validation') || createValidationElement(entry, '.bank-bic');

    let isValid = true;

    if (!name) {
        nameMsg.textContent = 'Required';
        nameMsg.style.color = 'var(--error)';
        isValid = false;
    } else {
        nameMsg.textContent = '';
    }

    if (!iban && !bban) {
        ibanMsg.textContent = 'IBAN or BBAN required';
        ibanMsg.style.color = 'var(--error)';
        bbanMsg.textContent = 'IBAN or BBAN required';
        bbanMsg.style.color = 'var(--error)';
        isValid = false;
    } else {
        ibanMsg.textContent = '';
        bbanMsg.textContent = '';
    }

    if (iban) {
        if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) {
            ibanMsg.textContent = 'Invalid IBAN';
            ibanMsg.style.color = 'var(--error)';
            isValid = false;
        } else {
            ibanMsg.textContent = 'Valid';
            ibanMsg.style.color = 'var(--success)';
        }
    }

    if (bic && !/^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3}){0,1}$/.test(bic)) {
        bicMsg.textContent = 'Invalid BIC';
        bicMsg.style.color = 'var(--error)';
        isValid = false;
    } else if (bic) {
        bicMsg.textContent = 'Valid';
        bicMsg.style.color = 'var(--success)';
    } else {
        bicMsg.textContent = '';
    }

    return isValid;
}

function createValidationElement(entry, selector) {
    const input = entry.querySelector(selector);
    const div = document.createElement('div');
    div.className = 'bank-validation';
    input.parentNode.appendChild(div);
    return div;
}

function validateAllBanks() {
    const entries = document.querySelectorAll('.bank-entry');
    let allValid = true;
    entries.forEach(entry => {
        if (!validateBank(entry)) allValid = false;
    });
    return allValid;
}

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    currentUserId = session.user.id;

    document.getElementById('dashboard-btn').addEventListener('click', () => window.location.href = 'dashboard.html');
    if (document.getElementById('mobile-dashboard-btn')) {
        document.getElementById('mobile-dashboard-btn').addEventListener('click', () => window.location.href = 'dashboard.html');
    }

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    if (document.getElementById('mobile-logout-btn')) {
        document.getElementById('mobile-logout-btn').addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'index.html';
        });
    }

    await loadSuppliers(currentUserId);

    document.getElementById('add-supplier-btn').addEventListener('click', startAddSupplier);

    document.getElementById('add-bank-entry').addEventListener('click', () => addBankEntry());

    document.getElementById('supplier-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateAllBanks()) {
            alert('Please fix bank account errors');
            return;
        }

        if (editingSupplierId) {
            await updateSupplier(editingSupplierId);
        } else {
            await createSupplierWithBanks(currentUserId);
        }
    });

    document.getElementById('cancel-btn').addEventListener('click', () => {
        document.getElementById('supplier-form-card').style.display = 'none';
        document.getElementById('suppliers-list').style.opacity = '1';
        editingSupplierId = null;
    });

    // Real-time validation
    document.getElementById('country').addEventListener('input', updateValidation);
    document.getElementById('vat').addEventListener('input', updateValidation);
    document.getElementById('company-id').addEventListener('input', updateValidation);
    document.getElementById('endpoint').addEventListener('input', updateValidation);
    document.getElementById('email').addEventListener('input', updateValidation);
    document.getElementById('name').addEventListener('input', syncRegistrationName);

    document.getElementById('banks-container').addEventListener('input', (e) => {
        const entry = e.target.closest('.bank-entry');
        if (entry) validateBank(entry);
    });
});

async function loadSuppliers(userId) {
    const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) {
        console.error('Error loading suppliers:', error);
        document.getElementById('suppliers-list').innerHTML = '<div class="no-suppliers">Error loading suppliers. Check console.</div>';
        return;
    }

    const list = document.getElementById('suppliers-list');
    list.innerHTML = '';

    if (suppliers.length === 0) {
        list.innerHTML = '<div class="no-suppliers">No suppliers added yet. Add your first supplier!</div>';
        return;
    }

    const selectedId = localStorage.getItem('selected_supplier_id');
    const selectedName = localStorage.getItem('selected_supplier_name');
    document.getElementById('active-supplier').textContent = selectedName ? `Active: ${selectedName}` : '';

    suppliers.forEach(supplier => {
        const card = document.createElement('div');
        card.className = 'supplier-card';
        card.innerHTML = `
            <div class="supplier-content">
                <h3>${supplier.name}</h3>
                <div class="supplier-details">
                    <p><strong>VAT ID:</strong> ${supplier.vat_id || 'Not set'}</p>
                    <p><strong>Country:</strong> ${supplier.country || 'Not set'}</p>
                    <p><strong>Currency:</strong> ${supplier.currency || 'EUR'}</p>
                </div>
                <div class="supplier-actions">
                    <button class="cta select-supplier" data-id="${supplier.id}" data-name="${supplier.name}">Select This Supplier</button>
                    <div class="secondary-actions">
                        <button class="action-btn edit-btn" data-id="${supplier.id}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${supplier.id}">Delete</button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(card);
    });

    document.querySelectorAll('.select-supplier').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            localStorage.setItem('selected_supplier_id', id);
            localStorage.setItem('selected_supplier_name', name);
            document.getElementById('active-supplier').textContent = `Active: ${name}`;
            window.location.href = 'dashboard.html';
        });
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editSupplier(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteSupplier(btn.dataset.id));
    });
}

async function deleteSupplier(supplierId) {
    if (!confirm('Are you sure? This will delete the supplier and all related bank accounts permanently.')) return;

    const { error: banksError } = await supabase
        .from('supplier_banks')
        .delete()
        .eq('supplier_id', supplierId);

    if (banksError) {
        alert('Error deleting banks: ' + banksError.message);
        return;
    }

    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId);

    if (error) {
        alert('Error deleting supplier: ' + error.message);
        return;
    }

    if (localStorage.getItem('selected_supplier_id') === supplierId.toString()) {
        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');
        document.getElementById('active-supplier').textContent = '';
    }

    await loadSuppliers(currentUserId);
}

function startAddSupplier() {
    editingSupplierId = null;
    document.getElementById('form-title').textContent = 'Add New Supplier';
    document.getElementById('form-subtitle').textContent = 'Fill in your company details and add at least one bank account.';
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Save & Select This Supplier';
    submitBtn.classList.add('cta');
    document.getElementById('supplier-form').reset();
    document.getElementById('default-currency').value = 'EUR';
    document.getElementById('banks-container').innerHTML = '';
    addBankEntry();
    document.getElementById('supplier-form-card').style.display = 'block';
    document.getElementById('suppliers-list').style.opacity = '0.5';
    document.getElementById('supplier-form-card').scrollIntoView({ behavior: 'smooth' });
    updateValidation();
    syncRegistrationName();
}

async function editSupplier(supplierId) {
    editingSupplierId = supplierId;

    const { data: supplier, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

    if (error || !supplier) {
        alert('Error loading supplier');
        return;
    }

    document.getElementById('form-title').textContent = 'Edit Supplier';
    document.getElementById('form-subtitle').textContent = 'Update company details and manage bank accounts.';
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.textContent = 'Save Supplier';
    submitBtn.classList.add('cta');

    document.getElementById('name').value = supplier.name || '';
    document.getElementById('reg-name').value = supplier.registration_name || '';
    document.getElementById('endpoint').value = supplier.endpoint_id || '';
    document.getElementById('vat').value = supplier.vat_id || '';
    document.getElementById('company-id').value = supplier.company_id || '';
    document.getElementById('street').value = supplier.street || '';
    document.getElementById('additional-street').value = supplier.additional_street || '';
    document.getElementById('city').value = supplier.city || '';
    document.getElementById('postal').value = supplier.postal_code || '';
    document.getElementById('country').value = supplier.country || '';
    document.getElementById('email').value = supplier.email || '';
    document.getElementById('default-currency').value = supplier.currency || 'EUR';

    const { data: banks } = await supabase
        .from('supplier_banks')
        .select('*')
        .eq('supplier_id', supplierId);

    const container = document.getElementById('banks-container');
    container.innerHTML = '';
    if (banks && banks.length > 0) {
        banks.forEach(bank => addBankEntry(bank));
    } else {
        addBankEntry();
    }

    document.getElementById('supplier-form-card').style.display = 'block';
    document.getElementById('suppliers-list').style.opacity = '0.5';
    document.getElementById('supplier-form-card').scrollIntoView({ behavior: 'smooth' });
    updateValidation();
    validateAllBanks();
}

function addBankEntry(bankData = {}) {
    const container = document.getElementById('banks-container');
    const entry = document.createElement('div');
    entry.className = 'bank-entry';
    entry.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label>Account Name *</label>
                <input class="bank-name" value="${bankData.name || ''}" required>
                <div class="bank-name-validation bank-validation"></div>
            </div>
            <div class="form-group">
                <label>IBAN</label>
                <input class="bank-iban" value="${bankData.iban || ''}">
                <div class="bank-iban-validation bank-validation"></div>
            </div>
            <div class="form-group">
                <label>BBAN</label>
                <input class="bank-bban" value="${bankData.bban || ''}">
                <div class="bank-bban-validation bank-validation"></div>
            </div>
            <div class="form-group">
                <label>BIC</label>
                <input class="bank-bic" value="${bankData.bic || ''}">
                <div class="bank-bic-validation bank-validation"></div>
            </div>
            <div class="form-group">
                <label>Default Payment Means Code</label>
                <select class="bank-code">
                    <option value="">Select payment means</option>
                    ${paymentMeansCodes.map(pm => `<option value="${pm.code}" ${bankData.code === pm.code ? 'selected' : ''}>${pm.code} - ${pm.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Default Payment ID</label>
                <input class="bank-payment_id" value="${bankData.payment_id || ''}">
                <div class="hint">Optional reference shown to buyer (e.g., "Invoice #12345" or structured payment reference)</div>
            </div>
        </div>
        <button type="button" class="remove-bank danger">Delete</button>

    `;

    entry.querySelector('.remove-bank').addEventListener('click', () => entry.remove());
    container.appendChild(entry);
    validateBank(entry);
    return entry;
}

async function createSupplierWithBanks(userId) {
    const country = document.getElementById('country').value.trim().toUpperCase();
    let vat = document.getElementById('vat').value.trim().toUpperCase();
    if (vat && !vat.startsWith(country)) {
        vat = country + vat.replace(/^[A-Z]{2}/, '');
    }

    const supplier = {
        user_id: userId,
        name: document.getElementById('name').value.trim(),
        endpoint_id: document.getElementById('endpoint').value.trim(),
        vat_id: vat,
        street: document.getElementById('street').value.trim(),
        additional_street: document.getElementById('additional-street').value.trim() || null,
        city: document.getElementById('city').value.trim(),
        postal_code: document.getElementById('postal').value.trim(),
        country: country,
        email: document.getElementById('email').value.trim(),
        registration_name: document.getElementById('reg-name').value.trim(),
        company_id: cleanInput(document.getElementById('company-id').value),
        currency: document.getElementById('default-currency').value
    };

    const { data: newSupplier, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select()
        .single();

    if (error) {
        alert('Error creating supplier: ' + error.message);
        return;
    }

    const success = await saveBanksForSupplier(newSupplier.id, userId);
    if (!success) return;

    localStorage.setItem('selected_supplier_id', newSupplier.id);
    localStorage.setItem('selected_supplier_name', newSupplier.name);
    window.location.href = 'dashboard.html';
}

async function updateSupplier(supplierId) {
    const country = document.getElementById('country').value.trim().toUpperCase();
    let vat = document.getElementById('vat').value.trim().toUpperCase();
    if (vat && !vat.startsWith(country)) {
        vat = country + vat.replace(/^[A-Z]{2}/, '');
    }

    const updated = {
        name: document.getElementById('name').value.trim(),
        endpoint_id: document.getElementById('endpoint').value.trim(),
        vat_id: vat,
        street: document.getElementById('street').value.trim(),
        additional_street: document.getElementById('additional-street').value.trim() || null,
        city: document.getElementById('city').value.trim(),
        postal_code: document.getElementById('postal').value.trim(),
        country: country,
        email: document.getElementById('email').value.trim(),
        registration_name: document.getElementById('reg-name').value.trim(),
        company_id: cleanInput(document.getElementById('company-id').value),
        currency: document.getElementById('default-currency').value
    };

    const { error } = await supabase
        .from('suppliers')
        .update(updated)
        .eq('id', supplierId);

    if (error) {
        alert('Error updating supplier: ' + error.message);
        return;
    }

    const success = await saveBanksForSupplier(supplierId, currentUserId);
    if (!success) return;

    localStorage.setItem('selected_supplier_name', updated.name);
    alert('Supplier updated successfully!');
    document.getElementById('supplier-form-card').style.display = 'none';
    document.getElementById('suppliers-list').style.opacity = '1';
    loadSuppliers(currentUserId);
}

async function saveBanksForSupplier(supplierId, userId) {
    const { error: deleteError } = await supabase
        .from('supplier_banks')
        .delete()
        .eq('supplier_id', supplierId);

    if (deleteError) {
        console.error('Error deleting old banks:', deleteError);
    }

    const entries = document.querySelectorAll('.bank-entry');
    const banks = [];
    let hasValid = false;

    entries.forEach(entry => {
        const name = entry.querySelector('.bank-name').value.trim();
        const ibanRaw = entry.querySelector('.bank-iban').value.trim();
        const iban = ibanRaw.toUpperCase().replace(/\s/g, '');
        const bban = entry.querySelector('.bank-bban').value.trim();
        if (name && (iban || bban)) {
            hasValid = true;
            banks.push({
                supplier_id: supplierId,
                user_id: userId,
                name,
                iban: iban || null,
                bban: bban || null,
                bic: entry.querySelector('.bank-bic').value.trim().toUpperCase() || null,
                code: entry.querySelector('.bank-code').value || null,
                payment_id: entry.querySelector('.bank-payment_id').value.trim() || null
            });
        }
    });

    if (!hasValid) {
        alert('Please add at least one bank account with Account Name and either IBAN or BBAN.');
        return false;
    }

    if (banks.length > 0) {
        const { error } = await supabase.from('supplier_banks').insert(banks);
        if (error) {
            alert('Error saving banks: ' + error.message);
            return false;
        }
    }

    return true;
}