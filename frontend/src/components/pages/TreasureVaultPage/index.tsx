import { ExtrasSidebar } from "src/components/common/ExtrasSidebar";
import { Section } from "src/components/common/Section";
import { SectionHeader } from "src/components/common/Section";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

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

  return (
    <SidebarLayout sidebar={<ExtrasSidebar />}>
      <Section>
        <SectionHeader>Treasure vault</SectionHeader>
        <p>Dummy content for the Treasure vault.</p>
      </Section>
    </SidebarLayout>
  );
};

export { TreasureVaultPage };
