export function enterFullscreen() {
  const el = document.documentElement as any;
  const request = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (request) {
    try {
      request.call(el)?.catch?.(() => {});
    } catch {
      // ba'zi brauzerlar/qurilmalar qo'llab-quvvatlamasligi mumkin — sekin tushamiz
    }
  }
}

export function exitFullscreen() {
  const doc = document as any;
  const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
  if (isFullscreen) {
    const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
    if (exit) {
      try {
        exit.call(doc)?.catch?.(() => {});
      } catch {}
    }
  }
}
