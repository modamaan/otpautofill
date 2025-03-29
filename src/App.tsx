import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Label } from "./components/ui/label";
import { toast } from "sonner";

export interface OTPCredential {
  code: string;
}

import "./App.css";

export const autofillOtp = (
  onSuccess: (otp: string) => void,
  onError: () => void
) => {
  if (navigator.credentials && "OTPCredential" in window) {
    toast.success("OTPCredential API is available.");
    navigator.credentials
      .get({ otp: { transport: ["sms"] } } as CredentialRequestOptions)
      .then((otpCredential) => {
        if (!otpCredential) {
          toast.error("No OTP received.");
          onError();
          return;
        }

        const otp = otpCredential as unknown as OTPCredential;

        if (otp.code) {
          toast.success(`Your OTP is: ${otp.code}`);
          onSuccess(otp.code);
        } else {
          toast.error("Received OTP is invalid.");
          onError();
        }
      })
      .catch((error) => {
        toast.error("OTP retrieval failed.");
        console.error("OTP retrieval error:", error);
        onError();
      });
  } else {
    toast.error("OTPCredential API is not available.");
  }
};

function App() {
  const [otp, setOtp] = useState("");
  const [otpValidationError, setOtpValidationError] = useState("");
  const [isOtpCorrect, setIsOtpCorrect] = useState(false); // New state
  const REGEXP_ONLY_DIGITS = /^[0-9]*$/;
  const CORRECT_OTP = "45612";

  useEffect(() => {
    autofillOtp(setOtp, () => setOtpValidationError("Failed to retrieve OTP."));
  }, []);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    setOtpValidationError("");
    if (value === CORRECT_OTP) {
      setIsOtpCorrect(true); // Set OTP as correct
    }
  };

  return (
    <div className="space-y-2">
      {isOtpCorrect ? ( // Show congrats message if OTP is correct
        <>
          {toast.success("Congrats")}
          <div>
            <p className="text-lg text-blue-600 text-center">Congrats!</p>
          </div>
        </>
      ) : (
        <>
          <Label htmlFor="otp" className="mb-4">
            Enter OTP
          </Label>
          <div className="flex justify-center">
            <InputOTP
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              maxLength={5}
              pattern={REGEXP_ONLY_DIGITS.source}
              autoComplete="one-time-code"
              autoFocus
              onChange={handleOtpChange}
            >
              <InputOTPGroup>
                {[...Array(5)].map((_, index) => (
                  <InputOTPSlot key={index} index={index} className="size-10" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
          {otpValidationError && (
            <p className="text-sm text-red-500 text-center">
              {otpValidationError}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default App;
