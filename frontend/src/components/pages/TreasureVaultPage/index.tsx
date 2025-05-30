import styles from "./index.module.css";
import { groupBy } from "lodash";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AwardIcon from "src/components/common/AwardIcon";
import AwardRarityBar from "src/components/common/AwardRarityBar";
import { Card, CardGrid } from "src/components/common/Card";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { AwardService, AwardSpec } from "src/services/AwardService";
import { reprPercentage } from "src/utils/string";

// Mapping of tier numbers to human-readable names
const tierNames: { [tier: number]: string } = {
  1: "Bronze",
  2: "Silver",
  3: "Gold",
  4: "Jade",
  5: "Meteorite",
};

interface UpgradableArtifact {
  code: string;
  name: string;
  tiers: { tier: number; description: string; userPercentage: number }[];
}

interface StandardArtifact {
  code: string;
  name: string;
  description: string;
  userPercentage: number;
}

const ArtifactLink = ({
  artifact,
  tier,
  children,
}: {
  artifact: UpgradableArtifact | StandardArtifact;
  tier?: number;
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();

  const handleClick = () =>
    navigate(
      `/extras/treasure_vault/award_recipients?code=${artifact.code}${
        tier ? `&tier=${tier}` : ""
      }`,
    );

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleClick();
    }
  };

  return (
    <div
      className={styles.artifactLink}
      role="button"
      tabIndex={0}
      onKeyPress={handleKeyPress}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

// Card for an upgradable artifact: render all tier icons overlapped and
// control opacity via container dataset
const UpgradableArtifactCard = ({
  artifact,
}: {
  artifact: UpgradableArtifact;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (tierValue: number) => {
    if (containerRef.current) {
      containerRef.current.dataset.hoveredTier = tierValue.toString();
    }
  };
  const handleMouseLeave = () => {
    if (containerRef.current) {
      delete containerRef.current.dataset.hoveredTier;
    }
  };

  return (
    <Card>
      <div ref={containerRef} className={styles.awardStackContainer}>
        <div className={styles.awardStackInContainer}>
          {artifact.tiers.map(({ tier }) => (
            <AwardIcon
              key={tier}
              code={artifact.code}
              tier={tier}
              size="big"
              className={styles.stackedAward}
            />
          ))}
        </div>
      </div>
      <h3 className={styles.artifactName}>{artifact.name}</h3>
      <ul className={styles.list}>
        {artifact.tiers.map((tier) => (
          <li
            key={tier.tier}
            onMouseEnter={() => handleMouseEnter(tier.tier)}
            onMouseLeave={handleMouseLeave}
          >
            <ArtifactLink artifact={artifact} tier={tier.tier}>
              <strong className={styles.tierName}>
                <AwardIcon code={artifact.code} tier={tier.tier} size="small" />
                <span>{tierNames[tier.tier]} tier</span>
              </strong>
              <AwardRarityBar userPercentage={tier.userPercentage} />
            </ArtifactLink>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const TreasureVaultPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Treasure vault",
      description: "Explore the treasure vault.",
      image: "card-treasure_vault.jpg",
    }),
    [],
  );

  const [specs, setSpecs] = useState<AwardSpec[]>([]);

  useEffect(() => {
    AwardService.getAwardSpecs().then(setSpecs);
  }, []);

  const specsByCode = groupBy(specs, (spec) => spec.code);
  const upgradableArtifacts: UpgradableArtifact[] = Object.values(specsByCode)
    .filter((group) => group.length > 1)
    .map((group) => ({
      code: group[0].code,
      name: group[0].title,
      tiers: group
        .sort((a, b) => a.tier - b.tier)
        .map((spec) => ({
          tier: spec.tier,
          userPercentage: spec.user_percentage,
        })),
    }));

  const standardArtifacts: StandardArtifact[] = Object.values(specsByCode)
    .filter((group) => group.length === 1)
    .map((group) => ({
      code: group[0].code,
      name: group[0].title,
      userPercentage: group[0].user_percentage,
    }));

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Upgradable items</SectionHeader>

        <CardGrid>
          {upgradableArtifacts.map((artifact) => (
            <UpgradableArtifactCard key={artifact.code} artifact={artifact} />
          ))}
        </CardGrid>
      </Section>

      <Section>
        <SectionHeader>Standard items</SectionHeader>

        <CardGrid>
          {standardArtifacts.map((artifact) => (
            <Card key={artifact.code}>
              <ArtifactLink artifact={artifact}>
                <div className={styles.standardItem}>
                  <AwardIcon code={artifact.code} size="big" />
                  <h3 className={styles.artifactName}>{artifact.name}</h3>
                  <AwardRarityBar userPercentage={artifact.userPercentage} />
                </div>
              </ArtifactLink>
            </Card>
          ))}
        </CardGrid>
      </Section>
    </SidebarLayout>
  );
};

export { TreasureVaultPage };
