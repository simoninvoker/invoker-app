import { supabase, supabaseClient } from './supabaseClient.js';

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

const countries = [
    { code: "AT", name: "Austria" },
    { code: "BE", name: "Belgium" },
    { code: "BG", name: "Bulgaria" },
    { code: "CY", name: "Cyprus" },
    { code: "CZ", name: "Czech Republic" },
    { code: "DE", name: "Germany" },
    { code: "DK", name: "Denmark" },
    { code: "EE", name: "Estonia" },
    { code: "EL", name: "Greece" },
    { code: "ES", name: "Spain" },
    { code: "FI", name: "Finland" },
    { code: "FR", name: "France" },
    { code: "GB", name: "United Kingdom" },
    { code: "HR", name: "Croatia" },
    { code: "HU", name: "Hungary" },
    { code: "IE", name: "Ireland" },
    { code: "IT", name: "Italy" },
    { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" },
    { code: "LV", name: "Latvia" },
    { code: "MT", name: "Malta" },
    { code: "NL", name: "Netherlands" },
    { code: "PL", name: "Poland" },
    { code: "PT", name: "Portugal" },
    { code: "RO", name: "Romania" },
    { code: "SE", name: "Sweden" },
    { code: "SI", name: "Slovenia" },
    { code: "SK", name: "Slovakia" }
];



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
    const company = document.getElementById('company-id').value;
    const endpoint = document.getElementById('endpoint').value;
    const email = document.getElementById('email').value;

    const vatValid = validateVAT(country, vat);
    const companyValid = validateCompanyID(country, company);
    const endpointValid = validateEndpoint(endpoint);
    const emailValid = validateEmail(email);

    const vatValidation = document.getElementById('vat-validation');
    if (vatValid === false) {
        vatValidation.textContent = 'Invalid VAT for ' + country;
        vatValidation.className = 'validation-message error';
    } else if (vatValid === true) {
        vatValidation.textContent = 'Valid VAT';
        vatValidation.className = 'validation-message success';
    } else {
        vatValidation.textContent = '';
    }

    const companyValidation = document.getElementById('company-validation');
    if (companyValid === false) {
        companyValidation.textContent = 'Invalid Company ID for ' + country;
        companyValidation.className = 'validation-message error';
    } else if (companyValid === true) {
        companyValidation.textContent = 'Valid Company ID';
        companyValidation.className = 'validation-message success';
    } else {
        companyValidation.textContent = '';
    }

    const endpointValidation = document.getElementById('endpoint-validation');
    if (endpointValid === false) {
        endpointValidation.textContent = 'Invalid Endpoint ID (format: 0000:ABC123)';
        endpointValidation.className = 'validation-message error';
    } else if (endpointValid === true) {
        endpointValidation.textContent = 'Valid Endpoint ID';
        endpointValidation.className = 'validation-message success';
    } else {
        endpointValidation.textContent = '';
    }

    const emailValidation = document.getElementById('email-validation');
    if (emailValid === false) {
        emailValidation.textContent = 'Invalid email format';
        emailValidation.className = 'validation-message error';
    } else if (emailValid === true) {
        emailValidation.textContent = 'Valid email';
        emailValidation.className = 'validation-message success';
    } else {
        emailValidation.textContent = '';
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("You must be logged in.");
        window.location.href = 'index.html';
        return;
    }

    currentUserId = session.user.id;

    const activeSupplierName = localStorage.getItem('selected_supplier_name');
    const activeSupplierSpan = document.getElementById('active-supplier');
    if (activeSupplierSpan) {
        if (activeSupplierName) {
            activeSupplierSpan.textContent = `Active: ${activeSupplierName}`;
        } else {
            activeSupplierSpan.innerHTML = 'No supplier selected — <a href="suppliers.html" style="color: var(--accent); text-decoration: underline;">Select one</a>';
        }
    }

    await loadSuppliers(currentUserId);

    const addSupplierBtn = document.getElementById('add-supplier-btn');
    if (addSupplierBtn) {
        addSupplierBtn.addEventListener('click', () => {
            editingSupplierId = null;
            const formCard = document.getElementById('supplier-form-card');
            if (formCard) formCard.style.display = 'block';
            const suppliersList = document.getElementById('suppliers-list');
            if (suppliersList) suppliersList.style.opacity = '0.5';
            clearForm();
            addBankEntry(); // Add one empty bank by default
        });
    } else {
        console.error("Element with ID 'add-supplier-btn' not found.");
    }

    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const formCard = document.getElementById('supplier-form-card');
            if (formCard) formCard.style.display = 'none';
            const suppliersList = document.getElementById('suppliers-list');
            if (suppliersList) suppliersList.style.opacity = '1';
            editingSupplierId = null;
        });
    } else {
        console.error("Element with ID 'cancel-btn' not found.");
    }

    const supplierForm = document.getElementById('supplier-form');
    if (supplierForm) {
        supplierForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!validateAll()) return;
            if (editingSupplierId) {
                await updateSupplier(editingSupplierId, currentUserId);
            } else {
                await createSupplier(currentUserId);
            }
        });
    } else {
        console.error("Element with ID 'supplier-form' not found.");
    }

    const addBankEntryBtn = document.getElementById('add-bank-entry');
    if (addBankEntryBtn) {
        addBankEntryBtn.addEventListener('click', addBankEntry);
    } else {
        console.error("Element with ID 'add-bank-entry' not found.");
    }

    ['country', 'vat', 'company-id', 'endpoint', 'email'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateValidation);
        } else {
            console.error(`Element with ID '${id}' not found.`);
        }
    });
});

async function loadSuppliers(userId) {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) {
        alert('Error loading suppliers: ' + error.message);
        return;
    }

    const tableBody = document.getElementById('suppliers-table-body');
    if (!tableBody) {
        console.error("Element with ID 'suppliers-table-body' not found.");
        return;
    }

    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:32px; color:var(--text-secondary);">No suppliers yet. Add one to get started.</td></tr>';
        return;
    }

    data.forEach(supplier => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${supplier.name}</td>
            <td>${supplier.endpoint_id}</td>
            <td>${supplier.vat_id}</td>
            <td>${supplier.registration_name}</td>
            <td>${supplier.country}</td>
            <td>${supplier.currency}</td>
            <td>
                <button class="action-btn" onclick="selectSupplier(${supplier.id}, '${supplier.name}')">Select</button>
                <button class="action-btn" onclick="editSupplier(${supplier.id})">Edit</button>
                <button class="action-btn danger" onclick="deleteSupplier(${supplier.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function selectSupplier(id, name) {
    localStorage.setItem('selected_supplier_id', id);
    localStorage.setItem('selected_supplier_name', name);
    alert(`Selected ${name} as active supplier!`);
    window.location.href = 'dashboard.html';
}

async function deleteSupplier(id) {
    if (!confirm('Delete this supplier and all associated banks?')) return;

    const { error: bankError } = await supabase
        .from('supplier_banks')
        .delete()
        .eq('supplier_id', id);

    if (bankError) {
        alert('Error deleting banks: ' + bankError.message);
        return;
    }

    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting supplier: ' + error.message);
        return;
    }

    if (localStorage.getItem('selected_supplier_id') === id.toString()) {
        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');
    }

    loadSuppliers(currentUserId);
}

async function editSupplier(supplierId) {
    editingSupplierId = supplierId;

    const { data } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', supplierId)
        .single();

    if (!data) {
        alert('Supplier not found.');
        return;
    }

    const supplier = data;

    const formCard = document.getElementById('supplier-form-card');
    if (formCard) {
        formCard.style.display = 'block';
    } else {
        console.error("Element with ID 'supplier-form-card' not found.");
        return; // Early return if critical element missing
    }

    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = supplier.name;
    else console.error("Element with ID 'name' not found.");

    const endpointInput = document.getElementById('endpoint');
    if (endpointInput) endpointInput.value = supplier.endpoint_id;
    else console.error("Element with ID 'endpoint' not found.");

    const vatInput = document.getElementById('vat');
    if (vatInput) vatInput.value = supplier.vat_id;
    else console.error("Element with ID 'vat' not found.");

    const companyIdInput = document.getElementById('company-id');
    if (companyIdInput) companyIdInput.value = supplier.company_id;
    else console.error("Element with ID 'company-id' not found.");

    const streetInput = document.getElementById('street');
    if (streetInput) streetInput.value = supplier.street;
    else console.error("Element with ID 'street' not found.");

    const additionalStreetInput = document.getElementById('additional-street');
    if (additionalStreetInput) additionalStreetInput.value = supplier.additional_street || '';
    else console.error("Element with ID 'additional-street' not found.");

    const cityInput = document.getElementById('city');
    if (cityInput) cityInput.value = supplier.city;
    else console.error("Element with ID 'city' not found.");

    const postalInput = document.getElementById('postal');
    if (postalInput) postalInput.value = supplier.postal_code;
    else console.error("Element with ID 'postal' not found.");

    const countryInput = document.getElementById('country');
    if (countryInput) countryInput.value = supplier.country;
    else console.error("Element with ID 'country' not found.");

    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = supplier.email;
    else console.error("Element with ID 'email' not found.");

    const regNameInput = document.getElementById('reg-name');
    if (regNameInput) regNameInput.value = supplier.registration_name;
    else console.error("Element with ID 'reg-name' not found.");

    const defaultCurrencySelect = document.getElementById('default-currency');
    if (defaultCurrencySelect) defaultCurrencySelect.value = supplier.currency || 'EUR';
    else console.error("Element with ID 'default-currency' not found.");

    clearBanks();

    const { data: banks } = await supabase
        .from('supplier_banks')
        .select('*')
        .eq('supplier_id', supplierId);

    banks.forEach(bank => addBankEntry(bank));
    if (banks.length === 0) addBankEntry();

    const suppliersList = document.getElementById('suppliers-list');
    if (suppliersList) suppliersList.style.opacity = '0.5';
    else console.error("Element with ID 'suppliers-list' not found.");

    if (formCard) formCard.scrollIntoView({ behavior: 'smooth' });

    updateValidation();
}

function clearForm() {
    const nameInput = document.getElementById('name');
    if (nameInput) nameInput.value = '';

    const endpointInput = document.getElementById('endpoint');
    if (endpointInput) endpointInput.value = '';

    const vatInput = document.getElementById('vat');
    if (vatInput) vatInput.value = '';

    const streetInput = document.getElementById('street');
    if (streetInput) streetInput.value = '';

    const additionalStreetInput = document.getElementById('additional-street');
    if (additionalStreetInput) additionalStreetInput.value = '';

    const cityInput = document.getElementById('city');
    if (cityInput) cityInput.value = '';

    const postalInput = document.getElementById('postal');
    if (postalInput) postalInput.value = '';

    const countryInput = document.getElementById('country');
    if (countryInput) countryInput.value = 'SE';

    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = '';

    const regNameInput = document.getElementById('reg-name');
    if (regNameInput) regNameInput.value = '';

    const companyIdInput = document.getElementById('company-id');
    if (companyIdInput) companyIdInput.value = '';

    const defaultCurrencySelect = document.getElementById('default-currency');
    if (defaultCurrencySelect) defaultCurrencySelect.value = 'EUR';

    clearBanks();
}

function clearBanks() {
    const banksContainer = document.getElementById('banks-container');
    if (banksContainer) banksContainer.innerHTML = '';
    else console.error("Element with ID 'banks-container' not found.");
}

function addBankEntry(bank = null) {
    const entry = document.createElement('div');
    entry.className = 'bank-entry card';
    entry.innerHTML = `
        <div class="form-grid">
            <div class="form-group"><label>Account Name *</label><input class="bank-name" value="${bank?.name || ''}" required></div>
            <div class="form-group"><label>IBAN</label><input class="bank-iban" value="${bank?.iban || ''}" maxlength="34" placeholder="e.g. DE89370400440532013000"></div>
            <div class="form-group"><label>BBAN</label><input class="bank-bban" value="${bank?.bban || ''}" maxlength="30" placeholder="Domestic account number"></div>
            <div class="form-group"><label>BIC</label><input class="bank-bic" value="${bank?.bic || ''}" maxlength="11" placeholder="e.g. DEUTDEFF"></div>
            <div class="form-group"><label>Payment Means Code</label><select class="bank-code">${paymentMeansCodes.map(c => `<option value="${c.code}" ${bank?.code === c.code ? 'selected' : ''}>${c.code} - ${c.name}</option>`).join('')}</select></div>
            <div class="form-group"><label>Payment ID</label><input class="bank-payment_id" value="${bank?.payment_id || ''}" placeholder="Optional reference"></div>
        </div>
        <button type="button" class="remove-bank danger">Remove Bank</button>
    `;

    const banksContainer = document.getElementById('banks-container');
    if (banksContainer) {
        banksContainer.appendChild(entry);
    } else {
        console.error("Element with ID 'banks-container' not found.");
        return;
    }

    const removeBtn = entry.querySelector('.remove-bank');
    if (removeBtn) removeBtn.addEventListener('click', () => entry.remove());

    entry.querySelectorAll('input, select').forEach(el => {
        if (el) el.addEventListener('input', updateValidation);
    });
}

function validateAll() {
    const required = ['name', 'endpoint', 'vat', 'street', 'city', 'postal', 'country', 'email', 'reg-name', 'company-id'];
    let valid = true;

    required.forEach(id => {
        const el = document.getElementById(id);
        if (el && !el.value.trim()) {
            el.classList.add('invalid');
            valid = false;
        } else if (el) {
            el.classList.remove('invalid');
        }
    });

    const country = document.getElementById('country').value.toUpperCase();
    const vatValid = validateVAT(country, document.getElementById('vat').value);
    if (vatValid === false) valid = false;

    const companyValid = validateCompanyID(country, document.getElementById('company-id').value);
    if (companyValid === false) valid = false;

    const endpointValid = validateEndpoint(document.getElementById('endpoint').value);
    if (endpointValid === false) valid = false;

    const emailValid = validateEmail(document.getElementById('email').value);
    if (emailValid === false) valid = false;

    const entries = document.querySelectorAll('.bank-entry');
    let hasValidBank = false;
    entries.forEach(entry => {
        const name = entry.querySelector('.bank-name').value.trim();
        const iban = entry.querySelector('.bank-iban').value.trim();
        const bban = entry.querySelector('.bank-bban').value.trim();
        if (name && (iban || bban)) hasValidBank = true;
    });

    if (!hasValidBank) {
        alert('Please add at least one bank account with Account Name and either IBAN or BBAN.');
        valid = false;
    }

    return valid;
}

async function createSupplier(userId) {
    const rawVat = document.getElementById('vat').value.trim();
    const country = document.getElementById('country').value.trim().toUpperCase();

    let formattedVat = rawVat.toUpperCase();
    if (!formattedVat.startsWith(country)) {
        formattedVat = country + formattedVat.replace(/^[A-Z]{2}/, '');
    }

    const supplier = {
        user_id: userId,
        name: document.getElementById('name').value.trim(),
        endpoint_id: document.getElementById('endpoint').value.trim(),
        vat_id: formattedVat,
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

    const { data, error } = await supabase
        .from('suppliers')
        .insert(supplier)
        .select();

    if (error) {
        alert('Error creating supplier: ' + error.message);
        return;
    }

    const supplierId = data[0].id;
    const success = await saveBanksForSupplier(supplierId, userId);
    if (!success) return;

    localStorage.setItem('selected_supplier_id', supplierId);
    localStorage.setItem('selected_supplier_name', supplier.name);
    alert('Supplier created and selected successfully!');
    document.getElementById('supplier-form-card').style.display = 'none';
    document.getElementById('suppliers-list').style.opacity = '1';
    loadSuppliers(currentUserId);
}

async function updateSupplier(supplierId, userId) {
    const rawVat = document.getElementById('vat').value.trim();
    const country = document.getElementById('country').value.trim().toUpperCase();

    let formattedVat = rawVat.toUpperCase();
    if (!formattedVat.startsWith(country)) {
        formattedVat = country + formattedVat.replace(/^[A-Z]{2}/, '');
    }

    const updated = {
        name: document.getElementById('name').value.trim(),
        endpoint_id: document.getElementById('endpoint').value.trim(),
        vat_id: formattedVat,
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
