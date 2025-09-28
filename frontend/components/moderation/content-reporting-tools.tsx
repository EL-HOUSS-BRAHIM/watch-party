import { Check, File, Flag, Video, X } from "lucide-react"
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/hooks/use-toast'

"use client"

  ExclamationTriangleIcon, 
  FlagIcon, 
  XMarkIcon,
  CheckIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon;
} from '@heroicons/react/24/outline'

interface ReportReason {}
  id: string;
  label: string;
  description: string;
  category: 'content' | 'behavior' | 'safety' | 'spam'
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface ContentReportingProps {}
  contentType: 'video' | 'comment' | 'party' | 'user' | 'message'
  contentId: string;
  contentTitle?: string;
  contentAuthor?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (report: ReportData) => void;
}

interface ReportData {}
  contentId: string;
  contentType: string;
  reasonId: string;
  description: string;
  evidence: File[]
  anonymous: boolean;
  blockUser: boolean;
}

const reportReasons: ReportReason[] = []
  {}
    id: 'spam',
    label: 'Spam or Unwanted Content',
    description: 'Repetitive, promotional, or irrelevant content',
    category: 'spam',
    severity: 'low'
  },
  {}
    id: 'harassment',
    label: 'Harassment or Bullying',
    description: 'Targeted harassment, threats, or bullying behavior',
    category: 'behavior',
    severity: 'high'
  },
  {}
    id: 'hate_speech',
    label: 'Hate Speech',
    description: 'Content that promotes hatred against individuals or groups',
    category: 'behavior',
    severity: 'critical'
  },
  {}
    id: 'violence',
    label: 'Violence or Dangerous Content',
    description: 'Content depicting or promoting violence or dangerous activities',
    category: 'safety',
    severity: 'critical'
  },
  {}
    id: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Adult content, graphic material, or unsuitable content',
    category: 'content',
    severity: 'medium'
  },
  {}
    id: 'copyright',
    label: 'Copyright Infringement',
    description: 'Unauthorized use of copyrighted material',
    category: 'content',
    severity: 'medium'
  },
  {}
    id: 'misinformation',
    label: 'False Information',
    description: 'Deliberately false or misleading information',
    category: 'content',
    severity: 'high'
  },
  {}
    id: 'privacy',
    label: 'Privacy Violation',
    description: 'Sharing personal information without consent',
    category: 'safety',
    severity: 'high'
  },
  {}
    id: 'impersonation',
    label: 'Impersonation',
    description: 'Pretending to be someone else or creating fake accounts',
    category: 'behavior',
    severity: 'medium'
  },
  {}
    id: 'other',
    label: 'Other',
    description: 'Report doesn\'t fit other categories',
    category: 'content',
    severity: 'low'
  }
]

const severityColors = { low: 'bg-yellow-500/20 text-yellow-400',
  medium: 'bg-orange-500/20 text-orange-400',
  high: 'bg-red-500/20 text-red-400',
  critical: 'bg-red-600/20 text-red-300'
}

const categoryIcons = { content: DocumentTextIcon,
  behavior: ExclamationTriangleIcon,
  safety: ExclamationTriangleIcon,
  spam: FlagIcon;
}

export default function ContentReportingTools({contentType,
  contentId,
  contentTitle,
  contentAuthor,
  isOpen,
  onClose,
  onSubmit;
}: ContentReportingProps) {}
  const [selectedReason, setSelectedReason] = useState<string>(&apos;')
  const [description, setDescription] = useState('')
  const [evidence, setEvidence] = useState<File[]>([])
  const [anonymous, setAnonymous] = useState(false)
  const [blockUser, setBlockUser] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState<'reason' | 'details' | 'confirmation'>(&apos;reason')

  if (!isOpen) return null;
  const selectedReasonData = reportReasons.find(r => r.id === selectedReason)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {}
    const files = Array.from(event.target.files || [])
    setEvidence(prev => [...prev, ...files].slice(0, 5)) // Max 5 files;
  }

  const removeFile = (index: number) => {}
    setEvidence(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {}
    if (!selectedReason) return;
    setSubmitting(true)
    try {}
      const reportData: ReportData = { contentId,
        contentType,
        reasonId: selectedReason,
        description,
        evidence,
        anonymous,
        blockUser;
      }

      // Mock API call - replace with actual implementation;
      await new Promise(resolve => setTimeout(resolve, 2000))

      toast({title: 'Report Submitted',
        description: 'Thank you for your report. Our moderation team will review it shortly.',
      })

      if (onSubmit) {}
        onSubmit(reportData)
      }

      onClose()
      resetForm()
    } catch {}
      toast({title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive'
      })
    } finally {}
      setSubmitting(false)
    }
  }

  const resetForm = () => {}
    setSelectedReason('')
    setDescription('')
    setEvidence([])
    setAnonymous(false)
    setBlockUser(false)
    setStep('reason')
  }

  const renderStepContent = () => {}
    switch (step) {}
      case 'reason':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Why are you reporting this content?</h3>
              <p className="text-white/70 text-sm mb-4">
                Select the reason that best describes the issue with this content.
              </p>
            </div>

            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {reportReasons.map((reason) => {}
                  const IconComponent = categoryIcons[reason.category]
                  return (
                    <div key={reason.id} className="flex items-start space-x-3">
                      <RadioGroupItem;
                        value={reason.id} 
                        id={reason.id}
                        className="mt-1"
                      />
                      <Label htmlFor={reason.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4" />
                          <span className="font-medium">{reason.label}</span>
                          <Badge className={`text-xs ${severityColors[reason.severity]}`}>
                            {reason.severity}
                          </Badge>
                        </div>
                        <p className="text-white/60 text-sm">{reason.description}</p>
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel;
              </Button>
              <Button;
                onClick={() => setStep(&apos;details')}
                disabled={!selectedReason}
              >
                Next;
              </Button>
            </div>
          </div>
        )

      case 'details':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
              <p className="text-white/70 text-sm mb-4">
                Provide more information to help our moderation team understand the issue.
              </p>
            </div>

            {selectedReasonData && (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FlagIcon className="w-4 h-4" />
                    <span className="font-medium">{selectedReasonData.label}</span>
                    <Badge className={`text-xs ${severityColors[selectedReasonData.severity]}`}>
                      {selectedReasonData.severity}
                    </Badge>
                  </div>
                  <p className="text-white/70 text-sm">{selectedReasonData.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </Label>
              <Textarea;
                id="description"
                placeholder="Provide additional context or details about this report..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 bg-white/5 border-white/20 text-white"
                rows={4}
              />
            </div>

            {/* Evidence Upload */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Evidence (Optional)
              </Label>
              <p className="text-white/60 text-xs mb-2">
                Upload screenshots or other evidence to support your report (max 5 files)
              </p>
              <input;
                type="file"
                multiple;
                accept="image/*,video/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <Label;
                htmlFor="evidence-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors"
              >
                <PhotoIcon className="w-4 h-4" />
                Upload Files;
              </Label>

              {evidence.length > 0 && (
                <div className="mt-3 space-y-2">
                  {evidence.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded">
                      <div className="flex items-center gap-2">
                        {file.type.startsWith('image/') ? (
                          <PhotoIcon className="w-4 h-4" />
                        ) : file.type.startsWith('video/') ? (
                          <VideoCameraIcon className="w-4 h-4" />
                        ) : (
                          <DocumentTextIcon className="w-4 h-4" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <Button;
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox;
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={(checked) => setAnonymous(checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Submit anonymously;
                </Label>
              </div>

              {contentType === 'user' || contentType === 'comment' || contentType === 'message' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox;
                    id="block-user"
                    checked={blockUser}
                    onCheckedChange={(checked) => setBlockUser(checked as boolean)}
                  />
                  <Label htmlFor="block-user" className="text-sm">
                    Block this user;
                  </Label>
                </div>
              ) : null}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(&apos;reason')}>
                Back;
              </Button>
              <Button onClick={() => setStep(&apos;confirmation')}>
                Review Report;
              </Button>
            </div>
          </div>
        )

      case 'confirmation':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Review Your Report</h3>
              <p className="text-white/70 text-sm mb-4">
                Please review your report before submitting.
              </p>
            </div>

            {/* Content Info */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Content Type:</span>
                    <span className="capitalize">{contentType}</span>
                  </div>
                  {contentTitle && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Title:</span>
                      <span className="truncate max-w-48">{contentTitle}</span>
                    </div>
                  )}
                  {contentAuthor && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Author:</span>
                      <span>{contentAuthor}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Report Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-white/70 text-sm">Reason:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{selectedReasonData?.label}</span>
                      <Badge className={`text-xs ${severityColors[selectedReasonData?.severity || 'low']}`}>
                        {selectedReasonData?.severity}
                      </Badge>
                    </div>
                  </div>
                  {description && (
                    <div>
                      <span className="text-white/70 text-sm">Description:</span>
                      <p className="text-sm mt-1">{description}</p>
                    </div>
                  )}
                  {evidence.length > 0 && (
                    <div>
                      <span className="text-white/70 text-sm">Evidence:</span>
                      <p className="text-sm mt-1">{evidence.length} file(s) attached</p>
                    </div>
                  )}
                  <div className="flex gap-4 text-sm">
                    {anonymous && (
                      <span className="text-blue-400">Anonymous Report</span>
                    )}
                    {blockUser && (
                      <span className="text-red-400">Will Block User</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep(&apos;details')}>
                Back;
              </Button>
              <Button;
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        )

      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-black/90 border-white/20 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlagIcon className="w-5 h-5 text-red-400" />
              <CardTitle>Report Content</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </div>
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {['reason', 'details', 'confirmation'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${}}
                  step === stepName;
                    ? 'bg-red-500 text-white' 
                    : index < ['reason', 'details', 'confirmation'].indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white/60'
                }`}>
                  {index < ['reason', 'details', 'confirmation'].indexOf(step) ? (}
                    <CheckIcon className="w-3 h-3" />
                  ) : (
                    index + 1;
                  )}
                </div>
                {index < 2 && (}
                  <div className={`w-8 h-0.5 mx-2 ${}}
                    index < ['reason', 'details', 'confirmation'].indexOf(step)
                      ? 'bg-green-500'
                      : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6 overflow-y-auto">
          {renderStepContent()}
        </CardContent>
      </Card>
    </div>
  )
}
