"use client"

import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface Step {
  id: string
  title: string
  description?: string
  content: ReactNode
  isValid?: boolean
}

interface MultiStepFormProps {
  steps: Step[]
  onComplete: () => void
  onStepChange?: (stepIndex: number) => void
  className?: string
}

export function MultiStepForm({ steps, onComplete, onStepChange, className }: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const progress = ((currentStep + 1) / steps.length) * 100

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      goToStep(currentStep + 1)
    } else {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      onComplete()
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }

  const isCurrentStepValid = steps[currentStep]?.isValid !== false
  const isLastStep = currentStep === steps.length - 1

  return (
    <div className={className}>
      <Card className="card">
        <CardHeader>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neo-text-secondary">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-neo-text-secondary">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index === currentStep
                        ? "bg-primary text-white"
                        : completedSteps.has(index)
                          ? "bg-success text-white"
                          : index < currentStep
                            ? "bg-neo-surface-elevated text-neo-text-primary hover:bg-neo-border"
                            : "bg-neo-surface text-neo-text-tertiary"
                    }`}
                    disabled={index > currentStep && !completedSteps.has(index)}
                  >
                    {completedSteps.has(index) ? <Check className="w-4 h-4" /> : index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Step Info */}
            <div>
              <CardTitle className="text-xl font-semibold text-neo-text-primary">{steps[currentStep]?.title}</CardTitle>
              {steps[currentStep]?.description && (
                <p className="text-neo-text-secondary mt-1">{steps[currentStep].description}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Step Content */}
          <div className="min-h-[300px] mb-6">{steps[currentStep]?.content}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={goBack} disabled={currentStep === 0}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button onClick={goNext} disabled={!isCurrentStepValid} className="btn-primary">
              {isLastStep ? "Complete" : "Next"}
              {!isLastStep && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
