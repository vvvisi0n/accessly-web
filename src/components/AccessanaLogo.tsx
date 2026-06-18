// src/components/AccessanaLogo.tsx
import Image from "next/image";
import Link from "next/link";

export default function AccessanaLogo() {
  return (
    <Link href="/">
      <div className="flex items-center space-x-2">
        <Image
          src="/assets/logo/logo-light.png"
          alt="Accessana Logo Light"
          width={32}
          height={32}
          className="block dark:hidden"
        />
        <Image
          src="/assets/logo/logo-dark.png"
          alt="Accessana Logo Dark"
          width={32}
          height={32}
          className="hidden dark:block"
        />
        <span className="font-bold text-xl">Accessana</span>
      </div>
    </Link>
  );
}
