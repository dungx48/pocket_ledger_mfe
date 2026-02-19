import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { CategoriesProvider } from './categories-provider'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quản Lý Chi Tiêu',
  description: 'Ứng dụng quản lý chi tiêu cá nhân đơn giản và hiệu quả',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <CategoriesProvider>
          {children}
        </CategoriesProvider>
      </body>
    </html>
  )
}
