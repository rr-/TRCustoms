import { PageGuard } from "src/components/common/PermissionGuard";
import { SectionHeader } from "src/components/common/Section";
import { IconCheck } from "src/components/icons";
import { IconReject } from "src/components/icons";
import { usePageMetadata } from "src/contexts/PageMetadataContext";
import { UserPermission } from "src/services/UserService";

const ModerationGuidelinesPageView = () => {
  usePageMetadata(() => ({ ready: true, title: "Moderating Guidelines" }), []);

  return (
    <div className="ModerationGuidelinesPage">
      <h1>Moderating Guidelines</h1>
      <SectionHeader>Introduction</SectionHeader>
      <p>
        As a moderator, you have the ability to grant and revoke access to
        certain parts of the website. Additionally, you may edit certain pages
        that go against the Terms and Conditions. This document aims to guide
        you on how you can help manage the website.
      </p>

      <SectionHeader>Moderate Tab</SectionHeader>
      <p>
        The "Moderate" tab can be accessed from the navigation bar, it includes
        logs of actions ( such as new additions or changes) done on the website.
        Some of these logs will be labelled "Requires action", which means a
        moderator has to approve or reject this change or addition. You may
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
        User profiles that have content that goes against the Terms and
        Conditions must be edited immediately, and the content in question must
        be removed. Contact the administrator about the incident.
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

      <ul>
        <li>
          Southern America <IconReject />
        </li>
        <li>
          South America <IconCheck />
        </li>
      </ul>

      <ul>
        <li>
          3 Endings <IconReject />
        </li>
        <li>
          Multiple Endings <IconCheck />
        </li>
      </ul>

      <SectionHeader>Prohibited Content</SectionHeader>
      <p>
        Prohibited content is defined as content that should be IMMEDIATELY
        removed on sight. If you don't have the capability to remove this
        content, contact the administrator. Examples:
      </p>

      <ol>
        <li>Realistic-looking gore</li>
        <li>Nudity</li>
        <li>Sexual acts</li>
        <li>Explicit hardcore pornography</li>
        <li>Explicit sexualization of minors</li>
      </ol>

      <p>
        Points 1, 2, and 3 are allowed in levels, but cannot be displayed to the
        public on the level page. If they are present on the level page, the
        level must be rejected and the reason provided must mention the
        inclusion of appropriate tags (such as: Nudity, Gore, Sexual Acts).
      </p>

      <SectionHeader>Banning Members</SectionHeader>
      <p>
        Repeated offenders and trolls must be banned with a reason provided.
      </p>
    </div>
  );
};

const ModerationGuidelinesPage = () => {
  return (
    <PageGuard require={UserPermission.reviewAuditLogs}>
      <ModerationGuidelinesPageView />
    </PageGuard>
  );
};

export { ModerationGuidelinesPage };
