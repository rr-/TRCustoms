import styles from "./index.module.css";
import { lazy, Suspense, useEffect, useContext } from "react";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { EnvironmentWatermark } from "src/components/common/EnvironmentWatermark";
import { Loader } from "src/components/common/Loader";
import { NavBar } from "src/components/common/NavBar";
import { PageMetadata } from "src/components/common/PageMetadata";
import {
  ConfigContextProvider,
  ConfigContext,
} from "src/contexts/ConfigContext";
import { UserContextProvider } from "src/contexts/UserContext";
import { useSettings } from "src/stores/settings";

// Each page is code-split into its own chunk so the initial bundle no longer
// ships every route. The pages use named exports, so unwrap the chosen name
// into the default export React.lazy expects.
const lazyPage = (
  factory: () => Promise<Record<string, React.ComponentType<any>>>,
  name: string,
) => lazy(() => factory().then((module) => ({ default: module[name] })));

const AboutPage = lazyPage(
  () => import("src/components/pages/AboutPage"),
  "AboutPage",
);
const AwardRecipientsPage = lazyPage(
  () => import("src/components/pages/AwardRecipientsPage"),
  "AwardRecipientsPage",
);
const EmailConfirmationPage = lazyPage(
  () => import("src/components/pages/EmailConfirmationPage"),
  "EmailConfirmationPage",
);
const Error403Page = lazyPage(
  () => import("src/components/pages/ErrorPage"),
  "Error403Page",
);
const Error404Page = lazyPage(
  () => import("src/components/pages/ErrorPage"),
  "Error404Page",
);
const EventCataloguePage = lazyPage(
  () => import("src/components/pages/EventCataloguePage"),
  "EventCataloguePage",
);
const EventPage = lazyPage(
  () => import("src/components/pages/EventPage"),
  "EventPage",
);
const HomePage = lazyPage(
  () => import("src/components/pages/HomePage"),
  "HomePage",
);
const LevelEditPage = lazyPage(
  () => import("src/components/pages/LevelEditPage"),
  "LevelEditPage",
);
const LevelListPage = lazyPage(
  () => import("src/components/pages/LevelListPage"),
  "LevelListPage",
);
const LevelPage = lazyPage(
  () => import("src/components/pages/LevelPage"),
  "LevelPage",
);
const LevelUploadPage = lazyPage(
  () => import("src/components/pages/LevelUploadPage"),
  "LevelUploadPage",
);
const LoginPage = lazyPage(
  () => import("src/components/pages/LoginPage"),
  "LoginPage",
);
const LogoutPage = lazyPage(
  () => import("src/components/pages/LogoutPage"),
  "LogoutPage",
);
const ModerationGuidelinesPage = lazyPage(
  () => import("src/components/pages/ModerationGuidelinesPage"),
  "ModerationGuidelinesPage",
);
const ModerationPage = lazyPage(
  () => import("src/components/pages/ModerationPage"),
  "ModerationPage",
);
const NewsCreatePage = lazyPage(
  () => import("src/components/pages/NewsCreatePage"),
  "NewsCreatePage",
);
const NewsEditPage = lazyPage(
  () => import("src/components/pages/NewsEditPage"),
  "NewsEditPage",
);
const NewsListPage = lazyPage(
  () => import("src/components/pages/NewsListPage"),
  "NewsListPage",
);
const NewsPage = lazyPage(
  () => import("src/components/pages/NewsPage"),
  "NewsPage",
);
const PasswordResetFinishPage = lazyPage(
  () => import("src/components/pages/PasswordResetFinishPage"),
  "PasswordResetFinishPage",
);
const PasswordResetPage = lazyPage(
  () => import("src/components/pages/PasswordResetPage"),
  "PasswordResetPage",
);
const RegisterPage = lazyPage(
  () => import("src/components/pages/RegisterPage"),
  "RegisterPage",
);
const ReviewAuthorsPage = lazyPage(
  () => import("src/components/pages/ReviewAuthorsPage"),
  "ReviewAuthorsPage",
);
const ReviewLevelSuggestionsPage = lazyPage(
  () => import("src/components/pages/ReviewLevelSuggestionsPage"),
  "ReviewLevelSuggestionsPage",
);
const ReviewListPage = lazyPage(
  () => import("src/components/pages/ReviewListPage"),
  "ReviewListPage",
);
const SettingsPage = lazyPage(
  () => import("src/components/pages/SettingsPage"),
  "SettingsPage",
);
const TermsAndConditionsPage = lazyPage(
  () => import("src/components/pages/TermsAndConditionsPage"),
  "TermsAndConditionsPage",
);
const TextFormattingGuidelinesPage = lazyPage(
  () => import("src/components/pages/TextFormattingGuidelinesPage"),
  "TextFormattingGuidelinesPage",
);
const TreasureVaultPage = lazyPage(
  () => import("src/components/pages/TreasureVaultPage"),
  "TreasureVaultPage",
);
const UserDiscoveryPage = lazyPage(
  () => import("src/components/pages/UserDiscoveryPage"),
  "UserDiscoveryPage",
);
const UserEditPage = lazyPage(
  () => import("src/components/pages/UserEditPage"),
  "UserEditPage",
);
const UserListPage = lazyPage(
  () => import("src/components/pages/UserListPage"),
  "UserListPage",
);
const UserPage = lazyPage(
  () => import("src/components/pages/UserPage"),
  "UserPage",
);
const WalkthroughEditPage = lazyPage(
  () => import("src/components/pages/WalkthroughEditPage"),
  "WalkthroughEditPage",
);
const WalkthroughPage = lazyPage(
  () => import("src/components/pages/WalkthroughPage"),
  "WalkthroughPage",
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
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
        <Route
          path="/extras/event_catalogue"
          element={<EventCataloguePage />}
        />
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
    </Suspense>
  );
};

const GlobalMessage = () => {
  const { config } = useContext(ConfigContext);
  return (
    <>
      {config.global_message && (
        <div className={styles.globalMessage}>{config.global_message}</div>
      )}
    </>
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
          <GlobalMessage />
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
