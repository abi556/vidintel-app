import Image from "next/image";

export function Logo() {
  return (
    <div className="relative shrink-0">
      {/* Desktop: wide wordmark — hidden below md */}
      <Image
        src="/logo4light.png"
        alt="Vidintel"
        width={160}
        height={40}
        className="hidden md:block dark:hidden! h-auto"
        priority
      />
      <Image
        src="/logo4dark.png"
        alt="Vidintel"
        width={160}
        height={40}
        className="hidden dark:md:block! h-auto"
        priority
      />

      {/* Mobile/Tablet: square icon — visible below md */}
      <Image
        src="/logo4lightS.png"
        alt="Vidintel"
        width={36}
        height={36}
        className="block md:hidden dark:hidden! rounded-lg h-auto"
        priority
      />
      <Image
        src="/logo4darkS.png"
        alt="Vidintel"
        width={36}
        height={36}
        className="hidden dark:block! dark:md:hidden! rounded-lg h-auto"
        priority
      />
    </div>
  );
}
