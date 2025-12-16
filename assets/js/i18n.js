// i18n translation dictionary
const translations = {
    en: {
        dashboard: "Dashboard",
        create_invoice: "Create Invoice",
        switch_supplier: "Switch Supplier",
        customers: "Customers",
        logout: "Logout",
        analytics_overview: "Analytics Overview",
        monthly_revenue: "Monthly Revenue (Billed vs Paid)",
        invoice_status_distribution: "Invoice Status Distribution",
        top_customers: "Top 5 Customers by Revenue",
        receivables_aging: "Receivables Aging",
        invoice_history: "Invoice History",
        search_invoice_id: "Search Invoice ID",
        customer: "Customer",
        from_date: "From Date",
        to_date: "To Date",
        status: "Status",
        clear_filters: "Clear Filters",
        export_csv: "Export Displayed to CSV",
        invoice_id: "Invoice ID",
        date: "Date",
        total: "Total",
        currency: "Currency",
        actions: "Actions",
        no_invoices_yet: "No invoices yet",
        get_started_peppol: "Get started by creating your first PEPPOL invoice.",
        draft: "Draft",
        sent: "Sent",
        paid: "Paid",
        edit: "Edit",
        view: "View",
        download: "Download",
        delete: "Delete",
        delete_draft: "Delete Draft"
    },
    sv: {
        dashboard: "Instrumentpanel",
        create_invoice: "Skapa faktura",
        switch_supplier: "Byt leverantör",
        customers: "Kunder",
        logout: "Logga ut",
        analytics_overview: "Analysöversikt",
        monthly_revenue: "Månatliga intäkter (Fakturerat vs Betalt)",
        invoice_status_distribution: "Fakturastatusfördelning",
        top_customers: "Topp 5 kunder efter intäkt",
        receivables_aging: "Fordringar per ålder",
        invoice_history: "Fakturahistorik",
        search_invoice_id: "Sök faktura-ID",
        customer: "Kund",
        from_date: "Från datum",
        to_date: "Till datum",
        status: "Status",
        clear_filters: "Rensa filter",
        export_csv: "Exportera visade till CSV",
        invoice_id: "Faktura-ID",
        date: "Datum",
        total: "Totalt",
        currency: "Valuta",
        actions: "Åtgärder",
        no_invoices_yet: "Inga fakturor ännu",
        get_started_peppol: "Kom igång genom att skapa din första PEPPOL-faktura.",
        draft: "Utkast",
        sent: "Skickad",
        paid: "Betald",
        edit: "Redigera",
        view: "Visa",
        download: "Ladda ner",
        delete: "Radera",
        delete_draft: "Radera utkast"
    },
    // ... (include all other languages from previous version)
    // no, da, fr, es, de, it, nl, pl — same as before
};

// Current language
let currentLang = localStorage.getItem('preferred_language') || 'en';

// Apply translations to all elements with data-i18n
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (translations[currentLang] && translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });
}

// Language change handler
document.querySelectorAll('.language-dropdown button').forEach(btn => {
    btn.addEventListener('click', () => {
        currentLang = btn.dataset.lang;
        localStorage.setItem('preferred_language', currentLang);
        applyTranslations();
        // Re-render analytics to update dynamic text (chart legends, status badges)
        if (typeof renderAnalytics === 'function' && displayedInvoices) {
            renderAnalytics(displayedInvoices);
        }
        if (typeof renderDesktopTable === 'function') renderDesktopTable(displayedInvoices);
        if (typeof renderMobileCards === 'function') renderMobileCards(displayedInvoices);
    });
});