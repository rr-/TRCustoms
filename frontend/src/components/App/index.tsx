import styles from "./index.module.css";
import { useEffect } from "react";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { EnvironmentWatermark } from "src/components/common/EnvironmentWatermark";
import { NavBar } from "src/components/common/NavBar";
import { PageMetadata } from "src/components/common/PageMetadata";
import { AboutPage } from "src/components/pages/AboutPage";
import { AwardRecipientsPage } from "src/components/pages/AwardRecipientsPage";
import { EmailConfirmationPage } from "src/components/pages/EmailConfirmationPage";
import { Error403Page } from "src/components/pages/ErrorPage";
import { Error404Page } from "src/components/pages/ErrorPage";
import { EventCataloguePage } from "src/components/pages/EventCataloguePage";
import { EventPage } from "src/components/pages/EventPage";
import { HomePage } from "src/components/pages/HomePage";
import { LevelEditPage } from "src/components/pages/LevelEditPage";
import { LevelListPage } from "src/components/pages/LevelListPage";
import { LevelPage } from "src/components/pages/LevelPage";
import { LevelUploadPage } from "src/components/pages/LevelUploadPage";
import { LoginPage } from "src/components/pages/LoginPage";
import { LogoutPage } from "src/components/pages/LogoutPage";
import { ModerationGuidelinesPage } from "src/components/pages/ModerationGuidelinesPage";
import { ModerationPage } from "src/components/pages/ModerationPage";
import { NewsCreatePage } from "src/components/pages/NewsCreatePage";
import { NewsEditPage } from "src/components/pages/NewsEditPage";
import { NewsListPage } from "src/components/pages/NewsListPage";
import { NewsPage } from "src/components/pages/NewsPage";
import { PasswordResetFinishPage } from "src/components/pages/PasswordResetFinishPage";
import { PasswordResetPage } from "src/components/pages/PasswordResetPage";
import { RegisterPage } from "src/components/pages/RegisterPage";
import { ReviewAuthorsPage } from "src/components/pages/ReviewAuthorsPage";
import { ReviewLevelSuggestionsPage } from "src/components/pages/ReviewLevelSuggestionsPage";
import { ReviewListPage } from "src/components/pages/ReviewListPage";
import { SettingsPage } from "src/components/pages/SettingsPage";
import { TermsAndConditionsPage } from "src/components/pages/TermsAndConditionsPage";
import { TextFormattingGuidelinesPage } from "src/components/pages/TextFormattingGuidelinesPage";
import { TreasureVaultPage } from "src/components/pages/TreasureVaultPage";
import { UserDiscoveryPage } from "src/components/pages/UserDiscoveryPage";
import { UserEditPage } from "src/components/pages/UserEditPage";
import { UserListPage } from "src/components/pages/UserListPage";
import { UserPage } from "src/components/pages/UserPage";
import { WalkthroughEditPage } from "src/components/pages/WalkthroughEditPage";
import { WalkthroughPage } from "src/components/pages/WalkthroughPage";
import { ConfigContextProvider } from "src/contexts/ConfigContext";
import { useSettings } from "src/contexts/SettingsContext";
import { UserContextProvider } from "src/contexts/UserContext";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mod" element={<ModerationPage />} />
      <Route path="/mod/how-to" element={<ModerationGuidelinesPage />} />
      <Route path="/levels/upload" element={<LevelUploadPage />} />
      <Route
        path="/levels"
        element={<LevelListPage initialTabName="levels" />}
      />
      <Route path="/levels/:levelId" element={<LevelPage />} />
      <Route
        path="/levels/:levelId/ratings"
        element={<LevelPage tabName="ratings" />}
      />
      <Route
        path="/levels/:levelId/rating"
        element={<LevelPage tabName="ratings" action="addRating" />}
      />
      <Route
        path="/levels/:levelId/rating/:ratingId/edit"
        element={<LevelPage tabName="ratings" action="editRating" />}
      />
      <Route
        path="/levels/:levelId/reviews"
        element={<LevelPage tabName="reviews" />}
      />
      <Route
        path="/levels/:levelId/review"
        element={<LevelPage tabName="reviews" action="addReview" />}
      />
      <Route
        path="/levels/:levelId/review/:reviewId/edit"
        element={<LevelPage tabName="reviews" action="editReview" />}
      />
      <Route
        path="/levels/:levelId/walkthroughs"
        element={<LevelPage tabName="walkthroughs" />}
      />
      <Route
        path="/walkthroughs/:walkthroughId"
        element={<WalkthroughPage />}
      />
      <Route
        path="/levels/:levelId/walkthrough"
        element={<WalkthroughEditPage />}
      />
      <Route
        path="/levels/:levelId/walkthrough/:walkthroughId/edit"
        element={<WalkthroughEditPage />}
      />
      <Route
        path="/walkthroughs/:walkthroughId/edit"
        element={<WalkthroughEditPage />}
      />
      <Route path="/news" element={<NewsListPage />} />
      <Route path="/news/create" element={<NewsCreatePage />} />
      <Route path="/news/:newsId" element={<NewsPage />} />
      <Route path="/news/:newsId/edit" element={<NewsEditPage />} />
      <Route path="/levels/:levelId/edit" element={<LevelEditPage />} />
      <Route path="/tags" element={<LevelListPage initialTabName="tags" />} />
      <Route
        path="/genres"
        element={<LevelListPage initialTabName="genres" />}
      />
      <Route path="/reviews" element={<ReviewListPage />} />
      <Route path="/reviews/authors" element={<ReviewAuthorsPage />} />
      <Route
        path="/reviews/level_suggestions"
        element={<ReviewLevelSuggestionsPage />}
      />
      <Route path="/extras" element={<TreasureVaultPage />} />
      <Route path="/extras/treasure_vault" element={<TreasureVaultPage />} />
      <Route
        path="/extras/treasure_vault/award_recipients"
        element={<AwardRecipientsPage />}
      />
      <Route path="/extras/event_catalogue" element={<EventCataloguePage />} />
      <Route path="/extras/event/:eventId" element={<EventPage />} />
      <Route path="/extras/user_discovery" element={<UserDiscoveryPage />} />
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
      <Route
        path="/users/:userId/playlist"
        element={<UserPage tabName="playlist" />}
      />
      <Route
        path="/users/:userId/authored_levels"
        element={<UserPage tabName="authored_levels" />}
      />
      <Route
        path="/users/:userId/reviews"
        element={<UserPage tabName="reviews" />}
      />
      <Route
        path="/users/:userId/ratings"
        element={<UserPage tabName="ratings" />}
      />
      <Route
        path="/users/:userId/walkthroughs"
        element={<UserPage tabName="walkthroughs" />}
      />
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
  );
};

const App = () => {
  const { theme } = useSettings();

  useEffect(() => {
    document.documentElement.dataset.theme = theme.stub;
  }, [theme]);

  const classNames = [styles.content, styles.mainContainer];

  return (
    <ConfigContextProvider>
      <UserContextProvider>
        <EnvironmentWatermark>
          <PageMetadata />
          <NavBar />
          <main className={classNames.join(" ")}>
            <AppRoutes />
          </main>
        </EnvironmentWatermark>
      </UserContextProvider>
    </ConfigContextProvider>
  );
};

export default App;
