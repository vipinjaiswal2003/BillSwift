// BillSwift – Responsive Invoice Generator
(function() {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const state = {
    from: { name: '', address: '', gst: '' },
    to: { name: '', address: '' },
    invoice: { number: '', date: '', currency: 'INR', taxRate: 0, discountRate: 0 },
    items: []
  };

  function currencyFormatter() {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: state.invoice.currency || 'INR',
      maximumFractionDigits: 2
    });
  }

  function genInvoiceNumber() {
    const d = new Date();
    const ymd = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('');
    const rand = Math.floor(Math.random()*900)+100;
    return `INV-${ymd}-${rand}`;
  }

  function addItemRow(item = { description: '', hsn: '', qty: 1, rate: 0 }) {
    const tbody = $('#itemsBody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input class="form-control form-control-sm item-desc" placeholder="Item description" value="${item.description || ''}"></td>
      <td><input class="form-control form-control-sm item-hsn" placeholder="HSN/SAC" value="${item.hsn || ''}"></td>
      <td><input type="number" min="0" step="1" class="form-control form-control-sm item-qty text-end" value="${item.qty ?? 1}"></td>
      <td><input type="number" min="0" step="0.01" class="form-control form-control-sm item-rate text-end" value="${item.rate ?? 0}"></td>
      <td class="text-end item-amount">0</td>
      <td><button class="btn btn-light btn-sm text-danger btn-del" title="Remove">✕</button></td>
    `;
    tbody.appendChild(tr);
    tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', onFormChange));
    tr.querySelector('.btn-del').addEventListener('click', () => { tr.remove(); onFormChange(); });
    onFormChange();
  }

  function readForm() {
    state.invoice.number = $('#invoiceNumber').value.trim();
    state.invoice.date = $('#invoiceDate').value;
    state.invoice.currency = $('#currency').value;
    state.invoice.taxRate = parseFloat($('#taxRate').value) || 0;
    state.invoice.discountRate = parseFloat($('#discountRate').value) || 0;

    state.from.name = $('#fromName').value.trim();
    state.from.address = $('#fromAddress').value.trim();
    state.from.gst = $('#fromGST').value.trim();

    state.to.name = $('#toName').value.trim();
    state.to.address = $('#toAddress').value.trim();

    state.items = $$('#itemsBody tr').map(tr => ({
      description: tr.querySelector('.item-desc').value.trim(),
      hsn: tr.querySelector('.item-hsn').value.trim(),
      qty: parseFloat(tr.querySelector('.item-qty').value) || 0,
      rate: parseFloat(tr.querySelector('.item-rate').value) || 0,
    }));
  }

  function calculate() {
    const fmt = currencyFormatter();
    let subtotal = 0;
    state.items.forEach((it, idx) => {
      const amt = (it.qty || 0) * (it.rate || 0);
      subtotal += amt;
      const row = $$('#itemsBody tr')[idx];
      if (row) row.querySelector('.item-amount').textContent = fmt.format(amt);
    });
    const discount = subtotal * (state.invoice.discountRate / 100);
    const taxable = Math.max(subtotal - discount, 0);
    const tax = taxable * (state.invoice.taxRate / 100);
    const total = taxable + tax;

    return { subtotal, discount, tax, total };
  }

  function updatePreview() {
    const fmt = currencyFormatter();
    $('#pvFromName').textContent = state.from.name || 'Your Business';
    $('#pvFromAddress').textContent = state.from.address || 'Address';
    $('#pvFromGST').textContent = state.from.gst ? `GSTIN: ${state.from.gst}` : 'GSTIN: —';
    $('#pvInvoiceNumber').textContent = state.invoice.number || 'INV-0001';
    $('#pvInvoiceDate').textContent = state.invoice.date || '—';
    $('#pvToName').textContent = state.to.name || 'Customer Name';
    $('#pvToAddress').textContent = state.to.address || 'Customer Address';
    $('#pvTaxRate').textContent = (state.invoice.taxRate || 0).toFixed(2).replace(/\.00$/, '');
    $('#pvDiscountRate').textContent = (state.invoice.discountRate || 0).toFixed(2).replace(/\.00$/, '');

    const pvItems = $('#pvItems');
    pvItems.innerHTML = '';
    state.items.forEach(it => {
      const tr = document.createElement('tr');
      const amount = (it.qty || 0) * (it.rate || 0);
      tr.innerHTML = `
        <td>${escapeHtml(it.description || '')}</td>
        <td>${escapeHtml(it.hsn || '')}</td>
        <td class="text-end">${(it.qty || 0).toString()}</td>
        <td class="text-end">${fmt.format(it.rate || 0)}</td>
        <td class="text-end">${fmt.format(amount)}</td>
      `;
      pvItems.appendChild(tr);
    });

    const { subtotal, discount, tax, total } = calculate();
    $('#pvSubtotal').textContent = fmt.format(subtotal);
    $('#pvDiscount').textContent = `- ${fmt.format(discount)}`;
    $('#pvTax').textContent = fmt.format(tax);
    $('#pvTotal').textContent = fmt.format(total);
  }

  function onFormChange() {
    readForm();
    updatePreview();
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[m]);
  }

  function newInvoice() {
    $('#invoiceNumber').value = genInvoiceNumber();
    $('#invoiceDate').valueAsDate = new Date();
    $('#currency').value = 'INR';
    $('#taxRate').value = 18;
    $('#discountRate').value = 0;

    $('#fromName').value = '';
    $('#fromAddress').value = '';
    $('#fromGST').value = '';

    $('#toName').value = '';
    $('#toAddress').value = '';

    $('#itemsBody').innerHTML = '';
    addItemRow({ description: '', hsn: '', qty: 1, rate: 0 });
    onFormChange();
  }

  function loadSample() {
    $('#fromName').value = 'Acme Traders Pvt. Ltd.';
    $('#fromAddress').value = '12, MG Road, Indiranagar, Bengaluru - 560038';
    $('#fromGST').value = '29ABCDE1234F2Z5';

    $('#toName').value = 'Bright Stationery & Co.';
    $('#toAddress').value = '54, Park Street, Kolkata - 700016';

    $('#invoiceNumber').value = genInvoiceNumber();
    $('#invoiceDate').valueAsDate = new Date();
    $('#currency').value = 'INR';
    $('#taxRate').value = 18;
    $('#discountRate').value = 5;

    $('#itemsBody').innerHTML = '';
    addItemRow({ description: 'A4 Paper Ream (500 sheets)', hsn: '4802', qty: 10, rate: 230 });
    addItemRow({ description: 'Blue Ball Pens (Box of 50)', hsn: '9608', qty: 4, rate: 175 });
    addItemRow({ description: 'Stapler No. 10', hsn: '3926', qty: 2, rate: 120 });
    onFormChange();
  }

  function saveInvoice() {
    readForm();
    const totals = calculate();
    const record = {
      id: Date.now().toString(),
      from: {...state.from},
      to: {...state.to},
      invoice: {...state.invoice},
      items: state.items.map(x => ({...x})),
      totals,
      savedAt: new Date().toISOString()
    };
    const all = getHistory();
    all.push(record);
    localStorage.setItem('invoices', JSON.stringify(all));
    populateHistory();
    alert('Invoice saved! You can find it in History.');
  }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem('invoices') || '[]'); }
    catch { return []; }
  }

  function populateHistory(filter = '') {
    const tbody = $('#historyBody');
    tbody.innerHTML = '';
    const fmt = currencyFormatter();
    let list = getHistory();
    if (filter) {
      const f = filter.toLowerCase();
      list = list.filter(r =>
        (r.to?.name || '').toLowerCase().includes(f) ||
        (r.invoice?.number || '').toLowerCase().includes(f)
      );
    }
    list.sort((a,b) => (b.savedAt || '').localeCompare(a.savedAt || ''));
    list.forEach(r => {
      const tr = document.createElement('tr');
      const date = r.invoice?.date || new Date(r.savedAt).toISOString().slice(0,10);
      tr.innerHTML = `
        <td>${date}</td>
        <td>${r.invoice?.number || ''}</td>
        <td>${escapeHtml(r.to?.name || '')}</td>
        <td class="text-end">${fmt.format(r.totals?.total || 0)}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1 btn-load" data-id="${r.id}">Load</button>
          <button class="btn btn-sm btn-outline-danger btn-del" data-id="${r.id}">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-load').forEach(btn =>
      btn.addEventListener('click', () => {
        loadInvoice(btn.getAttribute('data-id'));
        const modalEl = document.getElementById('historyModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal?.hide();
      })
    );
    tbody.querySelectorAll('.btn-del').forEach(btn =>
      btn.addEventListener('click', () => {
        deleteInvoice(btn.getAttribute('data-id'));
      })
    );
  }

  function loadInvoice(id) {
    const r = getHistory().find(x => x.id === id);
    if (!r) return;
    $('#fromName').value = r.from?.name || '';
    $('#fromAddress').value = r.from?.address || '';
    $('#fromGST').value = r.from?.gst || '';
    $('#toName').value = r.to?.name || '';
    $('#toAddress').value = r.to?.address || '';
    $('#invoiceNumber').value = r.invoice?.number || genInvoiceNumber();
    $('#invoiceDate').value = r.invoice?.date || '';
    $('#currency').value = r.invoice?.currency || 'INR';
    $('#taxRate').value = r.invoice?.taxRate ?? 0;
    $('#discountRate').value = r.invoice?.discountRate ?? 0;

    $('#itemsBody').innerHTML = '';
    (r.items || []).forEach(addItemRow);
    onFormChange();
  }

  function deleteInvoice(id) {
    let list = getHistory();
    list = list.filter(x => x.id !== id);
    localStorage.setItem('invoices', JSON.stringify(list));
    populateHistory($('#historySearch').value.trim());
  }

  function clearHistory() {
    if (!confirm('Delete ALL saved invoices?')) return;
    localStorage.removeItem('invoices');
    populateHistory();
  }

  // ✅ Fixed downloadPDF
  async function downloadPDF() {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
      alert('jsPDF failed to load. Check your internet connection.');
      return;
    }

    const preview = document.getElementById('invoice-preview');
    const fileName = (state.invoice.number || 'invoice') + '.pdf';

    // Capture invoice as canvas
    const canvas = await html2canvas(preview, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 40;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    if (imgHeight > pageHeight - 40) {
      const scale = (pageHeight - 40) / imgHeight;
      const finalWidth = imgWidth * scale;
      const finalHeight = imgHeight * scale;
      pdf.addImage(imgData, 'PNG',
        (pageWidth - finalWidth) / 2, 20,
        finalWidth, finalHeight
      );
    } else {
      pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    }

    pdf.save(fileName);
  }

  // Event bindings
  $('#btnAddItem').addEventListener('click', () => addItemRow());
  $('#btnNew').addEventListener('click', newInvoice);
  $('#btnLoadSample').addEventListener('click', loadSample);
  $('#btnSave').addEventListener('click', saveInvoice);
  $('#btnPDF').addEventListener('click', downloadPDF);
  $('#btnClearHistory').addEventListener('click', clearHistory);
  $('#btnExportHistory').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(getHistory(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invoices-history.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });
  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('Invalid JSON');
      localStorage.setItem('invoices', JSON.stringify(data));
      populateHistory($('#historySearch').value.trim());
      alert('History imported!');
    } catch (err) {
      alert('Failed to import: ' + err.message);
    } finally {
      e.target.value = '';
    }
  });

  $('#historySearch').addEventListener('input', (e) => populateHistory(e.target.value.trim()));

  ['invoiceNumber','invoiceDate','currency','taxRate','discountRate','fromName','fromAddress','fromGST','toName','toAddress'].forEach(id => {
    document.getElementById(id).addEventListener('input', onFormChange);
  });

  // Initialize
  newInvoice();
  populateHistory();
})();
