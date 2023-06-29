import { ReviewSearchSidebar } from "src/components/common/ReviewSearchSidebar";
import { SidebarLayout } from "src/components/layouts/SidebarLayout";

interface ReviewBasePageProps {
  children: React.ReactNode;
}

const ReviewBasePage = ({ children }: ReviewBasePageProps) => {
  return (
    <SidebarLayout sidebar={<ReviewSearchSidebar />}>{children}</SidebarLayout>
  );
};

export { ReviewBasePage };
