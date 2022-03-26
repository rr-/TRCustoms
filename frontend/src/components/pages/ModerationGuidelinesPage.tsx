import "./ModerationGuidelinesPage.css";
import { useEffect } from "react";
import { useContext } from "react";
import { SectionHeader } from "src/components/Section";
import { IconCheck } from "src/components/icons";
import { IconReject } from "src/components/icons";
import { TitleContext } from "src/contexts/TitleContext";

const ModerationGuidelinesPage = () => {
  const { setTitle } = useContext(TitleContext);

  useEffect(() => {
    setTitle("Moderating Guidelines");
  }, [setTitle]);

  return (
    <div className="ModerationGuidelinesPage">
      <h1>Moderating Guidelines</h1>
      <SectionHeader>Introduction</SectionHeader>
      <p>
        As a moderator, you have the ability to give and revoke access to
        certain parts of the website. Additionally, you may edit certain pages
        that go against the Terms and Conditions. This document aims to guide
        you on how you can help manage the website.
      </p>

      <SectionHeader>Moderate Tab</SectionHeader>
      <p>
        You can also access the "Moderate" tab from the navigation bar. It
        includes all action logs of new additions or changes in the website.
        Some of these logs will be labelled "Requires action", which means a
        moderator has to approve or reject this change or addition. You may also
        search for specific action logs using the search filter, which also has
        a button to a list with all users.
      </p>

      <SectionHeader>Registrations</SectionHeader>
      <p>
        Newly registered users can generally be activated without any issue. If
        a user is claiming a trle.net user account, it will require a short
        collaborative investigation by the Mod team to confirm their identity
        using other platforms where they are known (social media, other forums,
        etc) and can be contacted.
      </p>

      <SectionHeader>Profiles</SectionHeader>
      <p>
        User profiles that contain anything that goes against the Terms and
        Conditions must edited immediately to omit the information. Contact the
        administrator about the incident.
      </p>

      <SectionHeader>Levels</SectionHeader>
      <p>
        If a newly uploaded level goes against our Terms and Conditions, you
        must reject it and mention the exact reason as to why so the author is
        able to edit their submission. When a level page is edited, it will
        appear in the action log in the Moderate tab so it can be checked. If a
        level page is clearly a troll page, contact the site admin so that the
        level can be removed.
      </p>

      <SectionHeader>Reviews</SectionHeader>
      <p>
        If the review contains profanity directed at an author or reviewer, or
        if it is a troll review, contact the site admin so that the review can
        be removed.
      </p>

      <SectionHeader>Tags</SectionHeader>
      <p>
        As level tags can be created by any author, they should be checked by
        mods. Unused tags expire automatically after a few hours when they are
        not being used, so you can leave them alone. You can rename tags that
        have incorrect spelling, wrong words, or anything that goes against our
        Terms and Conditions. You can merge tags that are too similar to each
        other. When merging, always choose the shorter form or the form that is
        more general. For example:
      </p>

      <ul className="ModerationGuidelinesPage--exampleList">
        <li>
          Southern America <IconReject />
        </li>
        <li>
          South America <IconCheck />
        </li>
      </ul>

      <ul className="ModerationGuidelinesPage--exampleList">
        <li>
          3 Endings <IconReject />
        </li>
        <li>
          Multiple Endings <IconCheck />
        </li>
      </ul>

      <SectionHeader>Banning Members</SectionHeader>
      <p>
        Repeated offenders and trolls must be banned with a reason provided.
      </p>
    </div>
  );
};

export { ModerationGuidelinesPage };
