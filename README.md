BillSwift – Responsive Invoice Generator

BillSwift is a lightweight and professional invoice generator designed for SMEs. It helps businesses quickly create itemized invoices, apply discounts and tax, manage invoice history, and export polished PDFs — all directly in the browser.

✨ Features

Responsive invoice form with business & customer details

Add/remove unlimited line items

Real-time calculation of subtotal, discount, tax, and grand total

Export invoices as PDF (via jsPDF + html2canvas)

Save invoices in LocalStorage with history view and search

Import/Export history as JSON for backup

One-click Load Sample Data to try instantly

Print-friendly A4-style preview

Calculation flow: discount → then tax (realistic for GST-style billing).

🛠 Tech Stack

HTML, CSS, JavaScript

Bootstrap 5
 – for responsive design

jsPDF
 + html2canvas
 – for PDF export

🚀 Getting Started

Download or clone the repository.

Open index.html in a browser (Chrome, Edge, Firefox).

Click Load Sample to see it in action.

Create invoices, save them, check history, or export PDFs.

Runs completely in the browser — no backend required.

📂 Project Structure
billswift/
├── index.html   # Main UI
├── styles.css   # Custom styles
└── app.js       # Core logic: state, calculations, history, PDF export

💡 Tips

Default currency is INR (for GST billing), but USD/EUR are available.

Use Export in History to back up invoices.

To simulate a backend, replace LocalStorage calls with a mock API (json-server).

🔮 Future Enhancements

GST split (CGST/SGST/IGST) + HSN/SAC validation

Simple login system for multiple users

Customer & product master database

Online payment integration (UPI/Stripe)
