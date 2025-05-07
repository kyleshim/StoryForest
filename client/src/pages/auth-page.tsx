import { SignIn } from "@clerk/clerk-react";

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn redirectUrl="/" />
    </div>
  );
}