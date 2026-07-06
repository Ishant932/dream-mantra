import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

const Home = lazyWithRetry(() => import('./pages/Home'));
const About = lazyWithRetry(() => import('./pages/About'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Signup = lazyWithRetry(() => import('./pages/Signup'));
const AssessmentsHub = lazyWithRetry(() => import('./pages/AssessmentsHub'));
const AssessmentPage = lazyWithRetry(() => import('./pages/AssessmentPage'));
const WhyDreamsMantraPage = lazyWithRetry(() => import('./pages/WhyDreamsMantraPage'));
const DMITPage = lazyWithRetry(() => import('./pages/DMITPage'));
const PsychometricPage = lazyWithRetry(() => import('./pages/PsychometricPage'));
const DMPsychometricPage = lazyWithRetry(() => import('./pages/DMPsychometricPage'));
const ProgramPage = lazyWithRetry(() => import('./pages/ProgramPage'));
const PartnerPage = lazyWithRetry(() => import('./pages/PartnerPage'));
const CounsellingHub = lazyWithRetry(() => import('./pages/CounsellingHub'));
const CounsellorsHub = lazyWithRetry(() => import('./pages/CounsellorsHub'));
const CareersPage = lazyWithRetry(() => import('./pages/CareersPage'));
const DegreePathwaysPage = lazyWithRetry(() => import('./pages/DegreePathwaysPage'));
const PillarsPage = lazyWithRetry(() => import('./pages/PillarsPage'));
const CRPExplorePage = lazyWithRetry(() => import('./pages/CRPExplorePage'));
const CRPLaunchPage = lazyWithRetry(() => import('./pages/CRPLaunchPage'));
const CRPPage = lazyWithRetry(() => import('./pages/CRPPage'));
const CareerDetailPage = lazyWithRetry(() => import('./pages/CareerDetailPage'));
const BlogPage = lazyWithRetry(() => import('./pages/BlogPage'));
const BlogPostPage = lazyWithRetry(() => import('./pages/BlogPostPage'));
const UserDashboard = lazyWithRetry(() => import('./pages/UserDashboard'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const CounsellorDashboard = lazyWithRetry(() => import('./pages/CounsellorDashboard'));
const PaymentPage = lazyWithRetry(() => import('./pages/PaymentPage'));
const TestPage = lazyWithRetry(() => import('./pages/TestPage'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));
const MarketplaceHub = lazyWithRetry(() => import('./pages/MarketplaceHub'));
const StudyAbroadHub = lazyWithRetry(() => import('./pages/StudyAbroadHub'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));

function AuthPage({ children }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
        }
      >
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <ErrorBoundary>
        <BrowserRouter>
          <ScrollToTopOnNavigate />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="counselling" element={<CounsellingHub />} />
              <Route path="counsellors" element={<CounsellorsHub />} />
              <Route path="pillars" element={<PillarsPage />} />
              <Route path="crp" element={<CRPPage />} />
              <Route path="crp/explore" element={<CRPExplorePage />} />
              <Route path="crp/launch" element={<CRPLaunchPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="careers/pathways" element={<DegreePathwaysPage />} />
              <Route path="careers/:slug" element={<CareerDetailPage />} />
              <Route path="blog" element={<BlogPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />
              <Route path="marketplace" element={<MarketplaceHub />} />
              <Route path="study-abroad" element={<StudyAbroadHub />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="terms" element={<Terms />} />
              <Route path="privacy" element={<Privacy />} />
              <Route path="assessments" element={<AssessmentsHub />} />
              <Route path="assessments/dmit" element={<DMITPage />} />
              <Route path="assessments/psychometric" element={<PsychometricPage />} />
              <Route path="assessments/dmit-psychometric" element={<DMPsychometricPage />} />
              <Route path="assessments/why-dreams-mantra" element={<WhyDreamsMantraPage />} />
              <Route path="assessments/:slug" element={<AssessmentPage />} />
              <Route path="programs/:slug" element={<ProgramPage />} />
              <Route path="partner/:slug" element={<PartnerPage />} />
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute userOnly>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="payment/:assessmentId"
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="dashboard/test/:slug"
                element={
                  <ProtectedRoute>
                    <TestPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="counsellor"
                element={
                  <ProtectedRoute counsellorOnly>
                    <CounsellorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="items/*" element={<Navigate to="/" replace />} />
              <Route path="item/*" element={<Navigate to="/" replace />} />
              <Route path="product/*" element={<Navigate to="/" replace />} />
              <Route path="products/*" element={<Navigate to="/" replace />} />
              <Route path="shop/*" element={<Navigate to="/" replace />} />
              <Route path="store/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Route>
            <Route path="login" element={<AuthPage><Login /></AuthPage>} />
            <Route path="signup" element={<AuthPage><Signup /></AuthPage>} />
            <Route path="forgot-password" element={<AuthPage><ForgotPassword /></AuthPage>} />
          </Routes>
        </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}
