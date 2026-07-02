import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AssessmentsHub = lazy(() => import('./pages/AssessmentsHub'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const WhyDreamsMantraPage = lazy(() => import('./pages/WhyDreamsMantraPage'));
const DMITPage = lazy(() => import('./pages/DMITPage'));
const PsychometricPage = lazy(() => import('./pages/PsychometricPage'));
const DMPsychometricPage = lazy(() => import('./pages/DMPsychometricPage'));
const ProgramPage = lazy(() => import('./pages/ProgramPage'));
const PartnerPage = lazy(() => import('./pages/PartnerPage'));
const CounsellingHub = lazy(() => import('./pages/CounsellingHub'));
const CounsellorsHub = lazy(() => import('./pages/CounsellorsHub'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PillarsPage = lazy(() => import('./pages/PillarsPage'));
const CRPExplorePage = lazy(() => import('./pages/CRPExplorePage'));
const CRPLaunchPage = lazy(() => import('./pages/CRPLaunchPage'));
const CRPPage = lazy(() => import('./pages/CRPPage'));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage'));
const UserDashboard = lazy(() => import('./pages/UserDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const CounsellorDashboard = lazy(() => import('./pages/CounsellorDashboard'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const MarketplaceHub = lazy(() => import('./pages/MarketplaceHub'));
const StudyAbroadHub = lazy(() => import('./pages/StudyAbroadHub'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
              <Route path="careers/:slug" element={<CareerDetailPage />} />
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
