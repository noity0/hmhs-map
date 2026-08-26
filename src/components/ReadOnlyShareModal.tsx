import React, { useState } from 'react';
import { ShieldCheck, Lock, Copy, Check, ExternalLink, Globe, Smartphone, Sparkles, X, Share2, Compass, Zap } from 'lucide-react';
import { DOMAIN_CONFIG } from '../utils/domainConfig';

interface ReadOnlyShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReadOnlyShareModal({ isOpen, onClose }: ReadOnlyShareModalProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (url: string, label: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in pointer-events-auto">
      <div className="bg-neutral-900 border border-emerald-500/50 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Glow Background Elements */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Read-Only Public Link</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                  Protected
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400">View & Navigate without any editing permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 my-3 flex flex-col gap-4 text-xs">
          
          {/* Security Guarantee Box */}
          <div className="bg-emerald-950/70 border border-emerald-700/60 rounded-2xl p-3.5 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-200 text-xs">100% Read-Only & Tamper-Proof</h4>
              <p className="text-emerald-100/80 text-[11px] mt-0.5 leading-relaxed">
                Anyone with these links can search, explore, and use GPS navigation freely, but <strong>cannot edit, modify code, delete files, or alter settings</strong> in the repository.
              </p>
            </div>
          </div>

          {/* Link 1: Official Edge Domain */}
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> 1. Edge Domain (Canonical Web)
              </span>
              <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-700/50 font-mono">
                Fast Global CDN
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 font-mono text-[11px] text-neutral-200 select-all overflow-x-auto">
              <span className="truncate flex-1">{DOMAIN_CONFIG.readOnlyCustomDomainUrl}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => handleCopy(DOMAIN_CONFIG.readOnlyCustomDomainUrl, 'edge')}
                className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-900/30"
              >
                {copiedLink === 'edge' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Edge Link</>}
              </button>
              <a
                href={DOMAIN_CONFIG.readOnlyCustomDomainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-neutral-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </a>
            </div>
          </div>

          {/* Link 2: Read-Only Shared App URL */}
          <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> 2. Permanent Shared Preview URL
              </span>
              <span className="text-[10px] bg-blue-950/80 text-blue-300 px-2 py-0.5 rounded-md border border-blue-700/50 font-mono">
                Read-Only Container
              </span>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 font-mono text-[11px] text-neutral-200 select-all overflow-x-auto">
              <span className="truncate flex-1">{DOMAIN_CONFIG.readOnlySharedUrl}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <button
                onClick={() => handleCopy(DOMAIN_CONFIG.readOnlySharedUrl, 'shared')}
                className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-900/30"
              >
                {copiedLink === 'shared' ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Shared Link</>}
              </button>
              <a
                href={DOMAIN_CONFIG.readOnlySharedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs flex items-center gap-1 border border-neutral-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open
              </a>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-2xl p-3.5 flex flex-col gap-2">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> How to use & share this read-only link:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px] pl-1 leading-relaxed">
              <li><strong>Copy Link:</strong> Click "Copy Edge Link" or "Copy Shared Link" above.</li>
              <li><strong>Share with anyone:</strong> Send via WhatsApp, Telegram, Email, or embed on websites.</li>
              <li><strong>Instant Access:</strong> Recipients open the link in any mobile browser, tablet, or desktop.</li>
              <li><strong>Zero Installation:</strong> Works out of the box with live GPS, voice turn-by-turn navigation, and offline tile caching.</li>
              <li><strong>Guaranteed Safety:</strong> Viewers cannot access editor panels, backend code, or workspace terminal.</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
