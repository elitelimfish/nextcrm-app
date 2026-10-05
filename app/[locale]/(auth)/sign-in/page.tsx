import { isGoogleOAuthConfigured, isPasswordLoginEnabled } from "@/lib/auth";
import { LoginComponent } from "./components/LoginComponent";

export const dynamic = "force-dynamic";

const SignInPage = async () => {
  const passwordLogin = isPasswordLoginEnabled();

  return (
    <div className="h-full">
      <div className="py-10">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to {process.env.NEXT_PUBLIC_APP_NAME}
        </h1>
      </div>
      <div>
        <LoginComponent
          googleLogin={!passwordLogin && isGoogleOAuthConfigured()}
          passwordLogin={passwordLogin}
          demoEmail={
            process.env.NEXT_PUBLIC_TEST_USER_EMAIL ||
            process.env.TEST_USER_EMAIL ||
            "test@nextcrm.app"
          }
          demoPassword={
            process.env.NEXT_PUBLIC_TEST_USER_PASSWORD ||
            process.env.TEST_USER_PASSWORD ||
            "sally-local"
          }
        />
      </div>
    </div>
  );
};

export default SignInPage;
