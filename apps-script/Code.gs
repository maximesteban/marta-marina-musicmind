/* =========================================================
   Marta Marina — MusicMind · Newsletter endpoint
   Google Apps Script Web App
   ---------------------------------------------------------
   Qué hace:
   - Recibe el email del formulario de la web (POST).
   - Te envía un aviso por Gmail con cada alta.
   - Guarda cada alta en una Google Sheet (opcional pero recomendado).
   ========================================================= */

// ====== CONFIGURA ESTO ======================================
// 1) Email donde quieres recibir los avisos de cada alta:
var NOTIFY_EMAIL = 'TU_EMAIL@gmail.com';        // <-- CAMBIA ESTO

// 2) (Opcional) ID de una Google Sheet para guardar los emails.
//    Crea una hoja, copia el ID de su URL y pégalo aquí.
//    Si lo dejas vacío, solo se enviará el email de aviso.
var SHEET_ID = '';                               // <-- opcional
var SHEET_NAME = 'Suscriptores';
// ============================================================

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    var type = p.type || 'newsletter';
    var email = (p.email || '').trim();
    var source = p.source || 'web';

    if (!isValidEmail(email)) {
      return json({ result: 'error', message: 'Email no válido.' });
    }

    var ts = new Date();

    // ---- Mensaje de contacto (formulario modal) ----
    if (type === 'contact') {
      var name = (p.name || '').trim();
      var message = (p.message || '').trim();
      if (!name || !message) {
        return json({ result: 'error', message: 'Faltan datos.' });
      }
      if (SHEET_ID) {
        var ssc = SpreadsheetApp.openById(SHEET_ID);
        var msgSheet = ssc.getSheetByName('Mensajes') || ssc.insertSheet('Mensajes');
        if (msgSheet.getLastRow() === 0) msgSheet.appendRow(['Fecha', 'Nombre', 'Email', 'Mensaje', 'Origen']);
        msgSheet.appendRow([ts, name, email, message, source]);
      }
      MailApp.sendEmail({
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: '✉ Nuevo mensaje · MusicMind — ' + name,
        htmlBody:
          '<div style="font-family:Helvetica,Arial,sans-serif;color:#2F4A55">' +
          '<h2 style="font-weight:400">Nuevo mensaje desde la web</h2>' +
          '<p><b>Nombre:</b> ' + escapeHtml(name) + '</p>' +
          '<p><b>Email:</b> ' + escapeHtml(email) + '</p>' +
          '<p><b>Mensaje:</b></p><p style="white-space:pre-wrap">' + escapeHtml(message) + '</p>' +
          '<p style="color:#6E8A96"><b>Fecha:</b> ' + ts.toLocaleString() + '</p>' +
          '</div>'
      });
      return json({ result: 'success', message: 'Mensaje enviado.' });
    }

    // Guardar en Sheet (si está configurada)
    if (SHEET_ID) {
      var ss = SpreadsheetApp.openById(SHEET_ID);
      var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Fecha', 'Email', 'Origen']);
      }
      // Evitar duplicados
      var existing = sheet.getRange(2, 2, Math.max(sheet.getLastRow() - 1, 0) || 1, 1).getValues()
        .map(function (r) { return String(r[0]).toLowerCase(); });
      if (existing.indexOf(email.toLowerCase()) === -1) {
        sheet.appendRow([ts, email, source]);
      }
    }

    // Aviso por email
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: '✦ Nueva suscripción · MusicMind',
      htmlBody:
        '<div style="font-family:Helvetica,Arial,sans-serif;color:#2F4A55">' +
        '<h2 style="font-weight:400">Nueva alta en la newsletter</h2>' +
        '<p><b>Email:</b> ' + escapeHtml(email) + '</p>' +
        '<p><b>Origen:</b> ' + escapeHtml(source) + '</p>' +
        '<p style="color:#6E8A96"><b>Fecha:</b> ' + ts.toLocaleString() + '</p>' +
        '</div>'
    });

    return json({ result: 'success', message: 'Suscripción registrada.' });
  } catch (err) {
    return json({ result: 'error', message: 'Error interno: ' + err });
  }
}

// Healthcheck (abrir la URL en el navegador)
function doGet() {
  return json({ result: 'ok', message: 'MusicMind newsletter endpoint activo.' });
}

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
