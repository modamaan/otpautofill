import { useEffect, useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./components/ui/input-otp";
import { Label } from "./components/ui/label";

export interface OTPCredential {
  code: string;
}

import "./App.css";

export const autofillOtp = (
  onSuccess: (otp: string) => void,
  onError: (message: string) => void
) => {
  if (navigator.credentials && "OTPCredential" in window) {
    onError("OTPCredential API is available."); // Display message
    navigator.credentials
      .get({ otp: { transport: ["sms"] } } as CredentialRequestOptions)
      .then((otpCredential) => {
        if (!otpCredential) {
          onError("No OTP received.");
          return;
        }

        const otp = otpCredential as unknown as OTPCredential;

        if (otp.code) {
          onError(`Your OTP is: ${otp.code}`);
          onSuccess(otp.code);
        } else {
          onError("Received OTP is invalid.");
        }
      })
      .catch((error) => {
        onError("OTP retrieval failed.");
        console.error("OTP retrieval error:", error);
      });
  } else {
    onError("OTPCredential API is not available.");
  }
};

function App() {
  const [otp, setOtp] = useState("");
  const [isOtpCorrect, setIsOtpCorrect] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // New state for messages
  const REGEXP_ONLY_DIGITS = /^[0-9]*$/;
  const CORRECT_OTP = "45612";

  useEffect(() => {
    autofillOtp(setOtp, setStatusMessage);
  }, []);

  const handleOtpChange = (value: string) => {
    setOtp(value);
    if (value === CORRECT_OTP) {
      setIsOtpCorrect(true);
    }
  };

  return (
    <div className="space-y-2">
      {statusMessage && ( // Display status messages
        <p className="text-sm text-blue-500 text-center">{statusMessage}</p>
      )}
      {isOtpCorrect ? (
        <>
          <div>
            <p className="text-lg text-blue-600 text-center">
              Congrats! Your OTP is: {otp}
            </p>
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
        </>
      )}
    </div>
  );
}

export default App;
