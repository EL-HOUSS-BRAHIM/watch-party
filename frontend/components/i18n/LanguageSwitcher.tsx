'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Globe, 
  ChevronDown, 
  Check,
  Languages,
  MapPin
} from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
  completion: number; // Translation completion percentage
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', completion: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', completion: 95 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', completion: 90 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', completion: 88 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', completion: 85 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', completion: 82 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', completion: 78 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', completion: 75 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', completion: 72 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', completion: 70 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, completion: 65 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', completion: 60 },
];

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'dropdown';
  showProgress?: boolean;
  className?: string;
}

export default function LanguageSwitcher({ 
  variant = 'default', 
  showProgress = false,
  className = '' 
}: LanguageSwitcherProps) {
  const { currentLanguage, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    const selectedLang = languages.find(lang => lang.code === langCode);
    if (selectedLang) {
      setLanguage(langCode);
      setIsOpen(false);
      
      // Apply RTL if needed
      document.documentElement.dir = selectedLang.rtl ? 'rtl' : 'ltr';
      document.documentElement.lang = langCode;
    }
  };

  // Compact variant for mobile/small spaces
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 w-8 p-0"
        >
          <span className="text-lg">{currentLang.flag}</span>
        </Button>
        
        {isOpen && (
          <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-gray-800 border rounded-lg shadow-lg min-w-[200px]">
            <div className="p-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    currentLanguage === lang.code ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.nativeName}</span>
                  {currentLanguage === lang.code && (
                    <Check className="w-4 h-4 ml-auto text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant using Select component
  if (variant === 'dropdown') {
    return (
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-40 ${className}`}>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLang.flag}</span>
            <span className="text-sm">{currentLang.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span>{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
                {showProgress && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    {lang.completion}%
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Default variant with full card layout
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Languages className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-medium">{t(&apos;language.title&apos;)}</h3>
          </div>
          <Badge variant="outline" className="text-xs">
            {languages.length} {t('language.available')}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currentLang.flag}</span>
              <div>
                <div className="font-medium">{currentLang.nativeName}</div>
                <div className="text-sm text-muted-foreground">{currentLang.name}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {t('language.current')}
              </Badge>
              <Check className="w-4 h-4 text-green-500" />
            </div>
          </div>

          <details className="group">
            <summary className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <span className="font-medium">
                {t('language.change')}
              </span>
              <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
            </summary>
            
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {languages
                .filter(lang => lang.code !== currentLanguage)
                .map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full flex items-center justify-between p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{lang.flag}</span>
                      <div>
                        <div className="font-medium">{lang.nativeName}</div>
                        <div className="text-sm text-muted-foreground">{lang.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {showProgress && (
                        <div className="text-right">
                          <div className="text-sm font-medium">{lang.completion}%</div>
                          <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all duration-300"
                              style={{ width: `${lang.completion}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {lang.rtl && (
                        <Badge variant="outline" className="text-xs">
                          RTL
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </details>

          {currentLang.rtl && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('language.rtl_notice')}
                </span>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            {t('language.help')} {' '}
            <button className="text-blue-600 hover:underline">
              {t('language.contribute')}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Utility component for quick language switching in header/navbar
export function QuickLanguageSwitcher({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher 
      variant="compact" 
      className={className}
    />
  );
}

// Utility component for settings pages
export function LanguageSettings({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher 
      variant="default" 
      showProgress={true}
      className={className}
    />
  );
}

// Utility component for forms/dropdowns
export function LanguageDropdown({ className = '' }: { className?: string }) {
  return (
    <LanguageSwitcher 
      variant="dropdown" 
      showProgress={false}
      className={className}
    />
  );
}
