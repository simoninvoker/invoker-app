import { supabase, supabaseClient } from './supabaseClient.js';


let currentCustomerId = null;
let userId = null;

// Country list
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

// VAT patterns (cleaned number only, no prefix)
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

// Company ID patterns (no hyphens/spaces allowed)
const companyPatterns = {
    DE: /^(HRB|HRA)\d+$/i,
    NL: /^\d{8}$/,
    FR: /^\d{9}\d{5}$/,
    IT: /^\d{11}$/,
    ES: /^[A-Z]?\d{8}[A-Z0-9]?$/i,
    SE: /^\d{10}$/
};

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

function updateValidation() {
    const country = document.getElementById('cust-country').value.toUpperCase();
    const vat = document.getElementById('cust-vat').value;
    const companyId = document.getElementById('cust-company-id').value;
    const endpoint = document.getElementById('cust-endpoint').value;

    const vatMsg = document.getElementById('vat-validation');
    const companyMsg = document.getElementById('company-validation');
    const endpointMsg = document.getElementById('endpoint-validation');

    const vatValid = validateVAT(country, vat);
    if (vatValid === null) {
        vatMsg.textContent = '';
    } else if (vatValid) {
        vatMsg.textContent = 'Valid VAT format';
        vatMsg.style.color = 'var(--success)';
    } else {
        vatMsg.textContent = 'Invalid VAT format for ' + country;
        vatMsg.style.color = 'var(--error)';
    }

    const companyValid = validateCompanyID(country, companyId);
    if (companyValid === null) {
        companyMsg.textContent = '';
    } else if (companyValid) {
        companyMsg.textContent = 'Valid format';
        companyMsg.style.color = 'var(--success)';
    } else {
        companyMsg.textContent = 'Invalid Company ID format for ' + country + ' (no hyphens/spaces allowed)';
        companyMsg.style.color = 'var(--error)';
    }

    const endpointValid = validateEndpoint(endpoint);
    if (endpointValid === null) {
        endpointMsg.textContent = '';
    } else if (endpointValid) {
        endpointMsg.textContent = 'Valid PEPPOL endpoint format';
        endpointMsg.style.color = 'var(--success)';
    } else {
        endpointMsg.textContent = 'Invalid endpoint format (must be 0000:endpoint)';
        endpointMsg.style.color = 'var(--error)';
    }
}

// Sync Registration Name with Name in real time
function syncRegistrationName() {
    const nameInput = document.getElementById('cust-name');
    const regNameInput = document.getElementById('cust-reg-name');
    if (!currentCustomerId) { // Only auto-sync when adding new (not editing)
        regNameInput.value = nameInput.value;
    }
}

// New logic for Swedish 0007 prefix
function applySwedishLogic(endpoint) {
    const trimmed = endpoint.trim();
    if (trimmed.startsWith('0007:')) {
        const orgNumber = trimmed.slice(5); // Remove '0007:'
        document.getElementById('cust-company-id').value = orgNumber;
        document.getElementById('cust-vat').value = 'SE' + orgNumber + '01';
        document.getElementById('cust-country').value = 'SE';
        document.getElementById('country-search-input').value = 'Sweden (SE)';
        syncRegistrationName();
        updateValidation();
    }
}

// Searchable country dropdown
function initCountryDropdown() {
    const searchInput = document.getElementById('country-search-input');
    const countryList = document.getElementById('country-list');
    const hiddenCountry = document.getElementById('cust-country');

    // Populate list
    countries.forEach(country => {
        const div = document.createElement('div');
        div.className = 'country-option';
        div.textContent = `${country.name} (${country.code})`;
        div.dataset.code = country.code;
        div.addEventListener('click', () => {
            searchInput.value = `${country.name} (${country.code})`;
            hiddenCountry.value = country.code;
            countryList.style.display = 'none';
            updateValidation();
        });
        countryList.appendChild(div);
    });

    searchInput.addEventListener('focus', () => {
        countryList.style.display = 'block';
        filterCountries('');
    });

    searchInput.addEventListener('input', () => {
        filterCountries(searchInput.value.toLowerCase());
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => countryList.style.display = 'none', 200); // Delay to allow click
    });

    function filterCountries(query) {
        const options = countryList.querySelectorAll('.country-option');
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(query) ? 'block' : 'none';
        });
    }
}

function clearForm() {
    const form = document.getElementById('customer-form');
    form.reset();
    form.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    document.getElementById('country-search-input').value = '';
    document.getElementById('customer-form-title').textContent = 'Add Customer';
    updateValidation();
}

document.addEventListener("DOMContentLoaded", async () => {
    initCountryDropdown();

    const activeSupplierName = localStorage.getItem('selected_supplier_name');
    const activeSupplierSpan = document.getElementById('active-supplier');
    if (activeSupplierName) {
        activeSupplierSpan.textContent = `Active: ${activeSupplierName}`;
    } else {
        activeSupplierSpan.innerHTML = 'No supplier selected — <a href="suppliers.html" style="color: var(--accent); text-decoration: underline;">Select one</a>';
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }
    userId = session.user.id;

    await loadCustomers(userId);

    const addCustomerBtn = document.getElementById('add-customer-btn');
    addCustomerBtn?.addEventListener('click', () => {
        currentCustomerId = null;
        clearForm();
        document.getElementById('customer-form-card').style.display = 'block';
        document.getElementById('customer-form-card').scrollIntoView({ behavior: 'smooth' });
    });

    const cancelCustomerBtn = document.getElementById('cancel-customer-btn');
    cancelCustomerBtn?.addEventListener('click', () => {
        document.getElementById('customer-form-card').style.display = 'none';
        currentCustomerId = null;
    });

    const customerForm = document.getElementById('customer-form');
    customerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const country = document.getElementById('cust-country').value.toUpperCase();
        const vat = document.getElementById('cust-vat').value;
        const endpoint = document.getElementById('cust-endpoint').value.trim();
        if (!validateVAT(country, vat)) {
            document.getElementById('vat-validation').textContent = 'Invalid VAT format for ' + country;
            document.getElementById('vat-validation').style.color = 'var(--error)';
            return;
        }
        if (!validateEndpoint(endpoint)) {
            document.getElementById('endpoint-validation').textContent = 'Invalid endpoint format (must be 0000:endpoint)';
            document.getElementById('endpoint-validation').style.color = 'var(--error)';
            return;
        }
        await saveCustomer(userId);
    });

    // Real-time validation and auto-sync
    document.getElementById('cust-country')?.addEventListener('change', updateValidation);
    document.getElementById('cust-vat')?.addEventListener('input', updateValidation);
    document.getElementById('cust-company-id')?.addEventListener('input', updateValidation);
    document.getElementById('cust-endpoint')?.addEventListener('input', () => {
        updateValidation();
        applySwedishLogic(document.getElementById('cust-endpoint').value);
    });
    document.getElementById('cust-name')?.addEventListener('input', syncRegistrationName);

    // PEPPOL Directory lookup
    document.getElementById('peppol-search-btn')?.addEventListener('click', async () => {
        const query = document.getElementById('peppol-search-input').value.trim();
        if (!query) {
            alert('Please enter a search term');
            return;
        }
        const resultsDiv = document.getElementById('peppol-results');
        resultsDiv.innerHTML = '<p>Searching PEPPOL Directory...</p>';
        resultsDiv.style.display = 'block';
        try {
            const response = await fetch(`https://directory.peppol.eu/search/1.0/json?q=${encodeURIComponent(query)}&rpc=50`);
            const data = await response.json();
            if (data.matches && data.matches.length > 0) {
                resultsDiv.innerHTML = '<h3>Found in PEPPOL Directory:</h3>';
                data.matches.forEach(match => {
                    const fullParticipant = match.participantID.value;
                    const scheme = match.participantID.scheme;
                    const participant = match.participantID.value.split('::')[1];
                    const cleanEndpoint = participant ? `${scheme}:${participant}` : fullParticipant;
                    let name = 'Unknown';
                    let country = '';
                    let vat = '';
                    if (match.entities && match.entities.length > 0) {
                        const entity = match.entities[0];
                        name = (typeof entity.name === 'string' ? entity.name : (Array.isArray(entity.name) && entity.name.length > 0 ? entity.name[0].name : 'Unknown')) || 'Unknown';
                        country = entity.countryCode || '';
                        if (entity.identifiers) {
                            const vatId = entity.identifiers.find(id => id.scheme && id.scheme.toLowerCase().includes('vat'));
                            if (vatId) vat = vatId.value;
                        }
                    }
                    const resultDiv = document.createElement('div');
                    resultDiv.className = 'peppol-result';
                    resultDiv.innerHTML = `
                        <strong>${name}</strong><br>
                        Endpoint: ${cleanEndpoint}<br>
                        Country: ${country || 'Not listed'}<br>
                        VAT: ${vat || 'Not listed'}<br>
                        <button class="cta add-from-peppol">Add This Customer</button>
                    `;
                    resultDiv.querySelector('.add-from-peppol').addEventListener('click', () => {
                        currentCustomerId = null;
                        clearForm();
                        document.getElementById('customer-form-title').textContent = 'Add Customer (from PEPPOL)';
                        document.getElementById('cust-name').value = name;
                        document.getElementById('cust-endpoint').value = cleanEndpoint;
                        document.getElementById('cust-vat').value = vat;
                        document.getElementById('cust-country').value = country;
                        const countryObj = countries.find(c => c.code === country);
                        if (countryObj) {
                            document.getElementById('country-search-input').value = `${countryObj.name} (${countryObj.code})`;
                        }
                        applySwedishLogic(cleanEndpoint);
                        syncRegistrationName();
                        updateValidation();
                        document.getElementById('customer-form-card').style.display = 'block';
                        document.getElementById('customer-form-card').scrollIntoView({ behavior: 'smooth' });
                        resultsDiv.style.display = 'none';
                        document.getElementById('peppol-search-input').value = '';
                    });
                    resultsDiv.appendChild(resultDiv);
                });
            } else {
                resultsDiv.innerHTML = '<p>No results found in PEPPOL Directory.</p>';
            }
        } catch (err) {
            resultsDiv.innerHTML = '<p>Error searching PEPPOL Directory. Try again later.</p>';
            console.error(err);
        }
    });
});

async function loadCustomers(userId) {
    const { data: customers, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (error) {
        alert('Error loading customers: ' + error.message);
        return;
    }

    renderDesktopTable(customers);
    renderMobileCards(customers);
}

function renderDesktopTable(customers) {
    const tbody = document.getElementById('customers-table').querySelector('tbody');
    tbody.innerHTML = '';
    customers.forEach(c => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${c.name}</td>
            <td>${c.vat_id || ''}</td>
            <td>${c.country || ''}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${c.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${c.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    attachActionListeners();
}

function renderMobileCards(customers) {
    const container = document.getElementById('mobile-customer-list');
    container.innerHTML = '';
    customers.forEach(c => {
        const card = document.createElement('div');
        card.className = 'customer-card';
        card.innerHTML = `
            <h3>${c.name}</h3>
            <p>VAT ID: ${c.vat_id || ''}</p>
            <p>Country: ${c.country || ''}</p>
            <div class="customer-card-actions">
                <button class="action-btn edit-btn" data-id="${c.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${c.id}">Delete</button>
            </div>
        `;
        container.appendChild(card);
    });
    attachActionListeners();
}

function attachActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editCustomer(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteCustomer(btn.dataset.id));
    });
}

async function editCustomer(id) {
    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !customer) {
        alert('Error loading customer for edit');
        return;
    }

    currentCustomerId = id;
    document.getElementById('customer-form-title').textContent = 'Edit Customer';
    document.getElementById('cust-name').value = customer.name || '';
    document.getElementById('cust-endpoint').value = customer.endpoint_id || '';
    document.getElementById('cust-vat').value = customer.vat_id || '';
    document.getElementById('cust-street').value = customer.street || '';
    document.getElementById('cust-add-street').value = customer.additional_street || '';
    document.getElementById('cust-city').value = customer.city || '';
    document.getElementById('cust-postal').value = customer.postal_code || '';
    document.getElementById('cust-country').value = customer.country || '';
    const countryObj = countries.find(c => c.code === customer.country);
    if (countryObj) {
        document.getElementById('country-search-input').value = `${countryObj.name} (${countryObj.code})`;
    } else {
        document.getElementById('country-search-input').value = '';
    }
    document.getElementById('cust-reg-name').value = customer.registration_name || '';
    document.getElementById('cust-company-id').value = customer.company_id || '';
    document.getElementById('cust-contact-name').value = customer.contact_name || '';
    document.getElementById('cust-contact-phone').value = customer.contact_phone || '';
    document.getElementById('cust-contact-email').value = customer.contact_email || '';

    document.getElementById('customer-form-card').style.display = 'block';
    document.getElementById('customer-form-card').scrollIntoView({ behavior: 'smooth' });
    updateValidation();
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting customer: ' + error.message);
        return;
    }

    await loadCustomers(userId);
}

async function saveCustomer(userId) {
    const rawVat = document.getElementById('cust-vat').value.trim();
    const country = document.getElementById('cust-country').value.trim().toUpperCase();

    // Force VAT prefix to uppercase country code
    let formattedVat = rawVat.toUpperCase();
    if (!formattedVat.startsWith(country)) {
        formattedVat = country + formattedVat.replace(/^[A-Z]{2}/, '');
    }

    // Registration Name defaults to Name if empty
    let regName = document.getElementById('cust-reg-name').value.trim();
    if (!regName) {
        regName = document.getElementById('cust-name').value.trim();
    }

    const customer = {
        user_id: userId,
        name: document.getElementById('cust-name').value.trim(),
        endpoint_id: document.getElementById('cust-endpoint').value.trim(),
        vat_id: formattedVat,
        street: document.getElementById('cust-street').value.trim(),
        additional_street: document.getElementById('cust-add-street').value.trim(),
        city: document.getElementById('cust-city').value.trim(),
        postal_code: document.getElementById('cust-postal').value.trim(),
        country: country,
        registration_name: regName,
        company_id: cleanInput(document.getElementById('cust-company-id').value),
        contact_name: document.getElementById('cust-contact-name').value.trim(),
        contact_phone: document.getElementById('cust-contact-phone').value.trim(),
        contact_email: document.getElementById('cust-contact-email').value.trim()
    };

    let error;
    if (currentCustomerId) {
        ({ error } = await supabase
            .from('customers')
            .update(customer)
            .eq('id', currentCustomerId));
    } else {
        ({ error } = await supabase
            .from('customers')
            .insert(customer));
    }

    if (error) {
        alert('Error saving customer: ' + error.message);
        return;
    }

    document.getElementById('customer-form-card').style.display = 'none';
    currentCustomerId = null;
    await loadCustomers(userId);

}


