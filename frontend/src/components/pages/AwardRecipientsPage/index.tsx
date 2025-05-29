import styles from "./index.module.css";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import AwardIcon from "src/components/common/AwardIcon";
import AwardRarityBar from "src/components/common/AwardRarityBar";
import type { DataTableColumn } from "src/components/common/DataTable";
import { DataTable } from "src/components/common/DataTable";
import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section, SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { UserPicLink } from "src/components/links/UserPicLink";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import type {
  AwardRecipient,
  AwardRecipientsSearchQuery,
  AwardSpec,
} from "src/services/AwardService";
import { AwardService } from "src/services/AwardService";
import { makeSentence } from "src/utils/string";
import { formatDate } from "src/utils/string";

const AwardRecipientsPage = () => {
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const code = searchParams.get("code") || "";
  const tierParam = searchParams.get("tier");
  const tier = tierParam !== null ? Number(tierParam) : undefined;

  const [specs, setSpecs] = useState<AwardSpec[]>([]);
  const [searchQuery, setSearchQuery] = useState<AwardRecipientsSearchQuery>({
    code,
    tier,
    page: 1,
  });

  useEffect(() => {
    setSearchQuery({ code, tier, page: 1 });
  }, [code, tier]);

  useEffect(() => {
    AwardService.getAwardSpecs().then(setSpecs);
  }, []);

  const currentSpec = useMemo(() => {
    const matches = specs.filter((spec) => spec.code === code);
    if (tier != null) {
      return matches.find((spec) => spec.tier === tier);
    }
    return matches[0];
  }, [specs, code, tier]);

  usePageMetadata(
    () => ({
      ready: true,
      title: currentSpec
        ? `Award details - ${currentSpec?.title}`
        : "Award details",
      description: "A list of users who received this award.",
    }),
    [currentSpec],
  );

  const columns: DataTableColumn<AwardRecipient>[] = [
    {
      name: "user",
      label: "User",
      itemElement: ({ item }) => <UserPicLink user={item.user} />,
    },
    {
      name: "created",
      label: "Award date",
      sortKey: "created",
      itemElement: ({ item }) => formatDate(item.created),
    },
  ];

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        {currentSpec && (
          <>
            <SectionHeader>
              <AwardIcon
                code={currentSpec.code}
                tier={currentSpec.tier}
                size="small"
                alt={currentSpec.title}
              />
              {currentSpec.title}
              {tier && (
                <> ({AwardService.getTierNames()[currentSpec.tier]} tier)</>
              )}
            </SectionHeader>
            <p className={styles.info}>
              {makeSentence(currentSpec.guide_description)}
            </p>
            <div className={styles.rarityBar}>
              <AwardRarityBar rarity={currentSpec.rarity / 100} />
            </div>
          </>
        )}

        <DataTable
          className={styles.table}
          queryName={`awardRecipients-${code}-${tier ?? ""}`}
          columns={columns}
          itemKey={(item) => `${item.user.id}`}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchFunc={AwardService.searchAwardRecipients}
        />
      </Section>
    </SidebarLayout>
  );
};

export { AwardRecipientsPage };
