import { SallyTarget } from "@supportsally/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { prismadb } from "@/lib/prisma";

import { Input } from "@/components/ui/input";
import CopyKeyComponent from "./copy-key";
import { setResendKey } from "@/actions/admin/system/set-resend-key";

const ResendCard = async () => {
  const resend_key = await prismadb.systemServices.findFirst({
    where: {
      name: "resend_smtp",
    },
  });

  return (
    <Card className="min-w-[350px] max-w-[450px]">
      <CardHeader className="text-lg">
        <CardTitle>Resend.com - API Key</CardTitle>
        <CardDescription className="text-xs">
          <p>ENV API key:</p>
          <p>
            {process.env.RESEND_API_KEY ? (
              <CopyKeyComponent
                keyValue={process.env.RESEND_API_KEY}
                message="Resend - API Key"
              />
            ) : (
              "not enabled"
            )}
          </p>
          <p>API key from DB:</p>
          <p>
            {resend_key?.serviceKey ? (
              <CopyKeyComponent
                keyValue={resend_key?.serviceKey}
                message="Resend - API Key"
              />
            ) : (
              "not enabled"
            )}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <form action={setResendKey}>
          <div>
            <input type="hidden" name="id" value={resend_key?.id} />
            <SallyTarget id="servicekey" label="serviceKey" completeWhen="servicekeyFilled">
              <Input type="text" name="serviceKey" placeholder="Your API key" />
            </SallyTarget>
          </div>
          <div className="flex justify-end pt-2 gap-2">
            <SallyTarget id="reset" label="Reset">
              <Button type={"reset"}>Reset</Button>
            </SallyTarget>
            <SallyTarget id="set-resend-key" label="Set Resend key">
              <Button type="submit">Set Resend key</Button>
            </SallyTarget>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResendCard;
