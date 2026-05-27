// 🛡️ JSDOM Console Silencer (Safe Edition)
// ปิดเสียง Error "Not implemented: navigation" แบบนุ่มนวลและปลอดภัยที่สุด

const originalError = console.error;

console.error = (...args) => {
  const msg = args[0] ? String(args[0]) : '';
  
  // ตรวจสอบว่าเป็น Error เกี่ยวกับการเปลี่ยนหน้าของ JSDOM หรือไม่
  if (
    msg.includes('Not implemented: navigation') || 
    msg.includes('navigation (except hash changes)') ||
    msg.includes('Error: Not implemented: navigation')
  ) {
    // ปล่อยผ่าน (ไม่ต้องพิมพ์ลงหน้าจอ)
    return;
  }

  // ถ้าเป็นเรื่องอื่น ให้พิมพ์ปกติ
  originalError(...args);
};

// หมายเหตุ: เราไม่แก้ window.location โดยตรงเพราะ JSDOM ล็อคไว้แน่นหนามาก
// การปิดเสียงที่ console.error เป็นวิธีที่ได้ผลและปลอดภัยที่สุดสำหรับ Unit Test
