const Storage = (() => {
  const PFX = 'life_';

  function key(dateStr) { return PFX + dateStr; }

  function saveRecord(dateStr, score, note) {
    localStorage.setItem(key(dateStr), JSON.stringify({ score, note: note || '', ts: Date.now() }));
  }

  function getRecord(dateStr) {
    const raw = localStorage.getItem(key(dateStr));
    return raw ? JSON.parse(raw) : null;
  }

  function deleteRecord(dateStr) {
    localStorage.removeItem(key(dateStr));
  }

  function getMonthRecords(year, month) {
    const prefix = PFX + `${year}-${String(month).padStart(2,'0')}-`;
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        const dateStr = k.slice(PFX.length);
        result[dateStr] = JSON.parse(localStorage.getItem(k));
      }
    }
    return result;
  }

  function getAllRecords() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PFX)) {
        const dateStr = k.slice(PFX.length);
        result[dateStr] = JSON.parse(localStorage.getItem(k));
      }
    }
    return result;
  }

  return { saveRecord, getRecord, deleteRecord, getMonthRecords, getAllRecords };
})();
