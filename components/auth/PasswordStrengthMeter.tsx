'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { passwordRegex } from '@/lib/validation/auth-schemas';

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: passwordRegex.uppercase.test(password) },
    { label: 'One lowercase letter (a-z)', valid: passwordRegex.lowercase.test(password) },
    { label: 'One number (0-9)', valid: passwordRegex.number.test(password) },
    { label: 'One special character (!@#$%^&*)', valid: passwordRegex.special.test(password) },
  ];

  const validCount = criteria.filter((c) => c.valid).length;

  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  let textColor = 'text-red-400';

  if (validCount === 5) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    textColor = 'text-emerald-400';
  } else if (validCount >= 3) {
    strengthLabel = 'Medium';
    strengthColor = 'bg-amber-500';
    textColor = 'text-amber-400';
  }

  const percentage = (validCount / 5) * 100;

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2 text-xs">
      {/* Strength Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400">Password Strength:</span>
        <span className={`text-[11px] font-bold ${textColor}`}>{strengthLabel}</span>
      </div>
      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strengthColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Criteria List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
        {criteria.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              item.valid ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {item.valid ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
