import { Appointment } from '../types';

/**
 * Generates an official, beautifully formatted HTML document for an M.Y. Hospital appointment slip.
 */
export function generateAppointmentSlipHtml(appointment: Appointment, roomLocation?: string): string {
  const isCancelled = appointment.status === 'Cancelled';
  const statusColor = isCancelled ? '#dc2626' : '#0d9488';
  const statusBg = isCancelled ? '#fee2e2' : '#ccfbf1';
  const formattedBookedDate = new Date(appointment.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Slip - ${appointment.id} - M. Y. Hospital</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      padding: 24px;
      display: flex;
      justify-content: center;
      line-height: 1.5;
    }
    .slip-container {
      width: 100%;
      max-width: 680px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .hospital-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f766e;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .hospital-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    .slip-badge {
      display: inline-block;
      margin-top: 10px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #334155;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 14px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .token-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px dashed #94a3b8;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .token-box {
      text-align: left;
    }
    .token-label {
      font-size: 11px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
    }
    .token-val {
      font-size: 26px;
      font-weight: 900;
      color: #0f766e;
      font-family: monospace;
    }
    .status-badge {
      font-size: 13px;
      font-weight: 700;
      padding: 6px 16px;
      border-radius: 6px;
      background: ${statusBg};
      color: ${statusColor};
      border: 1px solid ${statusColor};
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .card-section {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 10px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .info-label {
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
      text-align: right;
    }
    .highlight-box {
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
    }
    .instructions {
      font-size: 11px;
      color: #475569;
      margin-top: 16px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
    }
    .instructions ul {
      margin-left: 18px;
      margin-top: 6px;
    }
    .instructions li {
      margin-bottom: 4px;
    }
    .barcode-area {
      margin-top: 24px;
      text-align: center;
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
    }
    .barcode {
      display: inline-block;
      height: 38px;
      background: repeating-linear-gradient(
        90deg,
        #1e293b 0px,
        #1e293b 2px,
        transparent 2px,
        transparent 4px,
        #1e293b 4px,
        #1e293b 7px,
        transparent 7px,
        transparent 9px,
        #1e293b 9px,
        #1e293b 13px,
        transparent 13px,
        transparent 16px
      );
      width: 220px;
      margin: 4px auto;
    }
    .barcode-text {
      font-family: monospace;
      font-size: 12px;
      color: #64748b;
      letter-spacing: 2px;
      margin-top: 4px;
    }
    .print-btn-row {
      margin-top: 24px;
      text-align: center;
    }
    .print-btn {
      background: #0f766e;
      color: white;
      border: none;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
    }
    .print-btn:hover {
      background: #115e59;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .slip-container {
        border: none;
        box-shadow: none;
        padding: 16px;
        max-width: 100%;
      }
      .print-btn-row {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="slip-container">
    <div class="header">
      <h1 class="hospital-title">Maharaja Yeshwantrao Hospital (M.Y. Hospital)</h1>
      <p class="hospital-sub">MYH Road, South Tukoganj, Indore, Madhya Pradesh - 452001</p>
      <p class="hospital-sub">Government Autonomous Medical Institution • Emergency: 0731-2527200 / 108</p>
      <div class="slip-badge">OPD Consultation & Registration Pass</div>
    </div>

    <div class="token-row">
      <div class="token-box">
        <div class="token-label">OPD Queue Token</div>
        <div class="token-val">${appointment.tokenNumber}</div>
      </div>
      <div class="status-box" style="text-align: right;">
        <div class="token-label">Status</div>
        <div class="status-badge">${appointment.status.toUpperCase()}</div>
      </div>
    </div>

    <div class="grid">
      <!-- Patient Information -->
      <div class="card-section">
        <div class="section-title">Patient Information</div>
        <div class="info-row">
          <span class="info-label">Full Name:</span>
          <span class="info-value">${appointment.patientName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Age / Gender:</span>
          <span class="info-value">${appointment.patientAge} Years / ${appointment.patientGender}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Contact Phone:</span>
          <span class="info-value">${appointment.patientPhone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${appointment.patientEmail || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Visit Type:</span>
          <span class="info-value">${appointment.visitType}</span>
        </div>
      </div>

      <!-- Doctor & Consultation Details -->
      <div class="card-section">
        <div class="section-title">Doctor & Department</div>
        <div class="info-row">
          <span class="info-label">Doctor:</span>
          <span class="info-value">${appointment.doctorName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Department:</span>
          <span class="info-value">${appointment.departmentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Specialty:</span>
          <span class="info-value">${appointment.doctorSpecialty}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="info-value">${roomLocation || 'OPD Block A - 2nd Floor'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Consultation Fee:</span>
          <span class="info-value">Subsidized OPD (Free / Nominal)</span>
        </div>
      </div>
    </div>

    <!-- Appointment Schedule Highlight -->
    <div class="highlight-box">
      <div class="info-row" style="margin-bottom: 4px;">
        <span class="info-label" style="font-weight: 700; color: #0f766e;">Appointment Date:</span>
        <span class="info-value" style="font-size: 15px; color: #0f766e;">${appointment.appointmentDate}</span>
      </div>
      <div class="info-row" style="margin-bottom: 4px;">
        <span class="info-label" style="font-weight: 700; color: #0f766e;">Scheduled Time Slot:</span>
        <span class="info-value" style="font-size: 15px; color: #0f766e;">${appointment.appointmentTime}</span>
      </div>
      <div class="info-row" style="margin-bottom: 0;">
        <span class="info-label">Reporting Time:</span>
        <span class="info-value">15 Minutes before slot for vital check</span>
      </div>
    </div>

    ${
      appointment.symptoms
        ? `<div class="card-section" style="margin-bottom: 16px;">
            <div class="section-title">Chief Complaint / Symptoms Reported</div>
            <p style="font-size: 13px; color: #334155;">${appointment.symptoms}</p>
          </div>`
        : ''
    }

    <!-- Barcode & Tracking Reference -->
    <div class="barcode-area">
      <div class="token-label">Booking Reference ID</div>
      <div class="barcode"></div>
      <div class="barcode-text">${appointment.id}</div>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Generated on: ${formattedBookedDate}</p>
    </div>

    <!-- Instructions -->
    <div class="instructions">
      <strong>Important Guidelines for Patients:</strong>
      <ul>
        <li>Please present this digital or printed slip at Central OPD Counter No. 4/5 upon arrival.</li>
        <li>Carry your previous medical prescriptions, lab reports, and Government Photo ID (Aadhaar / Voter ID).</li>
        <li>In case of critical emergencies, please proceed immediately to the 24/7 Trauma Emergency Wing.</li>
        <li>For reschedules or cancellations, visit the M.Y. Hospital Patient Portal.</li>
      </ul>
    </div>

    <div class="print-btn-row">
      <button class="print-btn" onclick="window.print()">Print This Slip</button>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a browser download of the appointment slip as an HTML file that can be opened and printed anywhere.
 */
export function downloadAppointmentSlip(appointment: Appointment, roomLocation?: string): void {
  const html = generateAppointmentSlipHtml(appointment, roomLocation);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const safeName = appointment.patientName.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `MYH_Appointment_Slip_${appointment.id}_${safeName}.html`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Robustly prints the appointment slip using an isolated hidden iframe.
 * This avoids iframe printing restrictions in sandboxed preview environments.
 */
export function printAppointmentSlip(appointment: Appointment, roomLocation?: string): void {
  const html = generateAppointmentSlipHtml(appointment, roomLocation);
  
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    
    // Give time for layout and print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print restricted, falling back to download:', err);
        downloadAppointmentSlip(appointment, roomLocation);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }
    }, 400);
  } else {
    // Fallback directly to download if iframe document is not accessible
    downloadAppointmentSlip(appointment, roomLocation);
  }
}
