export function istDateKeyFromIso(iso) {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function istTodayKey() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function isSlotBeforeToday(slot) {
  if (!slot?.start_at) return false;
  return istDateKeyFromIso(slot.start_at) < istTodayKey();
}

export function slotToForm(slot) {
  const d = istDateKeyFromIso(slot.start_at);
  const st = new Date(slot.start_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
  const et = new Date(slot.end_at).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
  return {
    date: d,
    startTime: st,
    endTime: et,
    mode: slot.mode || 'online',
    location: slot.location || '',
    title: slot.title || '',
    meeting_link: slot.meeting_link || '',
    capacity: slot.capacity || 1,
    counsellor: slot.counsellor || 'Esha Lohiya',
  };
}
