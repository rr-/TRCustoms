import { Loader } from "src/components/common/Loader";
import { Error404Page } from "src/components/pages/ErrorPage";
import type { Features } from "src/services/ConfigService";
import { useConfig } from "src/stores/config";

interface FeaturePageGuardProps {
  feature: keyof Features;
  children: React.ReactNode;
}

const FeaturePageGuard = ({ feature, children }: FeaturePageGuardProps) => {
  const { config, isLoaded } = useConfig();
  if (!isLoaded) {
    return <Loader />;
  }
  return config.features[feature] ? <>{children}</> : <Error404Page />;
};

export { FeaturePageGuard };
