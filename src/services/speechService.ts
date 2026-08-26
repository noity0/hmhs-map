// Speech Navigation Service for Spoken Voice Guidance

let isMutedState = false;
let lastSpokenText = '';

export const speechService = {
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  isMuted(): boolean {
    return isMutedState;
  },

  toggleMute(): boolean {
    isMutedState = !isMutedState;
    if (isMutedState && this.isSupported()) {
      window.speechSynthesis.cancel();
    }
    return isMutedState;
  },

  setMuted(muted: boolean) {
    isMutedState = muted;
    if (isMutedState && this.isSupported()) {
      window.speechSynthesis.cancel();
    }
  },

  speak(text: string, priority = false) {
    if (isMutedState || !this.isSupported()) return;
    if (!priority && text === lastSpokenText) return;

    try {
      window.speechSynthesis.cancel(); // Stop current speech to avoid backlog
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Try to find a natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural')));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      lastSpokenText = text;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
    }
  }
};
