import "./index.css";
import { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { InfoMessage } from "src/components/common/InfoMessage";
import { InfoMessageType } from "src/components/common/InfoMessage";
import { LevelSidebar } from "src/components/common/LevelSidebar";
import { Loader } from "src/components/common/Loader";
import { MediumThumbnails } from "src/components/common/MediumThumbnails";
import { ReviewsList } from "src/components/common/ReviewsList";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SmartWrap } from "src/components/common/SmartWrap";
import { Markdown } from "src/components/markdown/Markdown";
import { DISABLE_PAGING } from "src/constants";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type { UploadedFile } from "src/services/FileService";
import { ExternalLinkType } from "src/services/LevelService";
import type { LevelDetails } from "src/services/LevelService";
import { LevelService } from "src/services/LevelService";
import type { ReviewSearchQuery } from "src/services/ReviewService";
import { DisplayMode } from "src/types";

interface LevelPageParams {
  levelId: string;
}

const LevelPage = () => {
  const { levelId } = (useParams() as unknown) as LevelPageParams;
  const [reviewCount, setReviewCount] = useState<number | undefined>();
  const [reviewsSearchQuery, setReviewsSearchQuery] = useState<
    ReviewSearchQuery
  >({
    levels: [+levelId],
    page: DISABLE_PAGING,
    sort: "-created",
    search: "",
  });

  const result = useQuery<LevelDetails, Error>(
    ["level", LevelService.getLevelById, levelId],
    async () => LevelService.getLevelById(+levelId)
  );

  usePageMetadata(
    () => ({
      ready: !result.isLoading,
      title: result.data?.name,
      image: result.data?.cover?.url,
      description: result.data?.authors
        ? `A custom Tomb Raider level by ${result.data?.authors.map(
            (author) => author.username
          )}`
        : `A custom Tomb Raider level.`,
    }),
    [result]
  );

  if (result.error) {
    return <p>{result.error.message}</p>;
  }

  if (result.isLoading || !result.data) {
    return <Loader />;
  }

  const level = result.data;

  const showcaseLinks = level.external_links
    .filter((link) => link.link_type === ExternalLinkType.Showcase)
    .map((link) => link.url);

  return (
    <div className="LevelPage">
      <header className="LevelPage--header">
        <h1 className="LevelPage--headerWrapper">
          <SmartWrap text={level.name} />
        </h1>
      </header>

      <aside className="LevelPage--sidebar">
        <LevelSidebar level={level} reviewCount={reviewCount} />
      </aside>

      <div className="LevelPage--main">
        {level.is_approved || (
          <InfoMessage type={InfoMessageType.Warning}>
            {level.rejection_reason ? (
              <>
                This level was rejected by staff. Reason:{" "}
                {level.rejection_reason}
              </>
            ) : (
              <>This level is currently pending approval.</>
            )}
          </InfoMessage>
        )}

        {!!level.screenshots.length && (
          <Section className="LevelPage--media">
            <MediumThumbnails
              displayMode={DisplayMode.Contain}
              files={level.screenshots
                .filter((screenshot) => !!screenshot.file)
                .map((screenshot) => screenshot.file as UploadedFile)}
              links={showcaseLinks}
            />
          </Section>
        )}

        <Section className="LevelPage--basicInfo">
          <SectionHeader>About the game</SectionHeader>
          {level.description ? (
            <Markdown>{level.description}</Markdown>
          ) : (
            <p>This level has no description yet.</p>
          )}
        </Section>

        <Section className="LevelPage--reviews">
          <SectionHeader>Reviews</SectionHeader>
          <ReviewsList
            showLevels={false}
            searchQuery={reviewsSearchQuery}
            onResultCountChange={setReviewCount}
            onSearchQueryChange={setReviewsSearchQuery}
          />
        </Section>
      </div>
    </div>
  );
};

export { LevelPage };
