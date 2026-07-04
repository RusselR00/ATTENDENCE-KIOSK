/**
 * Attendance Kiosk — Google Apps Script backend
 *
 * Container-bound to a Google Sheet. Deploy as a Web App
 * ("Execute as: Me", "Who has access: Anyone with the link").
 *
 * Sheet tabs:
 *   Employees : Employee ID | Name | PIN | Active
 *   Punches   : Server Timestamp | Employee ID | Name | Type | Selfie Link | Status
 *
 * Run setupSheets() once from the editor to create the tabs.
 */

const EMPLOYEES_SHEET  = 'Employees';
const PUNCHES_SHEET     = 'Punches';
const SELFIE_FOLDER_NAME = 'Attendance Selfies';

/** Serve the phone/kiosk page. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Attendance')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1');
}

/** One-time setup: create the tabs and headers if they don't exist. */
function setupSheets() {
  const ss = SpreadsheetApp.getActive();

  let emp = ss.getSheetByName(EMPLOYEES_SHEET);
  if (!emp) {
    emp = ss.insertSheet(EMPLOYEES_SHEET);
    emp.appendRow(['Employee ID', 'Name', 'PIN', 'Active']);
    emp.appendRow(['E001', 'Example Name', '1234', 'Yes']);
    emp.setFrozenRows(1);
  }

  let p = ss.getSheetByName(PUNCHES_SHEET);
  if (!p) {
    p = ss.insertSheet(PUNCHES_SHEET);
    p.appendRow(['Server Timestamp', 'Employee ID', 'Name', 'Type', 'Selfie Link', 'Status']);
    p.setFrozenRows(1);
  }
}

/** Active employees (ID + Name only — never the PIN). */
function getEmployees() {
  const sh = SpreadsheetApp.getActive().getSheetByName(EMPLOYEES_SHEET);
  const data = sh.getDataRange().getValues();
  const out = [];
  for (let i = 1; i < data.length; i++) {
    const id = data[i][0], name = data[i][1], active = data[i][3];
    if (!id || !name) continue;
    if (String(active).toLowerCase() === 'no' || active === false) continue;
    out.push({ id: String(id), name: String(name) });
  }
  return out;
}

/** Check a PIN before the employee bothers taking a selfie. */
function validatePin(employeeId, pin) {
  const sh = SpreadsheetApp.getActive().getSheetByName(EMPLOYEES_SHEET);
  const data = sh.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(employeeId)) {
      const active = data[i][3];
      if (String(active).toLowerCase() === 'no' || active === false) {
        return { ok: false, message: 'This employee is inactive.' };
      }
      if (String(data[i][2]) === String(pin)) {
        return { ok: true, name: String(data[i][1]) };
      }
      return { ok: false, message: 'Incorrect PIN.' };
    }
  }
  return { ok: false, message: 'Employee not found.' };
}

/**
 * Record a punch.
 * payload = { employeeId, pin, type: 'IN'|'OUT', selfieBase64 }
 */
function submitPunch(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActive();

    // Re-validate PIN server-side (defence in depth).
    const check = validatePin(payload.employeeId, payload.pin);
    if (!check.ok) return check;

    const type = payload.type;
    if (type !== 'IN' && type !== 'OUT') {
      return { ok: false, message: 'Invalid punch type.' };
    }

    const id = String(payload.employeeId);
    const name = check.name;
    const punches = ss.getSheetByName(PUNCHES_SHEET);
    const pData = punches.getDataRange().getValues();

    // Find this employee's most recent punch.
    let lastRow = -1, lastType = null, lastStatus = null;
    for (let i = pData.length - 1; i >= 1; i--) {
      if (String(pData[i][1]) === id) {
        lastRow = i + 1;            // 1-based sheet row
        lastType = pData[i][3];
        lastStatus = pData[i][5];
        break;
      }
    }

    // Missing-punch-out / orphan logic.
    let status;
    if (type === 'IN') {
      if (lastType === 'IN' && lastStatus === 'OPEN' && lastRow > 0) {
        punches.getRange(lastRow, 6).setValue('MISSING PUNCH-OUT');
      }
      status = 'OPEN';
    } else { // OUT
      if (lastType === 'IN' && lastStatus === 'OPEN' && lastRow > 0) {
        punches.getRange(lastRow, 6).setValue('OK');
        status = 'OK';
      } else {
        status = 'ORPHAN OUT';
      }
    }

    const selfieUrl = saveSelfie(payload.selfieBase64, id, name, type);

    const now = new Date();
    punches.appendRow([now, id, name, type, selfieUrl, status]);

    const tz = Session.getScriptTimeZone();
    const timeStr = Utilities.formatDate(now, tz, 'hh:mm a');
    let message = 'Punched ' + type + ' at ' + timeStr;
    if (status === 'ORPHAN OUT') message += ' — no open session, flagged for review';

    return { ok: true, message: message, name: name, type: type, time: timeStr, status: status };
  } finally {
    lock.releaseLock();
  }
}

/** Save the stamped selfie to Drive and return its link. */
function saveSelfie(base64, id, name, type) {
  if (!base64) return '';
  const folder = getSelfieFolder();
  const raw = base64.replace(/^data:image\/\w+;base64,/, '');
  const safeName = String(name).replace(/\s+/g, '');
  const filename = id + '_' + safeName + '_' + type + '_' + Date.now() + '.jpg';
  const blob = Utilities.newBlob(Utilities.base64Decode(raw), 'image/jpeg', filename);
  const file = folder.createFile(blob);
  return file.getUrl();
}

function getSelfieFolder() {
  const it = DriveApp.getFoldersByName(SELFIE_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(SELFIE_FOLDER_NAME);
}
