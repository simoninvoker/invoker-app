import { supabase, supabaseClient } from './supabaseClient.js';

let currentUserId = null;
let editingSupplierId = null;

// ================= HELPERS: COUNTRY =================
function getCountry() {
    const el = document.getElementById('cust-country');
    return el ? el.value.trim().toUpperCase() : '';
}

function setCountry(code) {
    const hidden = document.getElementById('cust-country');
    const input = document.getElementById('country-search-input');
    if (hidden) hidden.value = code || '';
    if (input) input.value = countries.find(c => c.code === code)?.name || '';
}

// ================= DOM REFERENCES =================
const suppliersList = document.getElementById('suppliers-list');
const supplierForm = document.getElementById('supplier-form');
const supplierFormCard = document.getElementById('supplier-form-card');
const addSupplierBtn = document.getElementById('add-supplier-btn');

const name = document.getElementById('name');
const regName = document.getElementById('reg-name');
const endpoint = document.getElementById('endpoint');
const vat = document.getElementById('vat');
const companyIdInput = document.getElementById('company-id');
const street = document.getElementById('street');
const additionalStreet = document.getElementById('additional-street');
const city = document.getElementById('city');
const postal = document.getElementById('postal');
const email = document.getElementById('email');
const defaultCurrency = document.getElementById('default-currency');

const vatValidation = document.getElementById('vat-validation');
const companyValidation = document.getElementById('company-validation');
const endpointValidation = document.getElementById('endpoint-validation');
const emailValidation = document.getElementById('email-validation');

// ================= VAT PATTERNS =================
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

// ================= COMPANY ID PATTERNS =================
const companyPatterns = {
    DE: /^(HRB|HRA)\d+$/i,
    NL: /^\d{8}$/,
    FR: /^\d{9}\d{5}$/,
    IT: /^\d{11}$/,
    ES: /^[A-Z]?\d{8}[A-Z0-9]?$/i,
    SE: /^\d{10}$/
};

// ================= COUNTRIES =================
const countries = [
    { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" }, { code: "BG", name: "Bulgaria" },
    { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" }, { code: "DE", name: "Germany" },
    { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" }, { code: "EL", name: "Greece" },
    { code: "ES", name: "Spain" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
    { code: "GB", name: "United Kingdom" }, { code: "HR", name: "Croatia" }, { code: "HU", name: "Hungary" },
    { code: "IE", name: "Ireland" }, { code: "IT", name: "Italy" }, { code: "LT", name: "Lithuania" },
    { code: "LU", name: "Luxembourg" }, { code: "LV", name: "Latvia" }, { code: "MT", name: "Malta" },
    { code: "NL", name: "Netherlands" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
    { code: "RO", name: "Romania" }, { code: "SE", name: "Sweden" }, { code: "SI", name: "Slovenia" },
    { code: "SK", name: "Slovakia" }
];

// ================= PAYMENT MEANS =================
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

// ================= VALIDATION =================
function cleanInput(v) {
    return v.trim().toUpperCase().replace(/[\s.\-]/g, '');
}

function validateVAT(country, vat) {
    if (!vat || !country) return null;
    let c = cleanInput(vat);
    if (c.startsWith(country)) c = c.slice(country.length);
    return vatPatterns[country]?.test(c) ?? false;
}

function validateCompanyID(country, id) {
    if (!id || !country) return null;
    const p = companyPatterns[country];
    return p ? p.test(cleanInput(id)) : true;
}

function validateEndpoint(v) {
    if (!v) return null;
    return /^\d{4}:[A-Z0-9]+$/i.test(v.trim());
}

function validateEmail(v) {
    if (!v) return null;
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
}

function updateValidation() {
    const country = getCountry();
    const vat = vat.value;
    const companyId = companyIdInput.value;

    const vatValid = validateVAT(country, vat);
    vatValidation.textContent = vatValid === null ? '' : vatValid ? 'Valid VAT ID' : 'Invalid VAT ID';
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return location.href = 'index.html';
    currentUserId = session.user.id;

    await loadSuppliers(currentUserId);

    addSupplierBtn.onclick = startAddSupplier;
    supplierForm.onsubmit = submitForm;
});

// ================= CRUD =================
async function loadSuppliers(userId) {
    const { data } = await supabase.from('suppliers').select('*').eq('user_id', userId).order('name');
    suppliersList.innerHTML = '';

    data.forEach(s => {
        const d = document.createElement('div');
        d.className = 'supplier-card';
        d.innerHTML = `<h3>${s.name}</h3><button>Edit</button>`;
        d.querySelector('button').onclick = () => editSupplier(s.id);
        suppliersList.appendChild(d);
    });
}

function startAddSupplier() {
    editingSupplierId = null;
    supplierForm.reset();
    setCountry('');
    supplierFormCard.style.display = 'block';
}

async function editSupplier(id) {
    editingSupplierId = id;
    const { data: s } = await supabase.from('suppliers').select('*').eq('id', id).single();

    name.value = s.name || '';
    regName.value = s.registration_name || '';
    endpoint.value = s.endpoint_id || '';
    vat.value = s.vat_id || '';
    companyIdInput.value = s.company_id || '';
    street.value = s.street || '';
    city.value = s.city || '';
    postal.value = s.postal_code || '';
    email.value = s.email || '';
    defaultCurrency.value = s.currency || 'EUR';
    setCountry(s.country);

    supplierFormCard.style.display = 'block';
}

async function submitForm(e) {
    e.preventDefault();

    const supplier = {
        user_id: currentUserId,
        name: name.value.trim(),
        registration_name: regName.value.trim(),
        endpoint_id: endpoint.value.trim(),
        vat_id: vat.value.trim(),
        company_id: cleanInput(companyIdInput.value),
        street: street.value.trim(),
        city: city.value.trim(),
        postal_code: postal.value.trim(),
        country: getCountry(),
        email: email.value.trim(),
        currency: defaultCurrency.value
    };

    if (editingSupplierId) {
        await supabase.from('suppliers').update(supplier).eq('id', editingSupplierId);
    } else {
        await supabase.from('suppliers').insert(supplier);
    }

    supplierFormCard.style.display = 'none';
    loadSuppliers(currentUserId);
}

