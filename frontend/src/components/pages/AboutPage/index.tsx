import { Link } from "react-router-dom";
import type { LegaleseEntry } from "src/components/common/NestedLegalese";
import { NestedLegalese } from "src/components/common/NestedLegalese";
import { usePageMetadata } from "src/contexts/PageMetadataContext";

const About: LegaleseEntry = {
  children: [
    {
      title: "What is TRCustoms.org?",
      description: (
        <>
          TRCustoms.org is a website that hosts custom Tomb Raider games created
          by the Tomb Raider Level Editor. Users can upload levels, review them,
          and more! Since our official launch on 2 April 2022, our aim was and
          will always be to preserve the amazing productions of the TRLE
          community so that nothing is lost to history.
          <br />
          The website currently runs on version{" "}
          <a
            href={`https://github.com/rr-/trcustoms/commit/${process.env.REACT_APP_BUILD_VERSION}`}
          >
            {process.env.REACT_APP_BUILD_VERSION}
          </a>{" "}
          built on {process.env.REACT_APP_BUILD_DATE}.
        </>
      ),
    },

    {
      title: "Terms and Conditions",
      description: (
        <>
          Terms and Conditions can be viewed <Link to="/about/terms">here</Link>
          .
        </>
      ),
    },

    {
      title: "FAQs",
      bullets: true,
      children: [
        {
          title: "Do I need to install TRLE to be able to play custom levels?",
          description:
            "No, all levels should be playable straight after downloading and unzipping them.",
        },
        {
          title: "How do I upload and review levels?",
          description:
            "A user account is required to upload and review levels.",
        },
        {
          title: "My TRLE.net profile is on TRCustoms.org, How can I claim it?",
          description:
            "Register using the same name as your TRLE.net profile and wait for moderators to contact you and confirm your identity.",
        },
        {
          title:
            "How are all levels, reviews, and user profiles from trle.net present on TRCustoms.org?",
          description:
            "We are using data downloaded from TRLE.net with approval from trle.net's webmaster.",
        },
        {
          title: "Can I upload mature/explicit content onto TRCustoms.org?",
          description:
            'Uploading mature/explicit content such as images and videos to be displayed in TRCustoms.org is prohibited, and may warrant the removal of the content and revocation of user rights. Mature content in uploaded levels is allowed given that it is tagged "Mature" / "Explicit" (depending on the content) and that the content itself is not considered illegal as per international laws.',
        },
        {
          title: "How can I collect items in my profile inventory?",
          description: (
            <>
              To find out how to collect items, click{" "}
              <Link to={`/about/trophies`}>here</Link> for a guide.
            </>
          ),
        },
      ],
    },

    {
      title: "Contact Us",
      description: (
        <>
          If you have any questions or inquiries, please do not hesitate to
          contact the site administrator at{" "}
          <a href="mailto:admin@trcustoms.org">admin@trcustoms.org</a>.
        </>
      ),
    },
  ],
};

const AboutPage = () => {
  usePageMetadata(() => ({ ready: true, title: "About" }), []);

  return (
    <div className="AboutPage">
      <NestedLegalese entry={About} />
    </div>
  );
};

export { AboutPage };
