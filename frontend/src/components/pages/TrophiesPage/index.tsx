import styles from "./index.module.css";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { PlainLayout } from "src/components/layouts/PlainLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const UpgradableArtifacts = [
  {
    name: "Dragon Statue",
    tiers: [
      { name: "Bronze", description: "1+ Positive OR 3+ S. Positive levels" },
      { name: "Silver", description: "1+ V. Positive OR 3+ Positive levels" },
      { name: "Gold", description: "1+ O. Positive OR 5+ V. Positive levels" },
      { name: "Jade", description: "1+ Masterpiece OR 5+ O. Positive levels" },
      { name: "Meteorite", description: "3+ Masterpiece level" },
    ],
  },
  {
    name: "Amulet of Horus",
    tiers: [
      { name: "Bronze", description: "25 reviews + first 5 reviews" },
      { name: "Silver", description: "100 reviews + first 15 reviews" },
      { name: "Gold", description: "200 reviews + first 50 reviews" },
      { name: "Jade", description: "400 + first 100 reviews" },
      { name: "Meteorite", description: "800 + first 200 reviews" },
    ],
  },
  {
    name: "Scion",
    tiers: [
      { name: "Bronze", description: "50+ walkthroughs" },
      { name: "Silver", description: "100+ walkthroughs" },
      { name: "Gold", description: "250+ walkthroughs" },
      { name: "Jade", description: "500+ walkthroughs" },
      { name: "Meteorite", description: "1000+ walkthroughs" },
    ],
  },
];

const StandartArtifacts = [
  {
    name: "Dual Pistols",
    description: "Release 10 or more levels with at least mixed rating.",
  },
  { name: "Iris", description: "Submit 25 video walkthroughs." },
  { name: "Bestiary", description: "Submit 25 written walkthroughs." },
  {
    name: "Werner's Broken Glasses",
    description: "Be one of the first 20 reviewers for 500 levels.",
  },
  {
    name: "Philosopher's Stone",
    description:
      "Release two levels within the same year that have an overwhelmingly positive rating.",
  },
  {
    name: "Bone Dust",
    description: "Update all of your levels that were imported from TRLE.net.",
  },
  {
    name: "The Sanglyph",
    description:
      "Build 3 levels, review 30 levels, and release 10 walkthroughs.",
  },
];

const TrophiesPage = () => {
  usePageMetadata(
    () => ({
      ready: true,
      title: "Item collection guide",
      description:
        "A guide on how to collect item awards for your profile inventory.",
    }),
    []
  );

  const tiers = UpgradableArtifacts[0].tiers;

  return (
    <PlainLayout header="Item collection guide">
      <Section>
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
              {UpgradableArtifacts.map((artifact) => (
                <th
                  className={styles.upgradableArtifactsTableCell}
                  key={artifact.name}
                >
                  {artifact.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier) => (
              <tr
                className={styles.upgradableArtifactsTableRow}
                key={tier.name}
              >
                <td className={styles.upgradableArtifactsTableCell}>
                  {tier.name} tier
                </td>
                {UpgradableArtifacts.map((artifact) => (
                  <td
                    className={styles.upgradableArtifactsTableCell}
                    key={artifact.name}
                  >
                    {
                      artifact.tiers.filter((t) => t.name === tier.name)[0]
                        .description
                    }
                  </td>
                ))}
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

        {StandartArtifacts.map((artifact) => (
          <>
            <h3 className={styles.standardArtifactHeader}>{artifact.name}</h3>
            <p className={styles.standardArtifactDescription}>
              {artifact.description}
            </p>
          </>
        ))}
      </Section>
    </PlainLayout>
  );
};

export { TrophiesPage };
