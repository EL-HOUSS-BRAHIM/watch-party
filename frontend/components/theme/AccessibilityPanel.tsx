'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: boolean;
  focusIndicators: boolean;
}

interface ThemeSettings {
  theme: 'light' | 'dark' | 'auto';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
}

export default function AccessibilityPanel() {
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNavigation: true,
    colorBlindSupport: false,
    focusIndicators: true
  });

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    theme: 'auto',
    accentColor: '#3b82f6',
    fontSize: 'medium',
    density: 'comfortable'
  });

  const [accessibilityScore, setAccessibilityScore] = useState(0);

  useEffect(() => {
    // Calculate accessibility score
    const enabledFeatures = Object.values(accessibilitySettings).filter(Boolean).length;
    const totalFeatures = Object.keys(accessibilitySettings).length;
    setAccessibilityScore((enabledFeatures / totalFeatures) * 100);
  }, [accessibilitySettings]);

  useEffect(() => {
    // Apply theme settings
    const root = document.documentElement;
    
    if (themeSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (themeSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto theme based on system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply font size
    root.style.setProperty('--font-size-scale', 
      themeSettings.fontSize === 'small' ? '0.875' :
      themeSettings.fontSize === 'large' ? '1.125' : '1'
    );

    // Apply density
    root.style.setProperty('--spacing-scale',
      themeSettings.density === 'compact' ? '0.75' :
      themeSettings.density === 'spacious' ? '1.25' : '1'
    );

    // Apply accent color
    root.style.setProperty('--accent-color', themeSettings.accentColor);
  }, [themeSettings]);

  useEffect(() => {
    // Apply accessibility settings
    const root = document.documentElement;

    if (accessibilitySettings.reducedMotion) {
      root.style.setProperty('--motion-reduce', 'reduce');
    } else {
      root.style.removeProperty('--motion-reduce');
    }

    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibilitySettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (accessibilitySettings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }
  }, [accessibilitySettings]);

  const updateAccessibilitySetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setAccessibilitySettings(prev => ({ ...prev, [key]: value }));
  };

  const updateThemeSetting = (key: keyof ThemeSettings, value: unknown) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const accentColors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Accessibility Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Accessibility Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{Math.round(accessibilityScore)}%</span>
              <Badge variant={accessibilityScore >= 80 ? &quot;default&quot; : accessibilityScore >= 60 ? &quot;secondary" : "destructive"}>
                {accessibilityScore >= 80 ? "Excellent" : accessibilityScore >= 60 ? "Good" : "Needs Improvement"}
              </Badge>
            </div>
            <Progress value={accessibilityScore} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {accessibilityScore >= 80 
                ? "Your accessibility settings are optimized for the best experience."
                : "Consider enabling more accessibility features for a better experience."
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Theme & Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Mode */}
          <div>
            <label className="text-sm font-medium mb-3 block">Theme Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={themeSettings.theme === 'light' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;theme&apos;, &apos;light')}
                className="flex items-center space-x-2"
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={themeSettings.theme === 'dark' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;theme&apos;, &apos;dark')}
                className="flex items-center space-x-2"
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </Button>
              <Button
                variant={themeSettings.theme === 'auto' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;theme&apos;, &apos;auto')}
                className="flex items-center space-x-2"
              >
                <Monitor className="w-4 h-4" />
                <span>Auto</span>
              </Button>
            </div>
          </div>

          {/* Accent Color */}
          <div>
            <label className="text-sm font-medium mb-3 block">Accent Color</label>
            <div className="grid grid-cols-6 gap-2">
              {accentColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateThemeSetting(&apos;accentColor&apos;, color.value)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    themeSettings.accentColor === color.value ? 'border-gray-900 dark:border-gray-100' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <label className="text-sm font-medium mb-3 block">Font Size</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={themeSettings.fontSize === 'small' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;fontSize&apos;, &apos;small')}
              >
                <Type className="w-3 h-3 mr-2" />
                Small
              </Button>
              <Button
                variant={themeSettings.fontSize === 'medium' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;fontSize&apos;, &apos;medium')}
              >
                <Type className="w-4 h-4 mr-2" />
                Medium
              </Button>
              <Button
                variant={themeSettings.fontSize === 'large' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;fontSize&apos;, &apos;large')}
              >
                <Type className="w-5 h-5 mr-2" />
                Large
              </Button>
            </div>
          </div>

          {/* Layout Density */}
          <div>
            <label className="text-sm font-medium mb-3 block">Layout Density</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={themeSettings.density === 'compact' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;density&apos;, &apos;compact')}
              >
                Compact
              </Button>
              <Button
                variant={themeSettings.density === 'comfortable' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;density&apos;, &apos;comfortable')}
              >
                Comfortable
              </Button>
              <Button
                variant={themeSettings.density === 'spacious' ? "default" : "outline"}
                size="sm"
                onClick={() => updateThemeSetting(&apos;density&apos;, &apos;spacious')}
              >
                Spacious
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Accessibility Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Reduced Motion</label>
                <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <Switch
                checked={accessibilitySettings.reducedMotion}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;reducedMotion&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">High Contrast</label>
                <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
              </div>
              <Switch
                checked={accessibilitySettings.highContrast}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;highContrast&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Large Text</label>
                <p className="text-sm text-muted-foreground">Increase text size throughout the app</p>
              </div>
              <Switch
                checked={accessibilitySettings.largeText}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;largeText&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Screen Reader Support</label>
                <p className="text-sm text-muted-foreground">Enhanced compatibility with screen readers</p>
              </div>
              <Switch
                checked={accessibilitySettings.screenReader}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;screenReader&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Keyboard Navigation</label>
                <p className="text-sm text-muted-foreground">Enhanced keyboard navigation support</p>
              </div>
              <Switch
                checked={accessibilitySettings.keyboardNavigation}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;keyboardNavigation&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Color Blind Support</label>
                <p className="text-sm text-muted-foreground">Alternative color schemes for color blindness</p>
              </div>
              <Switch
                checked={accessibilitySettings.colorBlindSupport}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;colorBlindSupport&apos;, checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">Focus Indicators</label>
                <p className="text-sm text-muted-foreground">Visible focus indicators for interactive elements</p>
              </div>
              <Switch
                checked={accessibilitySettings.focusIndicators}
                onCheckedChange={(checked) => updateAccessibilitySetting(&apos;focusIndicators&apos;, checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Optimization */}
      <Card>
        <CardHeader>
          <CardTitle>Device Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Monitor className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium">Desktop</h4>
              <p className="text-sm text-muted-foreground">Optimized for large screens</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Tablet className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium">Tablet</h4>
              <p className="text-sm text-muted-foreground">Touch-friendly interface</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Smartphone className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium">Mobile</h4>
              <p className="text-sm text-muted-foreground">Responsive mobile design</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Need help with accessibility features? Check out our resources:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Accessibility Guide
              </Button>
              <Button variant="outline" size="sm">
                Keyboard Shortcuts
              </Button>
              <Button variant="outline" size="sm">
                Screen Reader Tips
              </Button>
              <Button variant="outline" size="sm">
                Report Issues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
