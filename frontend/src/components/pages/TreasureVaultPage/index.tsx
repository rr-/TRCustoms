import styles from "./index.module.css";
import { groupBy } from "lodash";
import { useState, useEffect } from "react";
import { Card, CardGrid } from "src/components/common/Card";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { AwardService, AwardSpec } from "src/services/AwardService";

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
  tiers: { tier: number; description: string }[];
}

interface StandardArtifact {
  code: string;
  name: string;
  description: string;
}

const getArtifactImageSrc = (code: string, tier?: number) =>
  tier && tier > 0 ? `/awards/${code}_${tier}.svg` : `/awards/${code}.svg`;

const ArtifactIcon = ({
  artifact,
  tier,
  variant,
}: {
  artifact: UpgradableArtifact | StandardArtifact;
  tier?: number;
  variant: "big" | "small";
}) => {
  return (
    <img
      className={`${styles.artifactIcon} ${styles[variant]}`}
      src={getArtifactImageSrc(artifact.code, tier)}
      alt={artifact.name}
    />
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
          description: spec.guide_description,
        })),
    }));

  const standardArtifacts: StandardArtifact[] = Object.values(specsByCode)
    .filter((group) => group.length === 1)
    .map((group) => ({
      code: group[0].code,
      name: group[0].title,
      description: group[0].guide_description,
    }));

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Upgradable items</SectionHeader>

        <CardGrid>
          {upgradableArtifacts.map((artifact) => (
            <Card key={artifact.code}>
              <ArtifactIcon
                artifact={artifact}
                tier={artifact.tiers[0].tier}
                variant="big"
              />
              <h3 className={styles.artifactName}>{artifact.name}</h3>
              <ul className={styles.list}>
                {artifact.tiers.map((tier) => (
                  <li key={tier.tier}>
                    <ArtifactIcon
                      artifact={artifact}
                      tier={tier.tier}
                      variant="small"
                    />
                    <strong className={styles.tier}>
                      {tierNames[tier.tier]} tier
                    </strong>
                    <p className={styles.guide}>{tier.description}</p>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </CardGrid>
      </Section>

      <Section>
        <SectionHeader>Standard items</SectionHeader>

        <CardGrid>
          {standardArtifacts.map((artifact) => (
            <Card key={artifact.code}>
              <h3 className={styles.artifactName}>{artifact.name}</h3>
              <ArtifactIcon artifact={artifact} variant="big" />
              <p className={styles.guide}>{artifact.description}</p>
            </Card>
          ))}
        </CardGrid>
      </Section>
    </SidebarLayout>
  );
};

export { TreasureVaultPage };
