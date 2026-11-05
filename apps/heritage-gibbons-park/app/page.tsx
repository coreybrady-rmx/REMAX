import { DrawSchedule } from "@/components/DrawSchedule";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HomeOverview } from "@/components/HomeOverview";
import { InvestmentSummary } from "@/components/InvestmentSummary";
import { InvestorInquiry } from "@/components/InvestorInquiry";
import { LotOverview } from "@/components/LotOverview";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ProjectBudget } from "@/components/ProjectBudget";
import { ProjectTimeline } from "@/components/ProjectTimeline";
import { ReturnCalculator } from "@/components/ReturnCalculator";
import { ReturnsProvider } from "@/components/ReturnsProvider";
import { RiskDisclosure } from "@/components/RiskDisclosure";
import { SensitivityAnalysis } from "@/components/SensitivityAnalysis";

export default function Page() {
  const inquiryConfigured = Boolean(process.env.INQUIRY_ENDPOINT);

  return (
    <>
      <Header />
      <main>
        <Hero />
        <InvestmentSummary />
        <HomeOverview />
        <PhotoGallery />
        <LotOverview />
        <ProjectBudget />
        <ReturnsProvider>
          <DrawSchedule />
          <ReturnCalculator />
          <SensitivityAnalysis />
        </ReturnsProvider>
        <ProjectTimeline />
        <RiskDisclosure />
        <InvestorInquiry configured={inquiryConfigured} />
      </main>
      <Footer />
    </>
  );
}
