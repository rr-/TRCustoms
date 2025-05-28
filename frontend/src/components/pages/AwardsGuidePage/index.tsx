import styles from "./index.module.css";
import { groupBy } from "lodash";
import { useState, useEffect } from "react";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { PlainLayout } from "src/components/layouts/PlainLayout";
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

const AwardsGuidePage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Item collection guide",
      description:
        "A guide on how to collect item awards for your profile inventory.",
    }),
    [],
  );

  const [specs, setSpecs] = useState<AwardSpec[]>([]);

  useEffect(() => {
    AwardService.getAwardSpecs().then(setSpecs);
  }, []);

  const specsByCode = groupBy(
    specs.filter((spec) => !!spec.guide_description),
    (spec) => spec.code,
  );
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

  const tierList = Array.from(
    new Set(upgradableArtifacts.flatMap((a) => a.tiers.map((t) => t.tier))),
  ).sort((a, b) => a - b);

  return (
    <PlainLayout header="Item collection guide">
      <Section>
        <SectionHeader>Introduction</SectionHeader>
        <p>
          By accomplishing various feats and proving your worth, you may find
          yourself eligible to obtain a rare prized item that goes into your
          Inventory. These awards are highly coveted and come with a lasting
          impact on your profile. Take on the challenge and see if you have what
          it takes to earn one for yourself.
        </p>
      </Section>

      <Section>
        <SectionHeader>Upgradable items</SectionHeader>

        <p>
          As you advance in your journey, you may find yourself eligible for an
          upgradable reward. These recognitions come in tiers, each one more
          prestigious than the last.
        </p>
        <p>
          Here's a breakdown of specific requirements necessary to obtain and
          upgrade the items:
        </p>

        <table className={styles.upgradableArtifactsTable}>
          <thead>
            <tr className={styles.upgradableArtifactsTableHeader}>
              <th className={styles.upgradableArtifactsTableCell}>Tiers</th>
              {upgradableArtifacts.map((artifact) => (
                <th
                  className={styles.upgradableArtifactsTableCell}
                  key={artifact.code}
                >
                  <img
                    className={styles.artifactIcon}
                    src={getArtifactImageSrc(
                      artifact.code,
                      artifact.tiers[0].tier,
                    )}
                    alt={artifact.name}
                  />
                  {artifact.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tierList.map((tier) => (
              <tr className={styles.upgradableArtifactsTableRow} key={tier}>
                <td className={styles.upgradableArtifactsTableCell}>
                  {tierNames[tier]} tier
                </td>
                {upgradableArtifacts.map((artifact) => {
                  const tierInfo = artifact.tiers.find((t) => t.tier === tier);
                  return (
                    <td
                      className={styles.upgradableArtifactsTableCell}
                      key={artifact.code}
                    >
                      {tierInfo?.description}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section>
        <SectionHeader>Standard items</SectionHeader>

        <p>
          Whether it's for offering guidance to younger explorers or making an
          incredible level, these one-shot items can be obtained for a single,
          outstanding accomplishment.
        </p>

        {standardArtifacts.map((artifact) => (
          <div key={artifact.code}>
            <h3 className={styles.standardArtifactHeader}>
              <img
                className={styles.artifactIcon}
                src={getArtifactImageSrc(artifact.code)}
                alt={artifact.name}
              />
              {artifact.name}
            </h3>
            <p className={styles.standardArtifactDescription}>
              {artifact.description}
            </p>
          </div>
        ))}
      </Section>
    </PlainLayout>
  );
};

export { AwardsGuidePage };
