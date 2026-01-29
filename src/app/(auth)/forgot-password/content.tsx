"use client";

import { useState } from "react";
import { Stepper, Title } from "@mantine/core";

import StepOne from "./step-one";
import StepTwo from "./step-two";
import StepThree from "./step-three";
import StepCompleted from "./step-completed";

export default function Content() {
  const [activeStep, setActiveStep] = useState(0);

  const [email, setEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string | null>(null);

  const nextStep = () =>
    setActiveStep((current) => (current < 3 ? current + 1 : current));
  // const prevStep = () =>
  //   setActiveStep((current) => (current > 0 ? current - 1 : current));
  const resetSteps = () => setActiveStep(0);

  return (
    <>
      <Title mb="xl" ta="center">
        Forgot your password?
      </Title>

      <Stepper
        active={activeStep}
        onStepClick={setActiveStep}
        allowNextStepsSelect={false}
      >
        <Stepper.Step
          label="Enter your email"
          description="We will send you a verification code"
        >
          <StepOne setEmail={setEmail} nextStep={nextStep} />
        </Stepper.Step>

        <Stepper.Step
          label="Enter verification code"
          description="We sent you a code"
        >
          <StepTwo
            email={email}
            setVerificationCode={setVerificationCode}
            nextStep={nextStep}
            resetStep={resetSteps}
          />
        </Stepper.Step>

        <Stepper.Step
          label="Set new password"
          description="Choose a new password"
        >
          <StepThree
            email={email}
            verificationCode={verificationCode}
            nextStep={nextStep}
            resetStep={resetSteps}
          />
        </Stepper.Step>

        <Stepper.Completed>
          <StepCompleted />
        </Stepper.Completed>
      </Stepper>
    </>
  );
}
