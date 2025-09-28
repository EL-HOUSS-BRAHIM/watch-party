"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
  isEnabled: boolean
  completionPercentage: number
  totalKeys: number
  translatedKeys: number
  lastUpdated: string
  contributors: number
}

interface Translation {
  key: string
  namespace: string
  sourceText: string
  translations: Record<string, string>
  context?: string
  pluralForms?: Record<string, Record<string, string>>
  lastModified: string
  status: "translated" | "pending" | "needs_review"
}

interface TranslationProject {
  id: string
  name: string
  description: string
  languages: string[]
  totalKeys: number
  completionRate: number
  contributors: number
  lastActivity: string
}

// Language Context
interface LanguageContextType {
  currentLanguage: string
  setCurrentLanguage: (lang: string) => void
  t: (key: string, params?: Record<string, any>) => string
  languages: Language[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export default function MultiLanguageSystem() {
  const { toast } = useToast()
  const [languages, setLanguages] = useState<Language[]>([])
  const [translations, setTranslations] = useState<Translation[]>([])
  const [projects, setProjects] = useState<TranslationProject[]>([])
  const [currentLanguage, setCurrentLanguage] = useState("en")
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNamespace, setSelectedNamespace] = useState("all")
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false)
  const [showEditTranslationDialog, setShowEditTranslationDialog] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data initialization
  useEffect(() => {
    const mockLanguages: Language[] = [
      {
        code: "en",
        name: "English",
        nativeName: "English",
        flag: "🇺🇸",
        isEnabled: true,
        completionPercentage: 100,
        totalKeys: 1250,
        translatedKeys: 1250,
        lastUpdated: "2024-01-28T10:00:00Z",
        contributors: 5,
      },
      {
        code: "es",
        name: "Spanish",
        nativeName: "Español",
        flag: "🇪🇸",
        isEnabled: true,
        completionPercentage: 95,
        totalKeys: 1250,
        translatedKeys: 1188,
        lastUpdated: "2024-01-27T15:30:00Z",
        contributors: 3,
      },
      {
        code: "fr",
        name: "French",
        nativeName: "Français",
        flag: "🇫🇷",
        isEnabled: true,
        completionPercentage: 88,
        totalKeys: 1250,
        translatedKeys: 1100,
        lastUpdated: "2024-01-26T09:15:00Z",
        contributors: 2,
      },
      {
        code: "de",
        name: "German",
        nativeName: "Deutsch",
        flag: "🇩🇪",
        isEnabled: false,
        completionPercentage: 65,
        totalKeys: 1250,
        translatedKeys: 813,
        lastUpdated: "2024-01-25T14:20:00Z",
        contributors: 1,
      },
      {
        code: "ja",
        name: "Japanese",
        nativeName: "日本語",
        flag: "🇯🇵",
        isEnabled: true,
        completionPercentage: 72,
        totalKeys: 1250,
        translatedKeys: 900,
        lastUpdated: "2024-01-24T11:45:00Z",
        contributors: 4,
      },
    ]

    const mockTranslations: Translation[] = [
      {
        key: "common.welcome",
        namespace: "common",
        sourceText: "Welcome to WatchParty",
        translations: {
          en: "Welcome to WatchParty",
          es: "Bienvenido a WatchParty",
          fr: "Bienvenue sur WatchParty",
          de: "Willkommen bei WatchParty",
          ja: "WatchPartyへようこそ",
        },
        context: "Main welcome message displayed on homepage",
        lastModified: "2024-01-28T10:00:00Z",
        status: "translated",
      },
      {
        key: "auth.login.title",
        namespace: "auth",
        sourceText: "Sign in to your account",
        translations: {
          en: "Sign in to your account",
          es: "Inicia sesión en tu cuenta",
          fr: "Connectez-vous à votre compte",
          de: "Melden Sie sich in Ihrem Konto an",
          ja: "アカウントにサインイン",
        },
        context: "Login page title",
        lastModified: "2024-01-27T14:30:00Z",
        status: "translated",
      },
      {
        key: "party.create.button",
        namespace: "party",
        sourceText: "Create Watch Party",
        translations: {
          en: "Create Watch Party",
          es: "Crear Fiesta de Visualización",
          fr: "Créer une Soirée Cinéma",
          de: "",
          ja: "ウォッチパーティを作成",
        },
        context: "Button text for creating a new watch party",
        lastModified: "2024-01-26T16:15:00Z",
        status: "needs_review",
      },
    ]

    const mockProjects: TranslationProject[] = [
      {
        id: "1",
        name: "WatchParty Web App",
        description: "Main web application translations",
        languages: ["en", "es", "fr", "de", "ja"],
        totalKeys: 1250,
        completionRate: 84,
        contributors: 8,
        lastActivity: "2024-01-28T10:00:00Z",
      },
      {
        id: "2",
        name: "Mobile App",
        description: "iOS and Android app translations",
        languages: ["en", "es", "fr"],
        totalKeys: 800,
        completionRate: 92,
        contributors: 5,
        lastActivity: "2024-01-27T15:30:00Z",
      },
    ]

    setLanguages(mockLanguages)
    setTranslations(mockTranslations)
    setProjects(mockProjects)
  }, [])

  // Translation function
  const t = (key: string, params?: Record<string, any>) => {
    const translation = translations.find((t) => t.key === key)
    if (!translation) return key

    let text = translation.translations[currentLanguage] || translation.sourceText

    // Simple parameter replacement
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{{${param}}}`, String(value))
      })
    }

    return text
  }

  const handleAddLanguage = async (formData: FormData) => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newLanguage: Language = {
        code: formData.get("code") as string,
        name: formData.get("name") as string,
        nativeName: formData.get("nativeName") as string,
        flag: formData.get("flag") as string,
        isEnabled: false,
        completionPercentage: 0,
        totalKeys: translations.length,
        translatedKeys: 0,
        lastUpdated: new Date().toISOString(),
        contributors: 0,
      }

      setLanguages((prev) => [...prev, newLanguage])
      setShowAddLanguageDialog(false)

      toast({
        title: "Language Added",
        description: `${newLanguage.name} has been added to the project.`,
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to add language.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTranslation = async (translationKey: string, languageCode: string, newText: string) => {
    try {
      setTranslations((prev) =>
        prev.map((translation) =>
          translation.key === translationKey
            ? {
                ...translation,
                translations: {
                  ...translation.translations,
                  [languageCode]: newText,
                },
                lastModified: new Date().toISOString(),
                status: "translated" as const,
              }
            : translation,
        ),
      )

      // Update language completion stats
      setLanguages((prev) =>
        prev.map((lang) => {
          if (lang.code === languageCode) {
            const translatedCount =
              translations.filter((t) => t.translations[languageCode] && t.translations[languageCode].trim() !== &quot;&quot;)
                .length + 1
            return {
              ...lang,
              translatedKeys: translatedCount,
              completionPercentage: Math.round((translatedCount / lang.totalKeys) * 100),
              lastUpdated: new Date().toISOString(),
            }
          }
          return lang
        }),
      )

      toast({
        title: "Translation Updated",
        description: "The translation has been saved successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update translation.",
        variant: "destructive",
      })
    }
  }

  const handleToggleLanguage = async (languageCode: string) => {
    try {
      setLanguages((prev) =>
        prev.map((lang) => (lang.code === languageCode ? { ...lang, isEnabled: !lang.isEnabled } : lang)),
      )

      toast({
        title: "Language Updated",
        description: "Language status has been updated.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Failed to update language status.",
        variant: "destructive",
      })
    }
  }

  const exportTranslations = (languageCode: string) => {
    const languageTranslations = translations.reduce(
      (acc, translation) => {
        if (translation.translations[languageCode]) {
          acc[translation.key] = translation.translations[languageCode]
        }
        return acc
      },
      {} as Record<string, string>,
    )

    const jsonContent = JSON.stringify(languageTranslations, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `translations-${languageCode}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: `Translations for ${languageCode} have been exported.`,
    })
  }

  const filteredTranslations = translations.filter((translation) => {
    const matchesSearch =
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.sourceText.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNamespace = selectedNamespace === "all" || translation.namespace === selectedNamespace
    return matchesSearch && matchesNamespace
  })

  const namespaces = Array.from(new Set(translations.map((t) => t.namespace)))

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t, languages }}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Globe className="h-8 w-8" />
              Multi-Language System
            </h1>
            <p className="text-muted-foreground">Manage translations and localization</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="translations">Translations</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
                  <Languages className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{languages.length}</div>
                  <p className="text-xs text-muted-foreground">{languages.filter((l) => l.isEnabled).length} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Translation Keys</CardTitle>
                  <BarChart3 className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{translations.length}</div>
                  <p className="text-xs text-muted-foreground">across all namespaces</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(languages.reduce((acc, lang) => acc + lang.completionPercentage, 0) / languages.length)}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                  <Users className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {languages.reduce((acc, lang) => acc + lang.contributors, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">total contributors</p>
                </CardContent>
              </Card>
            </div>

            {/* Language Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Language Progress</CardTitle>
                <CardDescription>Translation completion status by language</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {languages.map((language) => (
                  <div key={language.code} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{language.flag}</span>
                        <span className="font-medium">{language.name}</span>
                        <Badge variant={language.isEnabled ? "default" : "secondary"}>
                          {language.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{language.completionPercentage}%</span>
                        <p className="text-xs text-muted-foreground">
                          {language.translatedKeys}/{language.totalKeys} keys
                        </p>
                      </div>
                    </div>
                    <Progress value={language.completionPercentage} className="w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Languages Tab */}
          <TabsContent value="languages" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Supported Languages</h2>
                <p className="text-muted-foreground">Manage available languages and their settings</p>
              </div>

              <Dialog open={showAddLanguageDialog} onOpenChange={setShowAddLanguageDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Language
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Language</DialogTitle>
                    <DialogDescription>Add a new language to the translation project</DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      const formData = new FormData(e.currentTarget)
                      handleAddLanguage(formData)
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label htmlFor="code">Language Code</Label>
                      <Input id="code" name="code" placeholder="en" required />
                    </div>

                    <div>
                      <Label htmlFor="name">English Name</Label>
                      <Input id="name" name="name" placeholder="English" required />
                    </div>

                    <div>
                      <Label htmlFor="nativeName">Native Name</Label>
                      <Input id="nativeName" name="nativeName" placeholder="English" required />
                    </div>

                    <div>
                      <Label htmlFor="flag">Flag Emoji</Label>
                      <Input id="flag" name="flag" placeholder="🇺🇸" required />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddLanguageDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Language"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {languages.map((language) => (
                <Card key={language.code}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{language.flag}</span>
                        <div>
                          <CardTitle className="text-lg">{language.name}</CardTitle>
                          <CardDescription>{language.nativeName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={language.isEnabled ? "default" : "secondary"}>
                        {language.isEnabled ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm font-bold">{language.completionPercentage}%</span>
                      </div>
                      <Progress value={language.completionPercentage} className="w-full" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {language.translatedKeys} of {language.totalKeys} keys translated
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Contributors</p>
                        <p className="font-medium">{language.contributors}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Updated</p>
                        <p className="font-medium">{new Date(language.lastUpdated).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleToggleLanguage(language.code)}
                      >
                        {language.isEnabled ? "Disable" : "Enable"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportTranslations(language.code)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Translation Management</h2>
                <p className="text-muted-foreground">Edit and manage translation keys</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search translations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Namespaces</SelectItem>
                  {namespaces.map((namespace) => (
                    <SelectItem key={namespace} value={namespace}>
                      {namespace}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Translation List */}
            <div className="space-y-4">
              {filteredTranslations.map((translation) => (
                <Card key={translation.key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{translation.key}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mr-2">
                            {translation.namespace}
                          </Badge>
                          {translation.context}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            translation.status === "translated"
                              ? "default"
                              : translation.status === "needs_review"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {translation.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTranslation(translation)
                            setShowEditTranslationDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium">Source (English)</Label>
                        <p className="text-sm bg-muted p-2 rounded">{translation.sourceText}</p>
                      </div>

                      <div className="grid gap-3">
                        {languages
                          .filter((lang) => lang.code !== &quot;en&quot;)
                          .map((language) => (
                            <div key={language.code}>
                              <Label className="text-sm font-medium flex items-center gap-2">
                                {language.flag} {language.name}
                                {!translation.translations[language.code] && (
                                  <AlertCircle className="h-3 w-3 text-yellow-500" />
                                )}
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  value={translation.translations[language.code] || ""}
                                  onChange={(e) => {
                                    const newTranslations = { ...translation.translations }
                                    newTranslations[language.code] = e.target.value
                                    setTranslations((prev) =>
                                      prev.map((t) =>
                                        t.key === translation.key ? { ...t, translations: newTranslations } : t,
                                      ),
                                    )
                                  }}
                                  placeholder={`Enter ${language.name} translation...`}
                                  className="flex-1"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateTranslation(
                                      translation.key,
                                      language.code,
                                      translation.translations[language.code] || "",
                                    )
                                  }
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Translation Projects</h2>
                <p className="text-muted-foreground">Manage translation projects and workflows</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge>{project.completionRate}% Complete</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Progress</span>
                        <span className="text-sm font-bold">{project.completionRate}%</span>
                      </div>
                      <Progress value={project.completionRate} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Languages</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {project.languages.slice(0, 3).map((langCode) => {
                            const lang = languages.find((l) => l.code === langCode)
                            return lang ? (
                              <span key={langCode} className="text-xs">
                                {lang.flag}
                              </span>
                            ) : null
                          })}
                          {project.languages.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{project.languages.length - 3}</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Total Keys</p>
                        <p className="font-medium">{project.totalKeys}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Contributors</p>
                        <p className="font-medium">{project.contributors}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-medium">{new Date(project.lastActivity).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Translation Dialog */}
        <Dialog open={showEditTranslationDialog} onOpenChange={setShowEditTranslationDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Translation</DialogTitle>
              <DialogDescription>Update translations for: {editingTranslation?.key}</DialogDescription>
            </DialogHeader>

            {editingTranslation && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Source Text (English)</Label>
                  <Textarea value={editingTranslation.sourceText} readOnly className="bg-muted" />
                </div>

                <div className="space-y-3">
                  {languages
                    .filter((lang) => lang.code !== &quot;en&quot;)
                    .map((language) => (
                      <div key={language.code}>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          {language.flag} {language.name}
                        </Label>
                        <Textarea
                          value={editingTranslation.translations[language.code] || ""}
                          onChange={(e) => {
                            const newTranslations = { ...editingTranslation.translations }
                            newTranslations[language.code] = e.target.value
                            setEditingTranslation({
                              ...editingTranslation,
                              translations: newTranslations,
                            })
                          }}
                          placeholder={`Enter ${language.name} translation...`}
                        />
                      </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditTranslationDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      // Update all translations at once
                      Object.entries(editingTranslation.translations).forEach(([langCode, text]) => {
                        if (langCode !== "en" && text.trim()) {
                          handleUpdateTranslation(editingTranslation.key, langCode, text)
                        }
                      })
                      setShowEditTranslationDialog(false)
                    }}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save All
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LanguageContext.Provider>
  )
}
