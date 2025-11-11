import Header from '@/components/Header'
import Navigation from '@/components/Navigation'
import HeroSection from '@/components/HeroSection'
import DepartmentsSection from '@/components/DepartmentsSection'
import PricingTable from '@/components/PricingTable'
import CTAButtons from '@/components/CTAButtons'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Header />
      <Navigation />
      <HeroSection />
      <DepartmentsSection />
      <PricingTable />
      <CTAButtons />
      <Footer />
    </main>
  )
}
