import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { toast } from '@/hooks/use-toast';

} from 'lucide-react';
'use client';

  Languages, 
  Search, 
  Plus, 
  Edit, 
  Check, 
  X, 
  Download, 
  Upload,
  AlertTriangle,
  Globe,
  Filter
interface Translation {}
  key: string
  category: string
  context?: string
  source: string; // English text
  translations: Record<string, {}
    text: string
    status: 'approved' | 'pending' | 'needs_review';
    lastModified: Date
    translator: string
  }>;
}

interface Language {}
  code: string
  name: string
  nativeName: string
  flag: string
  completion: number
  totalStrings: number
  translatedStrings: number
  pendingStrings: number
}

const mockLanguages: Language[] = []
  {}
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    completion: 95,
    totalStrings: 1000,
    translatedStrings: 950,
    pendingStrings: 25
  },
  {}
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    completion: 90,
    totalStrings: 1000,
    translatedStrings: 900,
    pendingStrings: 50
  },
  {}
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    completion: 88,
    totalStrings: 1000,
    translatedStrings: 880,
    pendingStrings: 60
  }
];

const mockTranslations: Translation[] = []
  {}
    key: 'common.welcome',
    category: 'Common',
    context: 'Welcome message displayed on homepage',
    source: 'Welcome to Watch Party',
    translations: {}
      es: {}
        text: 'Bienvenido a Watch Party',
        status: 'approved',
        lastModified: new Date('2024-01-15'),
        translator: 'maria@example.com'
      },
      fr: {}
        text: 'Bienvenue à Watch Party',
        status: 'approved',
        lastModified: new Date('2024-01-14'),
        translator: 'pierre@example.com'
      },
      de: {}
        text: 'Willkommen bei Watch Party',
        status: 'pending',
        lastModified: new Date('2024-01-16'),
        translator: 'hans@example.com'
      }
    }
  },
  {}
    key: 'auth.login',
    category: 'Authentication',
    context: 'Login button text',
    source: 'Sign In',
    translations: {}
      es: {}
        text: 'Iniciar Sesión',
        status: 'approved',
        lastModified: new Date('2024-01-12'),
        translator: 'maria@example.com'
      },
      fr: {}
        text: 'Se Connecter',
        status: 'needs_review',
        lastModified: new Date('2024-01-13'),
        translator: 'pierre@example.com'
      }
    }
  },
  {}
    key: 'party.create',
    category: 'Watch Party',
    context: 'Button to create a new watch party',
    source: 'Create Party',
    translations: {}
      es: {}
        text: 'Crear Fiesta',
        status: 'approved',
        lastModified: new Date('2024-01-10'),
        translator: 'maria@example.com'
      },
      fr: {}
        text: 'Créer une Fête',
        status: 'approved',
        lastModified: new Date('2024-01-11'),
        translator: 'pierre@example.com'
      },
      de: {}
        text: 'Party Erstellen',
        status: 'pending',
        lastModified: new Date('2024-01-17'),
        translator: 'hans@example.com'
      }
    }
  }
];

export default function TranslationManagement() {
  const [languages] = useState<Language[]>(mockLanguages);
  const [translations, setTranslations] = useState<Translation[]>(mockTranslations);
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [filter, setFilter] = useState({category: 'all',
    status: 'all',
    search: ''
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const selectedLang = languages.find(lang => lang.code === selectedLanguage);
  const filteredTranslations = translations.filter(translation => {}
    const matchesCategory = filter.category === 'all' || translation.category === filter.category
    const matchesSearch = !filter.search || 
      translation.key.toLowerCase().includes(filter.search.toLowerCase()) ||
      translation.source.toLowerCase().includes(filter.search.toLowerCase()) ||
      (translation.translations[selectedLanguage]?.text || '').toLowerCase().includes(filter.search.toLowerCase());
    const translationForLang = translation.translations[selectedLanguage];
    const matchesStatus = filter.status === 'all' || 
      (filter.status === 'missing' && !translationForLang) ||
      (translationForLang && translationForLang.status === filter.status);
    return matchesCategory && matchesSearch && matchesStatus
  });

  const getStatusColor = (status: string) => {}
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'needs_review': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleEditTranslation = (key: string, currentText: string) => {}
    setEditingKey(key);
    setEditingText(currentText);
  };

  const handleSaveTranslation = (key: string) => {}
    setTranslations(prev => prev.map(translation => {}
      if (translation.key === key) {
        return {
          ...translation,
          translations: {}
            ...translation.translations,
            [selectedLanguage]: {}
              text: editingText,
              status: 'pending' as const,
              lastModified: new Date(),
              translator: 'current-user@example.com'
            }
          }
        };
      }
      return translation
    }));

    setEditingKey(null);
    setEditingText('');
    toast({title: "Translation Updated",
      description: `Translation for "${key}" has been updated and is pending review.`,
    });
  };

  const handleApproveTranslation = (key: string) => {}
    setTranslations(prev => prev.map(translation => {}
      if (translation.key === key && translation.translations[selectedLanguage]) {
        return {
          ...translation,
          translations: {}
            ...translation.translations,
            [selectedLanguage]: {}
              ...translation.translations[selectedLanguage],
              status: 'approved' as const,
              lastModified: new Date()
            }
          }
        };
      }
      return translation
    }));

    toast({title: "Translation Approved",
      description: `Translation for "${key}" has been approved.`,
    });
  };

  const exportTranslations = () => {}
    const exportData = translations.reduce((acc, translation) => {}
      acc[translation.key] = translation.translations[selectedLanguage]?.text || '';
      return acc
    }, {} as Record<string, string>);

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url
    a.download = `translations-${selectedLanguage}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categories = Array.from(new Set(translations.map(t => t.category)));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Management</h1>
          <p className="text-muted-foreground">Manage translations across all supported languages</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportTranslations}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="translate">Translate</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((language) => (
              <Card key={language.code}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <h3 className="font-semibold">{language.nativeName}</h3>
                        <p className="text-sm text-muted-foreground">{language.name}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{language.completion}%</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{language.translatedStrings}/{language.totalStrings}</span>
                      </div>
                      <Progress value={language.completion} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Completed</div>
                        <div className="font-medium text-green-600">{language.translatedStrings}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Pending</div>
                        <div className="font-medium text-yellow-600">{language.pendingStrings}</div>
                      </div>
                    </div>

                    <Button
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedLanguage(language.code)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Translations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Translation Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">1,000</div>
                  <div className="text-sm text-muted-foreground">Total Strings</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">2,730</div>
                  <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">135</div>
                  <div className="text-sm text-muted-foreground">Pending Review</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-600">270</div>
                  <div className="text-sm text-muted-foreground">Missing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Translate Tab */}
        <TabsContent value="translate" className="space-y-6">
          {/* Language and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <div className="flex items-center space-x-2">
                            <span>{lang.flag}</span>
                            <span>{lang.nativeName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search translations..."
                    value={filter.search}
                    onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                    className="w-64"
                  />
                </div>

                <Select
                  value={filter.category} 
                  onValueChange={(value) => setFilter(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filter.status} 
                  onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="needs_review">Needs Review</SelectItem>
                    <SelectItem value="missing">Missing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Selected Language Info */}
          {selectedLang && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{selectedLang.flag}</span>
                    <div>
                      <h3 className="font-semibold">{selectedLang.nativeName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedLang.translatedStrings} of {selectedLang.totalStrings} strings translated
                      </p>
                    </div>
                  </div>
                  <Progress value={selectedLang.completion} className="w-32 h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Translations List */}
          <Card>
            <CardHeader>
              <CardTitle>Translations ({filteredTranslations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTranslations.map((translation) => {}
                  const translationForLang = translation.translations[selectedLanguage];
                  const isEditing = editingKey === translation.key
                  return (
                    <div key={translation.key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {translation.key}
                            </code>
                            <Badge variant="outline">{translation.category}</Badge>
                            {translationForLang && (
                              <Badge variant="outline" className={getStatusColor(translationForLang.status)}>
                                {translationForLang.status.replace('_', ' ')}
                              </Badge>
                            )}
                            {!translationForLang && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                                Missing
                              </Badge>
                            )}
                          </div>
                          {translation.context && (
                            <p className="text-xs text-muted-foreground mb-2">{translation.context}</p>
                          )}
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Source (English)</label>
                              <p className="text-sm">{translation.source}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">
                                Translation ({selectedLang?.nativeName})
                              </label>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <Textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="text-sm"
                                    rows={2}
                                  />
                                  <div className="flex space-x-2">
                                    <Button size="sm" onClick={() => handleSaveTranslation(translation.key)}>
                                      <Check className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingKey(null)}
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-sm flex-1">
                                    {translationForLang?.text || (
                                      <span className="text-muted-foreground italic">No translation</span>
                                    )}
                                  </p>
                                  <div className="flex space-x-2 ml-4">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditTranslation(
                                        translation.key, 
                                        translationForLang?.text || ''
                                      )}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    {translationForLang && translationForLang.status !== 'approved' && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleApproveTranslation(translation.key)}
                                      >
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {translationForLang && (
                        <div className="text-xs text-muted-foreground">
                          Last modified {translationForLang.lastModified.toLocaleDateString()} by {translationForLang.translator}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Tab */}
        <TabsContent value="review" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span>Pending Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {translations
                  .filter(t => Object.values(t.translations).some(trans => trans.status === 'pending' || trans.status === 'needs_review'))
                  .map((translation) => (
                    <div key={translation.key} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {translation.key}
                          </code>
                          <p className="text-sm mt-2">{translation.source}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(translation.translations)
                          .filter(([, trans]) => trans.status === 'pending' || trans.status === 'needs_review')
                          .map(([langCode, trans]) => {}
                            const lang = languages.find(l => l.code === langCode);
                            return (
                              <div key={langCode} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                                <div className="flex items-center space-x-3">
                                  <span>{lang?.flag}</span>
                                  <div>
                                    <p className="font-medium">{trans.text}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {lang?.nativeName} • {trans.translator}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className={getStatusColor(trans.status)}>
                                    {trans.status.replace('_', ' ')}
                                  </Badge>
                                  <Button size="sm" onClick={() => handleApproveTranslation(translation.key)}>
                                    <Check className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
