"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { verifyInvite, clearOnboardingError } from "@/store/actions/onboardingActions";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, invitations } = useAppSelector((state) => state.onboarding);
  const token = searchParams.get("token");

  const [inviteData, setInviteData] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      dispatch(clearOnboardingError());
    }
  }, [token, dispatch]);

  useEffect(() => {
    // Find the verified invite data from Redux state
    if (invitations.length > 0 && inviteData) {
      // Data is already set from the action result
    }
  }, [invitations, inviteData]);

  const handleAcceptInvite = async () => {
    console.log("🔑 Token from URL:", token);
    if (!token) return;

    const result = await dispatch(verifyInvite(token));

    if (verifyInvite.fulfilled.match(result)) {
      setInviteData(result.payload);
      // Auto redirect after successful verification
      setTimeout(() => {
        router.push("/accept/set-password");
      }, 1500);
    }
  };

  const handleContinue = () => {
    router.push("/accept/set-password");
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invalid Invite Link
          </h1>
          <p className="text-gray-500 mb-6">
            This invitation link is invalid or has expired.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (inviteData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Invitation Verified!
          </h1>
          <p className="text-gray-500 mb-4">
            Your invitation has been verified successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Name:</span>{" "}
              {inviteData.firstName} {inviteData.lastName}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Email:</span> {inviteData.email}
            </p>
            {inviteData.department && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Department:</span>{" "}
                {inviteData.department.name}
              </p>
            )}
            {inviteData.designation && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Designation:</span>{" "}
                {inviteData.designation.name}
              </p>
            )}
          </div>
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all"
          >
            Continue to Set Password
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#0445AD]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-[#0445AD]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <Image
          src="/logo.png"
          alt="Logo"
          width={150}
          height={32}
          className="mx-auto mb-4"
        />

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          You've Been Invited!
        </h1>
        <p className="text-gray-500 mb-6">
          Click the button below to accept your invitation and join the team.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleAcceptInvite}
          disabled={loading}
          className="w-full px-6 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033699] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Verifying...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Accept Invitation
            </>
          )}
        </button>

        <p className="mt-4 text-xs text-gray-400">
          By accepting, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function AcceptPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]"></div>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
