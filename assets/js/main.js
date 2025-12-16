const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4cGFwbGFiam9jeGFmdHFvY2d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTcyOTQsImV4cCI6MjA4MTIzMzI5NH0.VpoV9d2XGkRTv5UoZFKiA23IOOV2zasV18pW_9JmCj4";
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

let allInvoices = [];
let displayedInvoices = [];
let currentSort = { key: 'issue_date', direction: 'desc' };
let revenueChart = null;
let statusChart = null;
let topCustomersChart = null;
let agingChart = null;

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    const activeSupplierName = localStorage.getItem('selected_supplier_name');
    const activeSupplierSpan = document.getElementById('active-supplier');
    if (activeSupplierName) {
        activeSupplierSpan.textContent = `Active: ${activeSupplierName}`;
    } else {
        activeSupplierSpan.innerHTML = 'No supplier selected — <a href="suppliers.html" style="color: var(--accent); text-decoration: underline;">Select one</a>';
    }

    const selectedSupplierId = localStorage.getItem('selected_supplier_id');
    if (!selectedSupplierId) {
        alert("Please select a supplier first.");
        window.location.href = 'suppliers.html';
        return;
    }

    document.getElementById('create-invoice-btn').addEventListener('click', () => window.location.href = 'form.html');
    document.getElementById('mobile-create-invoice-btn')?.addEventListener('click', () => window.location.href = 'form.html');
    document.getElementById('empty-create-btn')?.addEventListener('click', () => window.location.href = 'form.html');

    document.getElementById('suppliers-btn').addEventListener('click', () => window.location.href = 'suppliers.html');
    document.getElementById('mobile-suppliers-btn')?.addEventListener('click', () => window.location.href = 'suppliers.html');

    document.getElementById('customers-btn').addEventListener('click', () => window.location.href = 'customers.html');
    document.getElementById('mobile-customers-btn')?.addEventListener('click', () => window.location.href = 'customers.html');

    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', logout);

    async function logout() {
        await supabase.auth.signOut();
        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');
        window.location.href = 'index.html';
    }

    document.getElementById('export-csv-btn').addEventListener('click', exportDisplayedToCSV);

    const themeSwitch = document.getElementById('theme-switch');
    const mobileThemeSwitch = document.getElementById('mobile-theme-switch');
    const savedTheme = localStorage.getItem('theme');

    const applyTheme = (isLight) => {
        if (isLight) {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        }
    };

    const preferredLight = !savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches;
    const initialLight = savedTheme === 'light' || preferredLight;

    applyTheme(initialLight);
    themeSwitch.checked = initialLight;
    if (mobileThemeSwitch) mobileThemeSwitch.checked = initialLight;

    themeSwitch.addEventListener('change', () => {
        applyTheme(themeSwitch.checked);
        if (mobileThemeSwitch) mobileThemeSwitch.checked = themeSwitch.checked;
    });

    if (mobileThemeSwitch) {
        mobileThemeSwitch.addEventListener('change', () => {
            applyTheme(mobileThemeSwitch.checked);
            themeSwitch.checked = mobileThemeSwitch.checked;
        });
    }

    // Table sorting
    document.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = key;
                currentSort.direction = 'asc';
            }
            document.querySelectorAll('th.sortable').forEach(h => h.classList.remove('asc', 'desc'));
            th.classList.add(currentSort.direction);
            sortAndRender();
        });
    });

    // Apply translations on load (from i18n.js)
    applyTranslations();

    await loadInvoices(session.user.id, selectedSupplierId);
});

function formatAmount(amount) {
    amount = parseFloat(amount) || 0;
    if (amount >= 1_000_000_000) {
        return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + 'b';
    } else if (amount >= 1_000_000) {
        return (amount / 1_000_000).toFixed(1).replace('.0', '') + 'm';
    } else if (amount >= 1_000) {
        return (amount / 1_000).toFixed(1).replace('.0', '') + 'k';
    } else {
        return amount.toFixed(2);
    }
}

function sortInvoices(invoices) {
    const { key, direction } = currentSort;
    return [...invoices].sort((a, b) => {
        let valA = a[key] ?? '';
        let valB = b[key] ?? '';
        if (key === 'total_amount') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        } else if (key === 'issue_date') {
            valA = valA ? new Date(valA) : new Date(0);
            valB = valB ? new Date(valB) : new Date(0);
        } else if (key === 'status') {
            const order = { paid: 3, sent: 2, draft: 1, null: 1, '': 1 };
            valA = order[valA] || 0;
            valB = order[valB] || 0;
        }
        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function sortAndRender() {
    displayedInvoices = sortInvoices(displayedInvoices);
    renderDesktopTable(displayedInvoices);
    renderMobileCards(displayedInvoices);
}

async function loadInvoices(userId, supplierId) {
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select('id, invoice_id, issue_date, customer_name, total_amount, currency, xml_data, status, form_data')
        .eq('user_id', userId)
        .eq('supplier_id', supplierId)
        .order('issue_date', { ascending: false });
    if (error) {
        const msg = `Error loading invoices: ${error.message}`;
        document.querySelector('#invoices-table tbody').innerHTML = `<tr><td colspan="8" class="no-invoices">${msg}</td></tr>`;
        document.getElementById('mobile-invoice-list').innerHTML = `<div class="no-invoices">${msg}</div>`;
        return;
    }
    allInvoices = invoices || [];
    applyFilters();
}

function renderAnalytics(invoices) {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
    const paidRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
    const outstanding = totalRevenue - paidRevenue;
    const avgInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0;
    const drafts = invoices.filter(inv => !inv.status || inv.status === 'draft').length;
    const sent = invoices.filter(inv => inv.status === 'sent').length;
    const paid = invoices.filter(inv => inv.status === 'paid').length;
    document.getElementById('metrics-grid').innerHTML = `
        <div class="metric-card">
            <h3>Total Invoices</h3>
            <div class="value">${totalInvoices}</div>
        </div>
        <div class="metric-card">
            <h3>Total Billed</h3>
            <div class="value">${formatAmount(totalRevenue)}</div>
        </div>
        <div class="metric-card">
            <h3>Outstanding</h3>
            <div class="value">${formatAmount(outstanding)}</div>
        </div>
        <div class="metric-card">
            <h3>Avg. Invoice</h3>
            <div class="value">${formatAmount(avgInvoice)}</div>
        </div>
        <div class="metric-card">
            <h3>Drafts</h3>
            <div class="value">${drafts}</div>
        </div>
        <div class="metric-card">
            <h3>Sent</h3>
            <div class="value">${sent}</div>
        </div>
        <div class="metric-card">
            <h3>Paid</h3>
            <div class="value">${paid}</div>
        </div>
    `;
    const monthlyBilled = {};
    const monthlyPaid = {};
    invoices.forEach(inv => {
        if (inv.issue_date) {
            const month = inv.issue_date.substring(0, 7);
            const amount = parseFloat(inv.total_amount) || 0;
            monthlyBilled[month] = (monthlyBilled[month] || 0) + amount;
            if (inv.status === 'paid') monthlyPaid[month] = (monthlyPaid[month] || 0) + amount;
        }
    });
    const months = [...new Set([...Object.keys(monthlyBilled), ...Object.keys(monthlyPaid)])].sort();
    const billedData = months.map(m => monthlyBilled[m] || 0);
    const paidData = months.map(m => monthlyPaid[m] || 0);
    if (revenueChart) revenueChart.destroy();
    revenueChart = new Chart(document.getElementById('revenueChart'), {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: translations[currentLang]['billed'] || 'Billed', data: billedData, borderColor: '#facc15', backgroundColor: 'rgba(250,204,21,0.2)', tension: 0.3, fill: true },
                { label: translations[currentLang]['paid_label'] || 'Paid', data: paidData, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)', tension: 0.3, fill: true }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 14, weight: '600' },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'rectRounded'
                    }
                }
            }
        }
    });
    if (statusChart) statusChart.destroy();
    statusChart = new Chart(document.getElementById('statusChart'), {
        type: 'doughnut',
        data: {
            labels: [
                `${translations[currentLang]['draft'] || 'Draft'} (${formatAmount(outstanding)})`,
                `${translations[currentLang]['sent'] || 'Sent'} (${formatAmount(invoices.filter(i=>i.status==='sent').reduce((s,i)=>s+(parseFloat(i.total_amount)||0),0))})`,
                `${translations[currentLang]['paid'] || 'Paid'} (${formatAmount(paidRevenue)})`
            ],
            datasets: [{
                data: [drafts, sent, paid],
                backgroundColor: ['#ef4444', '#f59e0b', '#22c55e']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 13, weight: '600' },
                        padding: 12,
                        usePointStyle: true,
                        pointStyle: 'rectRounded',
                        boxWidth: 12,
                        boxHeight: 12
                    }
                }
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            }
        }
    });
    const customerRevenue = {};
    invoices.forEach(inv => {
        const name = inv.customer_name || 'Unknown';
        customerRevenue[name] = (customerRevenue[name] || 0) + (parseFloat(inv.total_amount) || 0);
    });
    const top5 = Object.entries(customerRevenue)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    if (topCustomersChart) topCustomersChart.destroy();
    topCustomersChart = new Chart(document.getElementById('topCustomersChart'), {
        type: 'bar',
        data: {
            labels: top5.map(c => c[0]),
            datasets: [{
                label: 'Revenue',
                data: top5.map(c => c[1]),
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: { x: { beginAtZero: true } }
        }
    });
    const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const today = new Date();
    invoices.filter(inv => inv.status !== 'paid').forEach(inv => {
        if (!inv.issue_date) return;
        const days = Math.floor((today - new Date(inv.issue_date)) / (1000 * 60 * 60 * 24));
        const amount = parseFloat(inv.total_amount) || 0;
        if (days <= 30) aging['0-30'] += amount;
        else if (days <= 60) aging['31-60'] += amount;
        else if (days <= 90) aging['61-90'] += amount;
        else aging['90+'] += amount;
    });
    if (agingChart) agingChart.destroy();
    agingChart = new Chart(document.getElementById('agingChart'), {
        type: 'bar',
        data: {
            labels: ['0-30 days', '31-60 days', '61-90 days', '90+ days'],
            datasets: [{
                label: 'Outstanding',
                data: [aging['0-30'], aging['31-60'], aging['61-90'], aging['90+']],
                backgroundColor: ['#22c55e', '#f59e0b', '#f97316', '#ef4444']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function renderDesktopTable(invoices) {
    const tbody = document.querySelector('#invoices-table tbody');
    const emptyState = document.getElementById('empty-state');
    if (invoices.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';
    tbody.innerHTML = '';
    invoices.forEach(inv => {
        let statusColor = inv.status === 'paid' ? '#10b981' : inv.status === 'sent' ? 'var(--success)' : 'var(--error)';
        let statusText = inv.status === 'paid' ? (translations[currentLang]['paid'] || 'Paid') : inv.status === 'sent' ? (translations[currentLang]['sent'] || 'Sent') : (translations[currentLang]['draft'] || 'Draft');
        if (!inv.status || inv.status === 'draft') statusText = translations[currentLang]['draft'] || 'Draft';
        const statusBadge = `<span style="padding:6px 14px; border-radius:50px; font-size:12px; font-weight:600; background:${statusColor}; color:white;">${statusText}</span>`;
        const isDraft = (!inv.status || inv.status === 'draft');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${inv.invoice_id || 'N/A'}</strong></td>
            <td>${inv.issue_date ? new Date(inv.issue_date).toLocaleDateString(currentLang === 'sv' ? 'sv-SE' : 'en-GB') : '—'}</td>
            <td>${inv.customer_name || '—'}</td>
            <td><strong>${formatAmount(inv.total_amount)}</strong></td>
            <td>${inv.currency || 'EUR'}</td>
            <td>${statusBadge}</td>
            <td class="actions-cell">
                ${isDraft ? `<button class="action-btn edit-btn" data-id="${inv.id}">${translations[currentLang]['edit'] || 'Edit'}</button>` : ''}
                ${inv.xml_data ? `<button class="action-btn view-btn" data-id="${inv.id}">${translations[currentLang]['view'] || 'View'}</button>` : '<span style="color:var(--text-secondary);font-size:11px;">No XML</span>'}
                ${inv.xml_data ? `<button class="action-btn download-btn" data-id="${inv.id}">${translations[currentLang]['download'] || 'Download'}</button>` : ''}
            </td>
            <td>
                ${isDraft ? `<span class="delete-icon" data-id="${inv.id}" title="${translations[currentLang]['delete_draft'] || 'Delete Draft'}">🗑</span>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
    attachActionListeners();
}

function renderMobileCards(invoices) {
    const container = document.getElementById('mobile-invoice-list');
    const emptyState = document.getElementById('empty-state');
    if (invoices.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';
    container.innerHTML = '';
    invoices.forEach(inv => {
        let statusColor = inv.status === 'paid' ? '#10b981' : inv.status === 'sent' ? 'var(--success)' : 'var(--error)';
        let statusText = inv.status === 'paid' ? (translations[currentLang]['paid'] || 'Paid') : inv.status === 'sent' ? (translations[currentLang]['sent'] || 'Sent') : (translations[currentLang]['draft'] || 'Draft');
        if (!inv.status || inv.status === 'draft') statusText = translations[currentLang]['draft'] || 'Draft';
        const statusBadge = `<span style="padding:8px 16px; border-radius:50px; font-size:14px; font-weight:600; background:${statusColor}; color:white;">${statusText}</span>`;
        const isDraft = (!inv.status || inv.status === 'draft');
        const card = document.createElement('div');
        card.className = 'invoice-card';
        card.innerHTML = `
            <div class="invoice-card-header">
                <div>
                    <strong style="font-size:20px;">${inv.invoice_id || 'N/A'}</strong><br>
                    <span style="color:var(--text-secondary);">${inv.issue_date ? new Date(inv.issue_date).toLocaleDateString(currentLang === 'sv' ? 'sv-SE' : 'en-GB') : '—'}</span>
                </div>
                ${statusBadge}
            </div>
            <div class="invoice-card-main">
                <div class="invoice-card-label">${translations[currentLang]['customer'] || 'Customer'}</div>
                <div class="invoice-card-value">${inv.customer_name || '—'}</div>
                <div class="invoice-card-label">${translations[currentLang]['total'] || 'Total'}</div>
                <div class="invoice-card-value"><strong>${formatAmount(inv.total_amount)} ${inv.currency || 'EUR'}</strong></div>
            </div>
            <div class="invoice-card-actions">
                ${isDraft ? `<button class="action-btn edit-btn" data-id="${inv.id}">${translations[currentLang]['edit'] || 'Edit'}</button>` : ''}
                ${inv.xml_data ? `<button class="action-btn view-btn" data-id="${inv.id}">${translations[currentLang]['view'] || 'View'}</button>` : ''}
                ${inv.xml_data ? `<button class="action-btn download-btn" data-id="${inv.id}">${translations[currentLang]['download'] || 'Download'}</button>` : ''}
            </div>
            <div class="delete-cell-mobile">
                ${isDraft ? `<span class="delete-icon" data-id="${inv.id}">${translations[currentLang]['delete'] || 'Delete'}</span>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
    attachActionListeners();
}

function attachActionListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.onclick = () => {
            const invId = btn.dataset.id;
            const inv = allInvoices.find(i => i.id === invId);
            if (!inv) return alert('Invoice not found.');
            let formData = inv.form_data;
            if (typeof formData === 'string') {
                try { formData = JSON.parse(formData); } catch (e) { return alert('Corrupted form data.'); }
            }
            if (formData && typeof formData === 'object' && Object.keys(formData).length > 0) {
                localStorage.setItem('draft_form_data', JSON.stringify(formData));
                localStorage.setItem('editing_draft_id', inv.id);
                window.location.href = 'form.html?mode=edit_draft';
            } else {
                alert('No valid form data found for this draft.');
            }
        };
    });
    document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.onclick = async () => {
            const invId = icon.dataset.id;
            const inv = allInvoices.find(i => i.id === invId);
            if (!confirm(`Are you sure you want to permanently delete draft "${inv.invoice_id || 'N/A'}"? This action cannot be undone.`)) {
                return;
            }
            const { error } = await supabase.from('invoices').delete().eq('id', invId);
            if (error) {
                alert('Failed to delete draft: ' + error.message);
            } else {
                alert('Draft deleted successfully.');
                allInvoices = allInvoices.filter(i => i.id !== invId);
                applyFilters();
            }
        };
    });
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            const inv = allInvoices.find(i => i.id === btn.dataset.id);
            if (inv && inv.xml_data) {
                const blob = new Blob([inv.xml_data], { type: 'application/xml' });
                window.open(URL.createObjectURL(blob), '_blank');
            }
        };
    });
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.onclick = () => {
            const inv = allInvoices.find(i => i.id === btn.dataset.id);
            if (inv && inv.xml_data) {
                const blob = new Blob([inv.xml_data], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${inv.invoice_id || 'invoice'}.xml`;
                a.click();
                URL.revokeObjectURL(url);
            }
        };
    });
}

function applyFilters() {
    let filtered = allInvoices;
    const idFilter = document.getElementById('filter-id').value.trim().toLowerCase();
    if (idFilter) filtered = filtered.filter(inv => (inv.invoice_id || '').toLowerCase().includes(idFilter));
    const custFilter = document.getElementById('filter-customer').value.trim().toLowerCase();
    if (custFilter) filtered = filtered.filter(inv => (inv.customer_name || '').toLowerCase().includes(custFilter));
    const fromDate = document.getElementById('filter-from').value;
    if (fromDate) filtered = filtered.filter(inv => inv.issue_date >= fromDate);
    const toDate = document.getElementById('filter-to').value;
    if (toDate) filtered = filtered.filter(inv => inv.issue_date <= toDate);
    const statusFilter = document.getElementById('filter-status').value;
    if (statusFilter) filtered = filtered.filter(inv => (inv.status || 'draft') === statusFilter);
    displayedInvoices = filtered;
    sortAndRender();
    renderAnalytics(filtered);
}

['filter-id', 'filter-customer', 'filter-from', 'filter-to', 'filter-status'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
    }
});

document.getElementById('clear-filters').addEventListener('click', () => {
    ['filter-id', 'filter-customer', 'filter-from', 'filter-to'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('filter-status').value = '';
    applyFilters();
});

function exportDisplayedToCSV() {
    if (displayedInvoices.length === 0) {
        alert('No invoices currently displayed to export.');
        return;
    }
    let csv = 'Invoice ID,Issue Date,Customer Name,Total Amount,Currency,Status\n';
    displayedInvoices.forEach(inv => {
        const status = inv.status ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1) : 'Draft';
        const customer = (inv.customer_name || '').replace(/"/g, '""');
        csv += `"${inv.invoice_id || ''}","${inv.issue_date || ''}","${customer}","${inv.total_amount || '0.00'}","${inv.currency || 'EUR'}","${status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}



