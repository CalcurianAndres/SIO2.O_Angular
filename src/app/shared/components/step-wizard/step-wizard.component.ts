import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-step-wizard',
  standalone: false,
  templateUrl: './step-wizard.component.html',
  styleUrls: ['./step-wizard.component.scss'],
})
export class StepWizardComponent {
  @Input() steps: { num: number; label: string; icon: string }[] = [];
  @Input() currentStep = 1;
  @Output() currentStepChange = new EventEmitter<number>();
  @Output() stepChange = new EventEmitter<{ from: number; to: number }>();

  get totalSteps(): number {
    return this.steps.length;
  }

  get progressPercentage(): number {
    return this.totalSteps > 1
      ? Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 100)
      : 100;
  }

  goToStep(n: number): void {
    if (n >= 1 && n <= this.totalSteps && n < this.currentStep) {
      const from = this.currentStep;
      this.currentStep = n;
      this.currentStepChange.emit(this.currentStep);
      this.stepChange.emit({ from, to: this.currentStep });
    }
  }

  next(): void {
    if (this.currentStep < this.totalSteps) {
      const from = this.currentStep;
      this.currentStep++;
      this.currentStepChange.emit(this.currentStep);
      this.stepChange.emit({ from, to: this.currentStep });
    }
  }

  prev(): void {
    if (this.currentStep > 1) {
      const from = this.currentStep;
      this.currentStep--;
      this.currentStepChange.emit(this.currentStep);
      this.stepChange.emit({ from, to: this.currentStep });
    }
  }
}
