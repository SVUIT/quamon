import { ClientOnly } from './client'
import { Metadata } from 'next'

export function generateStaticParams() {
  return [{ slug: [''] }]
}

export const metadata: Metadata = {
  title: 'Quamon - Grade Calculator',
  description: 'A comprehensive grade calculator for students. Track grades across semesters, calculate weighted averages, import grades from PDF files, and calculate what scores you need to achieve your desired GPA.',
  keywords: ['grade calculator', 'GPA calculator', 'student grades', 'academic tracking', 'semester grades', 'weighted average', 'PDF import'],
  openGraph: {
    title: 'Quamon - Grade Calculator',
    description: 'A comprehensive grade calculator for students. Track grades, calculate weighted averages, and achieve your academic goals.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'Quamon - Grade Calculator',
    description: 'A comprehensive grade calculator for students. Track grades, calculate weighted averages, and achieve your academic goals.',
  },
}

export default function Page() {
  return (
    <main role="main" aria-label="Grade Calculator Application" className="app-container">
      <ClientOnly />
    </main>
  )
}