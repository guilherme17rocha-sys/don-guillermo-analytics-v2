import Image from 'next/image'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-don-guillermo.png"
            alt="Don Guillermo"
            height={80}
            width={240}
            style={{ height: 80, width: 'auto' }}
            priority
          />
        </div>
        {children}
      </div>
    </div>
  )
}
