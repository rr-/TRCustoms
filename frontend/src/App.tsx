import "./App.css";
import "./themes.css";
import { useEffect } from "react";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { NavBar } from "src/components/NavBar";
import { ScrollToTop } from "src/components/ScrollToTop";
import { AboutPage } from "src/components/pages/AboutPage";
import { EmailConfirmationPage } from "src/components/pages/EmailConfirmationPage";
import { Error403Page } from "src/components/pages/Error403Page";
import { Error404Page } from "src/components/pages/Error404Page";
import { GenreListPage } from "src/components/pages/GenreListPage";
import { HomePage } from "src/components/pages/HomePage";
import { LevelEditPage } from "src/components/pages/LevelEditPage";
import { LevelListPage } from "src/components/pages/LevelListPage";
import { LevelPage } from "src/components/pages/LevelPage";
import { LevelReviewEditPage } from "src/components/pages/LevelReviewEditPage";
import { LevelReviewPage } from "src/components/pages/LevelReviewPage";
import { LevelUploadPage } from "src/components/pages/LevelUploadPage";
import { LoginPage } from "src/components/pages/LoginPage";
import { LogoutPage } from "src/components/pages/LogoutPage";
import { ModerationGuidelinesPage } from "src/components/pages/ModerationGuidelinesPage";
import { ModerationPage } from "src/components/pages/ModerationPage";
import { MySubmissionsPage } from "src/components/pages/MySubmissionsPage";
import { NewsCreatePage } from "src/components/pages/NewsCreatePage";
import { NewsEditPage } from "src/components/pages/NewsEditPage";
import { PasswordResetFinishPage } from "src/components/pages/PasswordResetFinishPage";
import { PasswordResetPage } from "src/components/pages/PasswordResetPage";
import { RegisterPage } from "src/components/pages/RegisterPage";
import { SettingsPage } from "src/components/pages/SettingsPage";
import { TagListPage } from "src/components/pages/TagListPage";
import { TermsAndConditionsPage } from "src/components/pages/TermsAndConditionsPage";
import { TextFormattingGuidelinesPage } from "src/components/pages/TextFormattingGuidelinesPage";
import { UserEditPage } from "src/components/pages/UserEditPage";
import { UserListPage } from "src/components/pages/UserListPage";
import { UserPage } from "src/components/pages/UserPage";
import { ConfigContextProvider } from "src/contexts/ConfigContext";
import { useSettings } from "src/contexts/SettingsContext";
import { TitleContextProvider } from "src/contexts/TitleContext";
import { UserContextProvider } from "src/contexts/UserContext";

function App() {
  const { theme } = useSettings();

  useEffect(() => {
    document.documentElement.dataset.theme = theme.stub;
  }, [theme]);

  return (
    <TitleContextProvider>
      <ConfigContextProvider>
        <UserContextProvider>
          <ScrollToTop />
          <NavBar />
          <main id="Content" className="MainContainer">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mod" element={<ModerationPage />} />
              <Route
                path="/mod/how-to"
                element={<ModerationGuidelinesPage />}
              />
              <Route path="/levels/upload" element={<LevelUploadPage />} />
              <Route path="/levels" element={<LevelListPage />} />
              <Route path="/my-submissions" element={<MySubmissionsPage />} />
              <Route path="/levels/:levelId" element={<LevelPage />} />
              <Route
                path="/levels/:levelId/review"
                element={<LevelReviewPage />}
              />
              <Route
                path="/levels/:levelId/review/:reviewId/edit"
                element={<LevelReviewEditPage />}
              />
              <Route path="/news" element={<NewsCreatePage />} />
              <Route path="/news/:newsId/edit" element={<NewsEditPage />} />
              <Route path="/levels/:levelId/edit" element={<LevelEditPage />} />
              <Route path="/tags" element={<TagListPage />} />
              <Route path="/genres" element={<GenreListPage />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/logout" element={<LogoutPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/password-reset" element={<PasswordResetPage />} />
              <Route
                path="/password-reset/:token"
                element={<PasswordResetFinishPage />}
              />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/users/:userId" element={<UserPage />} />
              <Route path="/users/:userId/edit" element={<UserEditPage />} />
              <Route
                path="/email-confirmation/:token"
                element={<EmailConfirmationPage />}
              />
              <Route
                path="/text-formatting-guide"
                element={<TextFormattingGuidelinesPage />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/about/terms" element={<TermsAndConditionsPage />} />
              <Route path="/403" element={<Error403Page />} />
              <Route path="/404" element={<Error404Page />} />
              <Route path="*" element={<Error404Page />} />
            </Routes>
          </main>
        </UserContextProvider>
      </ConfigContextProvider>
    </TitleContextProvider>
  );
}

export default App;
