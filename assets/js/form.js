document.addEventListener("DOMContentLoaded", async () => {
    const supabaseUrl = 'https://qxpaplabjocxaftqocgu.supabase.co';
    const supabaseAnonKey = "sb_publishable_he7X4Xjj74CcZfRue2RVTg_UsJSbyYC";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert("You must be logged in.");
        window.location.href = 'index.html';
        return;
    }

    const userId = session.user.id;

    const activeSupplierName = localStorage.getItem('selected_supplier_name');
    const activeSupplierSpan = document.getElementById('active-supplier');
    if (activeSupplierName) {
        activeSupplierSpan.textContent = `Active: ${activeSupplierName}`;
    } else {
        activeSupplierSpan.innerHTML = 'No supplier selected — <a href="suppliers.html" style="color: var(--accent); text-decoration: underline;">Select one</a>';
    }

    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });

    const selectedSupplierId = localStorage.getItem('selected_supplier_id');
    if (!selectedSupplierId) {
        alert("No supplier selected. Please select one first.");
        window.location.href = 'suppliers.html';
        return;
    }

    const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', selectedSupplierId)
        .single();

    if (supplierError || !supplierData) {
        alert("Could not load selected supplier. Please reselect.");
        localStorage.removeItem('selected_supplier_id');
        localStorage.removeItem('selected_supplier_name');
        window.location.href = 'suppliers.html';
        return;
    }

    const supplier = {
        name: supplierData.name || '',
        endpoint: supplierData.endpoint_id || '',
        vatID: supplierData.vat_id || '',
        street: supplierData.street || '',
        additionalStreet: supplierData.additional_street || '',
        city: supplierData.city || '',
        postalCode: supplierData.postal_code || '',
        country: supplierData.country || '',
        email: supplierData.email || '',
        registrationName: supplierData.registration_name || supplierData.name || '',
        companyID: supplierData.company_id || '',
        currency: supplierData.currency || 'EUR'
    };

    const supplierParts = (supplier.endpoint || '').split(':');
    const supplierScheme = supplierParts[0] || '';
    const supplierParticipant = supplierParts[1] || '';

    document.getElementById("supplierName").value = supplier.name;
    document.getElementById("supplierEndpoint").value = supplier.endpoint;
    document.getElementById("supplierVAT").value = supplier.vatID;
    document.getElementById("supplierStreet").value = supplier.street;
    document.getElementById("supplierAdditionalStreet").value = supplier.additionalStreet;
    document.getElementById("supplierCity").value = supplier.city;
    document.getElementById("supplierPostal").value = supplier.postalCode;
    document.getElementById("supplierCountry").value = supplier.country;
    document.getElementById("supplierEmail").value = supplier.email;
    document.getElementById("currencySelect").value = supplier.currency;

    const { data: customers, error: custError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .order('name');

    if (custError || !customers || customers.length === 0) {
        alert("No customers found. Please add one first.");
        window.location.href = 'customers.html';
        return;
    }

    const customerSelect = document.getElementById("customerSelect");
    customerSelect.innerHTML = '<option value="">-- Select Customer --</option>';
    customers.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.vat_id || 'No VAT'})`;
        opt.dataset.customer = JSON.stringify(c);
        customerSelect.appendChild(opt);
    });

    function updateCustomerFields() {
        const selectedOpt = customerSelect.selectedOptions[0];
        if (!selectedOpt || selectedOpt.value === "") {
            ['customerName','customerEndpoint','customerVAT','customerStreet','customerAdditionalStreet','customerCity','customerPostal','customerCountry','customerRegName','customerCompanyID','customerContactName','customerContactPhone','customerContactEmail'].forEach(id => {
                document.getElementById(id).value = '';
            });
            return;
        }
        const cust = JSON.parse(selectedOpt.dataset.customer);
        document.getElementById("customerName").value = cust.name || '';
        document.getElementById("customerEndpoint").value = cust.endpoint_id || '';
        document.getElementById("customerVAT").value = cust.vat_id || '';
        document.getElementById("customerStreet").value = cust.street || '';
        document.getElementById("customerAdditionalStreet").value = cust.additional_street || '';
        document.getElementById("customerCity").value = cust.city || '';
        document.getElementById("customerPostal").value = cust.postal_code || '';
        document.getElementById("customerCountry").value = cust.country || '';
        document.getElementById("customerRegName").value = cust.registration_name || cust.name || '';
        document.getElementById("customerCompanyID").value = cust.company_id || '';
        document.getElementById("customerContactName").value = cust.contact_name || '';
        document.getElementById("customerContactPhone").value = cust.contact_phone || '';
        document.getElementById("customerContactEmail").value = cust.contact_email || '';
    }

    customerSelect.addEventListener('change', updateCustomerFields);

    const { data: supplierBanks, error: banksError } = await supabase
        .from('supplier_banks')
        .select('*')
        .eq('supplier_id', selectedSupplierId);

    const paymentSelect = document.getElementById("paymentSelect");
    paymentSelect.innerHTML = '<option value="">-- Select Bank Account --</option>';

    if (banksError) {
        alert('Error loading bank accounts: ' + banksError.message);
    } else if (!supplierBanks || supplierBanks.length === 0) {
        paymentSelect.innerHTML += '<option disabled>No bank accounts found</option>';
    } else {
        supplierBanks.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.textContent = `${b.name} (${b.iban || b.bban || 'No IBAN/BBAN'})`;
            opt.dataset.bank = JSON.stringify(b);
            paymentSelect.appendChild(opt);
        });
    }

    paymentSelect.required = supplierBanks && supplierBanks.length > 0;

    // Populate payment means code dropdown
    const pmSelect = document.getElementById("paymentMeansCode");
    pmSelect.innerHTML = '<option value="">Select payment means</option>';
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
    paymentMeansCodes.forEach(pm => {
        const option = document.createElement("option");
        option.value = pm.code;
        option.textContent = `${pm.code} - ${pm.name}`;
        pmSelect.appendChild(option);
    });

    // Helper to get name from code
    function getPaymentMeansName(code) {
        const entry = paymentMeansCodes.find(pm => pm.code === code);
        return entry ? entry.name : '';
    }

    // Flag to know if we are loading from draft (to prevent overwriting user changes)
    let isLoadingDraft = false;

    paymentSelect.addEventListener("change", () => {
        const selected = paymentSelect.selectedOptions[0];
        if (!selected || !selected.dataset.bank) {
            document.getElementById("accountName").value = '';
            document.getElementById("iban").value = '';
            document.getElementById("bban").value = '';
            document.getElementById("bic").value = '';
            // Only set default if not loading from draft
            if (!isLoadingDraft) {
                document.getElementById("paymentMeansCode").value = '';
                document.getElementById("paymentID").value = '';
            }
            return;
        }
        const bank = JSON.parse(selected.dataset.bank);
        document.getElementById("accountName").value = bank.name || '';
        document.getElementById("iban").value = bank.iban || '';
        document.getElementById("bban").value = bank.bban || '';
        document.getElementById("bic").value = bank.bic || '';
        // Only override Payment Means Code and Payment ID if not loading from draft
        if (!isLoadingDraft) {
            document.getElementById("paymentMeansCode").value = bank.code || '';
            document.getElementById("paymentID").value = bank.payment_id || '';
        }
    });

    const today = new Date().toISOString().split('T')[0];
    document.querySelector('[name="issueDate"]').value = today;

    const linesTableBody = document.querySelector("#linesTable tbody");
    const allowanceTableBody = document.querySelector("#allowanceTable tbody");
    const generateBtn = document.getElementById("generateBtn");
    const generateHint = document.getElementById("generateHint");
    const sendInvoiceBtn = document.getElementById("sendInvoiceBtn");

    function isLineValid(row) {
        const desc = row.querySelector(".desc").value.trim();
        const itemName = row.querySelector(".itemName").value.trim();
        const qty = parseFloat(row.querySelector(".qty").value) || 0;
        const price = parseFloat(row.querySelector(".price").value) || 0;
        return (desc !== "" || itemName !== "") && qty > 0 && price > 0;
    }

    function updateGenerateButton() {
        const rows = linesTableBody.querySelectorAll("tr");
        const hasValidLine = Array.from(rows).some(row => isLineValid(row));
        generateBtn.disabled = !hasValidLine;
        generateHint.textContent = hasValidLine
            ? ""
            : "Add at least one complete invoice line (description or item name + qty > 0 + price > 0)";
    }

    function updateTotals() {
        let lineTotal = 0;
        let allowanceTotal = 0;
        const taxSubtotals = {};
        linesTableBody.querySelectorAll("tr").forEach(row => {
            const qty = parseFloat(row.querySelector(".qty").value) || 0;
            const price = parseFloat(row.querySelector(".price").value) || 0;
            const vat = parseFloat(row.querySelector(".vat").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const net = qty * price;
            lineTotal += net;
            if (!taxSubtotals[taxCode]) taxSubtotals[taxCode] = { taxable: 0, rate: vat };
            taxSubtotals[taxCode].taxable += net;
        });
        allowanceTableBody.querySelectorAll("tr").forEach(row => {
            const charge = row.querySelector(".chargeIndicator").checked ? 1 : -1;
            const amount = parseFloat(row.querySelector(".amount").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const vat = parseFloat(row.querySelector(".taxPercent").value) || 0;
            allowanceTotal += charge * amount;
            if (!taxSubtotals[taxCode]) taxSubtotals[taxCode] = { taxable: 0, rate: vat };
            taxSubtotals[taxCode].taxable += charge * amount;
        });
        let totalTax = 0;
        for (const key in taxSubtotals) {
            const t = taxSubtotals[key];
            t.taxAmount = +(t.taxable * t.rate / 100).toFixed(2);
            totalTax += t.taxAmount;
        }
        const taxExclusive = +(lineTotal + allowanceTotal).toFixed(2);
        const grandTotal = +(taxExclusive + totalTax).toFixed(2);
        document.getElementById("grandTotal").textContent = grandTotal.toFixed(2);
        document.getElementById("currencyDisplay").textContent = document.getElementById("currencySelect").value;
        sendInvoiceBtn.disabled = document.getElementById("xmlPreview").textContent.trim() === '&lt;XML will appear here&gt;';
    }

    const peppolTaxCodes = [
        {code: "S", desc: "Standard rate"},
        {code: "Z", desc: "Zero rated goods"},
        {code: "E", desc: "Exempt from tax"},
        {code: "AE", desc: "Reverse charge"},
        {code: "K", desc: "Intra-community supply"},
        {code: "G", desc: "Export outside EU"},
        {code: "O", desc: "Services outside scope"},
        {code: "L", desc: "Canary Islands, Ceuta and Melilla"},
        {code: "M", desc: "VAT exempt for EEA intra-community supply"}
    ];

    function createTaxCodeSelect(defaultCode = "S") {
        const select = document.createElement("select");
        select.className = "taxCode";
        peppolTaxCodes.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.code;
            opt.textContent = `${t.code} - ${t.desc}`;
            if (t.code === defaultCode) opt.selected = true;
            select.appendChild(opt);
        });
        return select;
    }

    function addInvoiceLine(values = {}) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><input class="desc" value="${values.desc || ''}"></td>
            <td><input class="itemName" value="${values.itemName || ''}"></td>
            <td><input type="number" class="qty" value="${values.qty ?? 1}" min="0.01" step="0.01"></td>
            <td><input type="number" class="price" value="${values.price ?? 10.00}" min="0.01" step="0.01"></td>
            <td><input type="number" class="vat" value="${values.vat ?? 25}" min="0" step="0.01"></td>
            <td></td>
            <td class="checkbox-cell"><input type="checkbox" class="reverseCharge" ${values.reverseCharge ? 'checked' : ''}></td>
            <td class="line-actions">
                <span class="duplicate" title="Duplicate row">📋</span>
                <span class="remove" title="Remove row">❌</span>
            </td>`;
        const taxCell = tr.querySelector("td:nth-child(6)");
        const taxSelect = createTaxCodeSelect(values.taxCode || "S");
        taxCell.appendChild(taxSelect);
        tr.querySelectorAll("input, select").forEach(el => {
            el.addEventListener("input", () => {
                updateTotals();
                updateGenerateButton();
            });
            el.addEventListener("change", () => {
                updateTotals();
                updateGenerateButton();
            });
        });
        tr.querySelector(".remove").addEventListener("click", () => {
            tr.remove();
            updateTotals();
            updateGenerateButton();
        });
        tr.querySelector(".duplicate").addEventListener("click", () => {
            const current = {
                desc: tr.querySelector(".desc").value.trim(),
                itemName: tr.querySelector(".itemName").value.trim(),
                qty: tr.querySelector(".qty").value,
                price: tr.querySelector(".price").value,
                vat: tr.querySelector(".vat").value,
                taxCode: tr.querySelector(".taxCode").value,
                reverseCharge: tr.querySelector(".reverseCharge").checked
            };
            addInvoiceLine(current);
        });
        linesTableBody.appendChild(tr);
        updateTotals();
        updateGenerateButton();
    }

    document.getElementById("addLineBtn").addEventListener("click", () => addInvoiceLine());

    document.getElementById("addAllowanceBtn").addEventListener("click", () => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="checkbox-cell"><input type="checkbox" class="chargeIndicator"></td>
            <td><input class="reason"></td>
            <td><input type="number" class="amount" value="0" step="0.01"></td>
            <td></td>
            <td><input type="number" class="taxPercent" value="25" step="0.01"></td>
            <td class="line-actions"><span class="remove">❌</span></td>`;
        tr.querySelector("td:nth-child(4)").appendChild(createTaxCodeSelect("S"));
        tr.querySelectorAll("input, select").forEach(el => {
            el.addEventListener("input", updateTotals);
            el.addEventListener("change", updateTotals);
        });
        tr.querySelector(".remove").addEventListener("click", () => {
            tr.remove();
            updateTotals();
        });
        allowanceTableBody.appendChild(tr);
        updateTotals();
    });

    const urlParams = new URLSearchParams(window.location.search);
    const isEditingDraft = urlParams.get('mode') === 'edit_draft';
    if (isEditingDraft) {
        const draftDataJSON = localStorage.getItem('draft_form_data');
        const draftId = localStorage.getItem('editing_draft_id');
        if (draftDataJSON) {
            isLoadingDraft = true;
            try {
                const data = JSON.parse(draftDataJSON);
                document.querySelector('[name="invoiceId"]').value = data.invoiceId || '';
                document.querySelector('[name="issueDate"]').value = data.issueDate || '';
                document.querySelector('[name="dueDate"]').value = data.dueDate || '';
                document.querySelector('[name="buyerReference"]').value = data.buyerReference || '';
                document.querySelector('[name="orderReference"]').value = data.orderReference || '';
                document.querySelector('[name="invoiceNote"]').value = data.invoiceNote || '';
                document.getElementById("currencySelect").value = data.currency || 'EUR';
                document.getElementById("paymentTermsNote").value = data.paymentTermsNote || '';
                if (data.customerId) {
                    customerSelect.value = data.customerId;
                    updateCustomerFields();
                }
                if (data.paymentBankId) {
                    paymentSelect.value = data.paymentBankId;
                    paymentSelect.dispatchEvent(new Event('change'));
                }
                if (data.paymentMeansCode !== undefined) {
                    document.getElementById("paymentMeansCode").value = data.paymentMeansCode;
                }
                if (data.paymentID !== undefined) {
                    document.getElementById("paymentID").value = data.paymentID;
                }
                linesTableBody.innerHTML = '';
                (data.line_items || []).forEach(item => addInvoiceLine(item));
                allowanceTableBody.innerHTML = '';
                (data.allowances || []).forEach(item => {
                    document.getElementById("addAllowanceBtn").click();
                    const rows = allowanceTableBody.querySelectorAll("tr");
                    const row = rows[rows.length - 1];
                    row.querySelector(".chargeIndicator").checked = item.charge || false;
                    row.querySelector(".reason").value = item.reason || '';
                    row.querySelector(".amount").value = item.amount || '0';
                    row.querySelector(".taxCode").value = item.taxCode || 'S';
                    row.querySelector(".taxPercent").value = item.taxPercent || '25';
                });
                if (draftId) {
                    localStorage.setItem('current_editing_draft_id', draftId);
                }
                updateGenerateButton();
                updateTotals();
            } catch (e) {
                console.error("Failed to load draft data", e);
                alert("Error loading draft data.");
            } finally {
                isLoadingDraft = false;
            }
        } else {
            alert("No draft data found.");
        }
        localStorage.removeItem('draft_form_data');
        localStorage.removeItem('editing_draft_id');
    }

    async function checkInvoiceIdDuplicate(invoiceId) {
        if (isEditingDraft) return false;
        const { data: existing, error } = await supabase
            .from('invoices')
            .select('id')
            .eq('supplier_id', selectedSupplierId)
            .eq('invoice_id', invoiceId)
            .limit(1);
        if (error) {
            alert('Error checking for duplicate invoice ID: ' + error.message);
            return true;
        }
        if (existing && existing.length > 0) {
            alert(`Invoice ID "${invoiceId}" is already used by this supplier. Please choose a different one.`);
            return true;
        }
        return false;
    }

    document.getElementById("invoiceForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const invoiceId = document.querySelector('[name="invoiceId"]').value.trim();
        if (!invoiceId) {
            alert("Invoice ID is required.");
            return;
        }
        if (!isEditingDraft && await checkInvoiceIdDuplicate(invoiceId)) {
            return;
        }

        const currentPaymentMeansCode = document.getElementById("paymentMeansCode").value;
        const currentPaymentID = document.getElementById("paymentID").value;

        const formObject = {
            invoiceId: invoiceId,
            issueDate: document.querySelector('[name="issueDate"]').value,
            dueDate: document.querySelector('[name="dueDate"]').value,
            buyerReference: document.querySelector('[name="buyerReference"]').value,
            orderReference: document.querySelector('[name="orderReference"]').value,
            currency: document.getElementById("currencySelect").value,
            invoiceNote: document.querySelector('[name="invoiceNote"]').value,
            paymentTermsNote: document.getElementById("paymentTermsNote").value,
            customerId: document.getElementById("customerSelect").value,
            paymentBankId: document.getElementById("paymentSelect").value,
            paymentMeansCode: currentPaymentMeansCode,
            paymentID: currentPaymentID,
            line_items: Array.from(linesTableBody.querySelectorAll("tr")).map(row => ({
                desc: row.querySelector(".desc").value,
                itemName: row.querySelector(".itemName").value,
                qty: row.querySelector(".qty").value,
                price: row.querySelector(".price").value,
                vat: row.querySelector(".vat").value,
                taxCode: row.querySelector(".taxCode").value,
                reverseCharge: row.querySelector(".reverseCharge").checked
            })),
            allowances: Array.from(allowanceTableBody.querySelectorAll("tr")).map(row => ({
                charge: row.querySelector(".chargeIndicator").checked,
                reason: row.querySelector(".reason").value,
                amount: row.querySelector(".amount").value,
                taxCode: row.querySelector(".taxCode").value,
                taxPercent: row.querySelector(".taxPercent").value
            }))
        };

        const issueDate = formObject.issueDate;
        const dueDate = formObject.dueDate;
        const buyerRef = formObject.buyerReference.trim();
        const orderRef = formObject.orderReference.trim();
        const note = formObject.invoiceNote;
        const currency = formObject.currency;
        const paymentTerms = formObject.paymentTermsNote;

        if (!buyerRef && !orderRef) {
            alert("PEPPOL rule: You must provide either a Buyer Reference or an Order Reference.");
            return;
        }

        const selectedCustomerOpt = customerSelect.selectedOptions[0];
        if (!selectedCustomerOpt || !selectedCustomerOpt.dataset.customer) {
            alert("Please select a customer");
            return;
        }
        const cust = JSON.parse(selectedCustomerOpt.dataset.customer);

        const custParts = (cust.endpoint_id || '').split(':');
        const custScheme = custParts[0] || '';
        const custParticipant = custParts[1] || '';

        const selectedBankOpt = paymentSelect.selectedOptions[0];
        if (!selectedBankOpt || !selectedBankOpt.dataset.bank) {
            alert("Please select a bank account");
            return;
        }
        const bank = JSON.parse(selectedBankOpt.dataset.bank);

        const paymentMeansName = getPaymentMeansName(currentPaymentMeansCode);

        let lineTotal = 0, allowanceTotal = 0;
        const taxSubtotals = {};
        linesTableBody.querySelectorAll("tr").forEach(row => {
            const qty = parseFloat(row.querySelector(".qty").value) || 0;
            const price = parseFloat(row.querySelector(".price").value) || 0;
            const vat = parseFloat(row.querySelector(".vat").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const net = qty * price;
            lineTotal += net;
            if (!taxSubtotals[taxCode]) taxSubtotals[taxCode] = { taxable: 0, rate: vat };
            taxSubtotals[taxCode].taxable += net;
        });
        allowanceTableBody.querySelectorAll("tr").forEach(row => {
            const charge = row.querySelector(".chargeIndicator").checked ? 1 : -1;
            const amount = parseFloat(row.querySelector(".amount").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const vat = parseFloat(row.querySelector(".taxPercent").value) || 0;
            allowanceTotal += charge * amount;
            if (!taxSubtotals[taxCode]) taxSubtotals[taxCode] = { taxable: 0, rate: vat };
            taxSubtotals[taxCode].taxable += charge * amount;
        });
        let totalTax = 0;
        for (const key in taxSubtotals) {
            const t = taxSubtotals[key];
            t.taxAmount = +(t.taxable * t.rate / 100).toFixed(2);
            totalTax += t.taxAmount;
        }
        const taxExclusiveAmount = +(lineTotal + allowanceTotal).toFixed(2);
        const taxInclusiveAmount = +(taxExclusiveAmount + totalTax).toFixed(2);

        document.getElementById("grandTotal").textContent = taxInclusiveAmount.toFixed(2);
        document.getElementById("currencyDisplay").textContent = currency;

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
         xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${invoiceId}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:DueDate>${dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  ${note ? `<cbc:Note>${note}</cbc:Note>` : ""}
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  ${buyerRef ? `<cbc:BuyerReference>${buyerRef}</cbc:BuyerReference>` : ""}
  ${orderRef ? `<cac:OrderReference><cbc:ID>${orderRef}</cbc:ID></cac:OrderReference>` : ""}
  <cac:AccountingSupplierParty>
    <cac:Party>
      ${supplierScheme && supplierParticipant ? `<cbc:EndpointID schemeID="${supplierScheme}">${supplierParticipant}</cbc:EndpointID>` : ''}
      <cac:PartyIdentification><cbc:ID>${supplier.vatID}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${supplier.name}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${supplier.street || ''}</cbc:StreetName>
        ${supplier.additionalStreet ? `<cbc:AdditionalStreetName>${supplier.additionalStreet}</cbc:AdditionalStreetName>` : ''}
        <cbc:CityName>${supplier.city || ''}</cbc:CityName>
        <cbc:PostalZone>${supplier.postalCode || ''}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${supplier.country}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${supplier.vatID}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${supplier.registrationName}</cbc:RegistrationName>
        <cbc:CompanyID>${supplier.companyID}</cbc:CompanyID>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      ${custScheme && custParticipant ? `<cbc:EndpointID schemeID="${custScheme}">${custParticipant}</cbc:EndpointID>` : ''}
      <cac:PartyIdentification><cbc:ID>${cust.vat_id || ''}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${cust.name}</cbc:Name></cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${cust.street || ''}</cbc:StreetName>
        ${cust.additional_street ? `<cbc:AdditionalStreetName>${cust.additional_street}</cbc:AdditionalStreetName>` : ''}
        <cbc:CityName>${cust.city || ''}</cbc:CityName>
        <cbc:PostalZone>${cust.postal_code || ''}</cbc:PostalZone>
        <cac:Country><cbc:IdentificationCode>${cust.country || ''}</cbc:IdentificationCode></cac:Country>
      </cac:PostalAddress>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cust.registration_name || cust.name}</cbc:RegistrationName>
        <cbc:CompanyID>${cust.company_id || ''}</cbc:CompanyID>
      </cac:PartyLegalEntity>
      <cac:Contact>
        <cbc:Name>${cust.contact_name || ''}</cbc:Name>
        <cbc:Telephone>${cust.contact_phone || ''}</cbc:Telephone>
        <cbc:ElectronicMail>${cust.contact_email || ''}</cbc:ElectronicMail>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode${currentPaymentMeansCode ? ` name="${paymentMeansName}"` : ''}>${currentPaymentMeansCode || ''}</cbc:PaymentMeansCode>
    <cbc:PaymentID>${currentPaymentID || ''}</cbc:PaymentID>
    <cac:PayeeFinancialAccount>
      <cbc:ID>${bank.iban || ''}</cbc:ID>
      <cbc:Name>${bank.name || ''}</cbc:Name>
      <cac:FinancialInstitutionBranch><cbc:ID>${bank.bic || ''}</cbc:ID></cac:FinancialInstitutionBranch>
    </cac:PayeeFinancialAccount>
  </cac:PaymentMeans>
  ${paymentTerms ? `<cac:PaymentTerms><cbc:Note>${paymentTerms}</cbc:Note></cac:PaymentTerms>` : ""}
  <!-- Allowances/Charges -->
`;
        allowanceTableBody.querySelectorAll("tr").forEach(row => {
            const charge = row.querySelector(".chargeIndicator").checked;
            const reason = row.querySelector(".reason").value;
            const amount = parseFloat(row.querySelector(".amount").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const taxPercent = parseFloat(row.querySelector(".taxPercent").value) || 0;
            xml += `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>${charge}</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>${reason}</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="${currency}">${amount.toFixed(2)}</cbc:Amount>
    <cac:TaxCategory>
      <cbc:ID>${taxCode}</cbc:ID>
      <cbc:Percent>${taxPercent}</cbc:Percent>
      <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
    </cac:TaxCategory>
  </cac:AllowanceCharge>`;
        });
        xml += `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${totalTax.toFixed(2)}</cbc:TaxAmount>`;
        for (const key in taxSubtotals) {
            const t = taxSubtotals[key];
            xml += `
    <cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${currency}">${t.taxable.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${currency}">${t.taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cbc:ID>${key}</cbc:ID>
        <cbc:Percent>${t.rate}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>`;
        }
        xml += `
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${taxExclusiveAmount.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${taxExclusiveAmount.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${taxInclusiveAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${taxInclusiveAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`;
        linesTableBody.querySelectorAll("tr").forEach((row, index) => {
            const desc = row.querySelector(".desc").value;
            const itemName = row.querySelector(".itemName").value;
            const qty = parseFloat(row.querySelector(".qty").value) || 0;
            const price = parseFloat(row.querySelector(".price").value) || 0;
            const vat = parseFloat(row.querySelector(".vat").value) || 0;
            const taxCode = row.querySelector(".taxCode").value;
            const lineAmount = (qty * price).toFixed(2);
            xml += `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${lineAmount}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${desc}</cbc:Description>
      <cbc:Name>${itemName}</cbc:Name>
      <cac:ClassifiedTaxCategory>
        <cbc:ID>${taxCode}</cbc:ID>
        <cbc:Percent>${vat}</cbc:Percent>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currency}">${price.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
        });
        xml += `
</Invoice>`;

        document.getElementById("xmlPreview").textContent = xml;

        const validation = validatePeppol(xml, {
            lineTotal, allowanceTotal, totalTax, taxExclusiveAmount, taxInclusiveAmount, taxSubtotals
        });

        const resultsDiv = document.getElementById("validationResults");
        const messagesDiv = document.getElementById("validationMessages");
        messagesDiv.innerHTML = "";

        if (validation.errors.length === 0 && validation.warnings.length === 0) {
            messagesDiv.innerHTML = "<p style='color:#10b981;'>✔ All checks passed! XML is PEPPOL-ready (basic validation).</p>";
        } else {
            validation.errors.forEach(err => {
                const div = document.createElement("div");
                div.className = "validation-error";
                div.textContent = "FATAL: " + err;
                messagesDiv.appendChild(div);
            });
            validation.warnings.forEach(warn => {
                const div = document.createElement("div");
                div.className = "validation-warning";
                div.textContent = "WARNING: " + warn;
                messagesDiv.appendChild(div);
            });
        }
        resultsDiv.style.display = "block";

        const invoiceData = {
            user_id: userId,
            supplier_id: selectedSupplierId,
            invoice_id: invoiceId,
            issue_date: issueDate,
            customer_name: cust.name,
            total_amount: taxInclusiveAmount,
            currency: currency,
            xml_data: xml,
            status: 'draft',
            form_data: formObject
        };

        let saveError;
        const editingId = localStorage.getItem('current_editing_draft_id');
        if (editingId) {
            ({ error: saveError } = await supabase
                .from('invoices')
                .update(invoiceData)
                .eq('id', editingId));
            localStorage.removeItem('current_editing_draft_id');
        } else {
            ({ error: saveError } = await supabase
                .from('invoices')
                .insert(invoiceData));
        }

        if (saveError) {
            alert('Generated but failed to save: ' + saveError.message);
        } else {
            alert('Invoice generated and saved as draft successfully!');
        }
        updateTotals();
    });

    document.getElementById("sendInvoiceBtn").addEventListener("click", () => {
        alert("Send Invoice feature coming soon!");
    });

    function validatePeppol(xmlString, computed) {
        const errors = [];
        const warnings = [];
        let parser = new DOMParser();
        let doc;
        try {
            doc = parser.parseFromString(xmlString, "application/xml");
            if (doc.querySelector("parsererror")) throw new Error("Invalid XML");
        } catch (err) {
            errors.push("Invalid XML structure: " + err.message);
            return { errors, warnings };
        }
        const emptyElements = doc.evaluate("//*[not(node()) or normalize-space()='']", doc, null, XPathResult.ANY_TYPE, null);
        let empty = emptyElements.iterateNext();
        while (empty) {
            errors.push(`Empty element not allowed: ${empty.tagName}`);
            empty = emptyElements.iterateNext();
        }
        const lineExtension = parseFloat(doc.querySelector("LegalMonetaryTotal > LineExtensionAmount")?.textContent || 0);
        if (Math.abs(lineExtension - computed.taxExclusiveAmount) > 0.01) {
            errors.push("LineExtensionAmount does not match calculated net total");
        }
        const payable = parseFloat(doc.querySelector("LegalMonetaryTotal > PayableAmount")?.textContent || 0);
        if (Math.abs(payable - computed.taxInclusiveAmount) > 0.01) {
            errors.push("PayableAmount does not match gross total (incl. tax)");
        }
        doc.querySelectorAll("ClassifiedTaxCategory, AllowanceCharge TaxCategory").forEach(cat => {
            const id = cat.querySelector("ID")?.textContent?.trim();
            const percent = parseFloat(cat.querySelector("Percent")?.textContent || 0);
            if (id === "S" && percent <= 0) errors.push(`Standard rate (S) must have VAT % > 0 (found ${percent})`);
            if (id === "Z" && percent !== 0) errors.push(`Zero-rated (Z) must have VAT % = 0 (found ${percent})`);
            if (id === "E" && percent !== 0) errors.push(`Exempt (E) must have VAT % = 0 (found ${percent})`);
        });
        doc.querySelectorAll("EndpointID[schemeID='0088'], PartyIdentification ID[schemeID='0088']").forEach(el => {
            const val = el.textContent.trim();
            if (!/^\d+$/.test(val)) warnings.push(`GLN (0088) should be numeric: ${val}`);
        });
        if (!doc.querySelector("ID")) errors.push("Invoice ID missing");
        if (!doc.querySelector("IssueDate")) errors.push("Issue Date missing");
        return { errors, warnings };
    }

    document.getElementById("downloadXMLBtn").addEventListener("click", () => {
        const blob = new Blob([document.getElementById("xmlPreview").textContent], { type: "application/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${document.querySelector('[name="invoiceId"]').value || 'invoice'}.xml`;
        a.click();
        URL.revokeObjectURL(url);
    });

    updateGenerateButton();
    updateTotals();

});



