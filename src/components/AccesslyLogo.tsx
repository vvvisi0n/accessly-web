// src/components/AccesslyLogo.tsx
import Image from "next/image";
import Link from "next/link";

export default function AccesslyLogo() {
  return (
    <Link href="/">
      <div className="flex items-center space-x-2">
        <Image
          src="/assets/logo/logo-light.png"
          alt="Accessly Logo Light"
          width={32}
          height={32}
          className="block dark:hidden"
        />
        <Image
          src="/assets/logo/logo-dark.png"
          alt="Accessly Logo Dark"
          width={32}
          height={32}
          className="hidden dark:block"
        />
        <span className="font-bold text-xl">Accessly</span>
      </div>
    </Link>
  );
}
